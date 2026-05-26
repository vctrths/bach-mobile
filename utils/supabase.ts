import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Platform } from 'react-native'
import { Database } from '@/types/supabase'

const fallbackStorage: Record<string, string> = {}

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
      return typeof window !== 'undefined' ? window.localStorage.getItem(key) : null
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
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, value)
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
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key)
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
    auth: {
      storage: safeStorage,
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

