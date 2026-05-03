import { createClient } from '@supabase/supabase-js'
import { Platform } from 'react-native'

const fallbackStorage: Record<string, string> = {}

function getAsyncStorage() {
  try {
    return require('@react-native-async-storage/async-storage').default
  } catch (e) {
    console.warn('Failed to import @react-native-async-storage/async-storage lazily:', e)
    return null
  }
}

const safeStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (Platform.OS === 'web') {
        return typeof window !== 'undefined' ? window.localStorage.getItem(key) : null
      }
      const storage = getAsyncStorage()
      if (!storage) return fallbackStorage[key] || null
      return await storage.getItem(key)
    } catch (e) {
      console.warn('Supabase: AsyncStorage getItem failed, falling back to in-memory', e)
      return fallbackStorage[key] || null
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, value)
        }
        return
      }
      const storage = getAsyncStorage()
      if (!storage) {
        fallbackStorage[key] = value
        return
      }
      await storage.setItem(key, value)
    } catch (e) {
      console.warn('Supabase: AsyncStorage setItem failed, falling back to in-memory', e)
      fallbackStorage[key] = value
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(key)
        }
        return
      }
      const storage = getAsyncStorage()
      if (!storage) {
        delete fallbackStorage[key]
        return
      }
      await storage.removeItem(key)
    } catch (e) {
      console.warn('Supabase: AsyncStorage removeItem failed, falling back to in-memory', e)
      delete fallbackStorage[key]
    }
  }
}

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_KEY!,
  {
    auth: {
      storage: safeStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
)

