import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Platform } from 'react-native'
import { Database } from '@/types/supabase'

const fallbackStorage: Record<string, string> = {}
const SUPABASE_FETCH_TIMEOUT_MS = 8000
const SUPABASE_RELOAD_GUARD_MS = 10000
const SUPABASE_RELOAD_GUARD_KEY = "groen:last-supabase-timeout-reload"

const getFetchUrl = (input: Parameters<typeof fetch>[0]) => {
  if (typeof input === 'string') return input
  if (input instanceof URL) return input.toString()
  return input.url
}

const supabaseFetch = async (
  input: Parameters<typeof fetch>[0],
  init?: Parameters<typeof fetch>[1],
): Promise<Response> => {
  if (typeof AbortController === 'undefined') {
    return fetch(input, init)
  }

  const controller = new AbortController()
  const originalSignal = init?.signal
  let didTimeout = false

  const timeoutId = setTimeout(() => {
    didTimeout = true
    controller.abort()
  }, SUPABASE_FETCH_TIMEOUT_MS)

  if (originalSignal) {
    if (originalSignal.aborted) {
      controller.abort()
    } else {
      originalSignal.addEventListener('abort', () => controller.abort(), {
        once: true,
      })
    }
  }

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    })
  } catch (error) {
    if (didTimeout) {
      console.warn("[supabase] fetch timed out and was aborted", {
        timeoutMs: SUPABASE_FETCH_TIMEOUT_MS,
        url: getFetchUrl(input),
      })
      hardReloadWebAfterSupabaseTimeout("Supabase fetch timed out")
      throw new Error("Supabase fetch timeout")
    }

    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}

export function hardReloadWebAfterSupabaseTimeout(reason: string) {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return false
  }

  try {
    const now = Date.now()
    const lastReload = Number(
      window.sessionStorage.getItem(SUPABASE_RELOAD_GUARD_KEY) ?? 0,
    )

    if (now - lastReload < SUPABASE_RELOAD_GUARD_MS) {
      console.warn("[supabase] skipped hard reload to avoid a reload loop", {
        reason,
        msSinceLastReload: now - lastReload,
      })
      return false
    }

    window.sessionStorage.setItem(SUPABASE_RELOAD_GUARD_KEY, String(now))
  } catch (error) {
    console.warn("[supabase] reload guard storage failed:", error)
  }

  console.warn("[supabase] forcing hard reload after stalled request", {
    reason,
  })
  window.location.reload()
  return true
}

function getAsyncStorage() {
  if (Platform.OS === 'web') return null
  try {
    const storage = require('@react-native-async-storage/async-storage').default
    // If we're on native but the module is null/undefined (e.g. not linked)
    if (!storage) return null
    return storage
  } catch (e) {
    // Silent catch as we have fallbackStorage
    return null
  }
}

const safeStorage = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      try {
        return typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
      } catch (e) {
        console.warn("[supabase] safeStorage.getItem error on web:", e);
        return fallbackStorage[key] || null;
      }
    }
    try {
      const storage = getAsyncStorage()
      if (!storage) return fallbackStorage[key] || null
      return await storage.getItem(key)
    } catch (e) {
      return fallbackStorage[key] || null
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      try {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, value)
        }
      } catch (e) {
        console.warn("[supabase] safeStorage.setItem error on web:", e);
        fallbackStorage[key] = value;
      }
      return
    }
    try {
      const storage = getAsyncStorage()
      if (!storage) {
        fallbackStorage[key] = value
        return
      }
      await storage.setItem(key, value)
    } catch (e) {
      fallbackStorage[key] = value
    }
  },
  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS === 'web') {
      try {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(key)
        }
      } catch (e) {
        console.warn("[supabase] safeStorage.removeItem error on web:", e);
        delete fallbackStorage[key];
      }
      return
    }
    try {
      const storage = getAsyncStorage()
      if (!storage) {
        delete fallbackStorage[key]
        return
      }
      await storage.removeItem(key)
    } catch (e) {
      delete fallbackStorage[key]
    }
  }
}

let _client: SupabaseClient<Database> | null = null

function getSupabase(): SupabaseClient<Database> {
  if (_client) return _client

  const url = process.env.EXPO_PUBLIC_SUPABASE_URL
  const key = process.env.EXPO_PUBLIC_SUPABASE_KEY

  if (!url || !key) {
    throw new Error(
      "Supabase credentials not found. Ensure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_KEY are set."
    )
  }

  _client = createClient<Database>(url, key, {
    global: {
      fetch: supabaseFetch as typeof fetch,
    },
    auth: {
      storage: Platform.OS === 'web' ? undefined : safeStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  })

  return _client
}

export const supabase = new Proxy({} as SupabaseClient<Database>, {
  get(_target, prop) {
    const client = getSupabase()
    const value = (client as any)[prop]
    return typeof value === 'function' ? value.bind(client) : value
  },
})

/**
 * Maps snake_case database object to camelCase frontend object
 */
export function toCamelCase<T>(obj: any): T {
  if (Array.isArray(obj)) {
    return obj.map((v) => toCamelCase<any>(v)) as any;
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      const camelKey = key.replace(/([-_][a-z])/gi, ($1) =>
        $1.toUpperCase().replace("-", "").replace("_", "")
      );
      (result as any)[camelKey] = toCamelCase(obj[key]);
      return result;
    }, {} as T);
  }
  return obj;
}
