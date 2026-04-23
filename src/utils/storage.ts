/**
 * 存储类型枚举
 */
enum StorageType {
  Local = 'localStorage',
  Session = 'sessionStorage'
}

interface StoredValue<T = unknown> {
  value: T
  expire: number | null
}

function isBrowserStorageAvailable(type: StorageType): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  try {
    const storage = type === StorageType.Local ? window.localStorage : window.sessionStorage
    const probeKey = '__storage_probe__'
    storage.setItem(probeKey, '1')
    storage.removeItem(probeKey)
    return true
  } catch {
    return false
  }
}

class MemoryStorage implements Storage {
  private readonly store = new Map<string, string>()

  get length() {
    return this.store.size
  }

  clear(): void {
    this.store.clear()
  }

  getItem(key: string): string | null {
    return this.store.get(key) ?? null
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null
  }

  removeItem(key: string): void {
    this.store.delete(key)
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value)
  }
}

const memoryLocalStorage = new MemoryStorage()
const memorySessionStorage = new MemoryStorage()

function resolveStorage(type: StorageType): Storage {
  if (!isBrowserStorageAvailable(type)) {
    return type === StorageType.Local ? memoryLocalStorage : memorySessionStorage
  }

  return type === StorageType.Local ? window.localStorage : window.sessionStorage
}

/**
 * 存储工具类
 * 提供统一的 localStorage 和 sessionStorage 操作接口
 */
class StorageUtil {
  private readonly storage: Storage

  constructor(type: StorageType = StorageType.Local, customStorage?: Storage) {
    this.storage = customStorage ?? resolveStorage(type)
  }

  set(key: string, value: unknown, expireSeconds?: number): void {
    try {
      const expire = expireSeconds && expireSeconds > 0 ? Date.now() + expireSeconds * 1000 : null
      const payload: StoredValue = {
        value,
        expire
      }
      this.storage.setItem(key, JSON.stringify(payload))
    } catch (error) {
      console.error(`Storage set error for key "${key}":`, error)
    }
  }

  get<T = unknown>(key: string, defaultValue: T | null = null): T | null {
    try {
      const item = this.storage.getItem(key)
      if (item === null) {
        return defaultValue
      }

      const parsed = this.parseItem<T>(item)
      if (parsed.expired) {
        this.remove(key)
        return defaultValue
      }

      return parsed.value ?? defaultValue
    } catch (error) {
      console.error(`Storage get error for key "${key}":`, error)
      return defaultValue
    }
  }

  remove(key: string): void {
    try {
      this.storage.removeItem(key)
    } catch (error) {
      console.error(`Storage remove error for key "${key}":`, error)
    }
  }

  clear(): void {
    try {
      this.storage.clear()
    } catch (error) {
      console.error('Storage clear error:', error)
    }
  }

  size(): number {
    return this.keys().length
  }

  key(index: number): string | null {
    return this.keys()[index] ?? null
  }

  keys(): string[] {
    const keys: string[] = []

    for (let index = 0; index < this.storage.length; index++) {
      const key = this.storage.key(index)
      if (!key) {
        continue
      }

      const item = this.storage.getItem(key)
      if (item === null) {
        continue
      }

      const parsed = this.parseItem(item)
      if (parsed.expired) {
        this.remove(key)
        continue
      }

      keys.push(key)
    }

    return keys
  }

  has(key: string): boolean {
    const item = this.storage.getItem(key)
    if (item === null) {
      return false
    }

    const parsed = this.parseItem(item)
    if (parsed.expired) {
      this.remove(key)
      return false
    }

    return true
  }

  getAll(): Record<string, unknown> {
    const result: Record<string, unknown> = {}
    this.keys().forEach((key) => {
      result[key] = this.get(key)
    })
    return result
  }

  entries(): Array<[string, unknown]> {
    return this.keys().map((key) => [key, this.get(key)] satisfies [string, unknown])
  }

  setMany(items: Record<string, unknown>): void {
    Object.entries(items).forEach(([key, value]) => {
      this.set(key, value)
    })
  }

  getMany<T = unknown>(keys: string[]): Record<string, T | null> {
    const result: Record<string, T | null> = {}
    keys.forEach((key) => {
      result[key] = this.get<T>(key)
    })
    return result
  }

  removeMany(keys: string[]): void {
    keys.forEach((key) => {
      this.remove(key)
    })
  }

  private parseItem<T>(rawValue: string): { value: T | null; expired: boolean } {
    try {
      const parsed = JSON.parse(rawValue) as StoredValue<T>
      if (this.isStoredValue(parsed)) {
        return {
          value: parsed.value,
          expired: parsed.expire !== null && Date.now() > parsed.expire
        }
      }

      return {
        value: parsed as T,
        expired: false
      }
    } catch {
      return {
        value: rawValue as T,
        expired: false
      }
    }
  }

  private isStoredValue(value: unknown): value is StoredValue {
    return (
      typeof value === 'object' &&
      value !== null &&
      'value' in value &&
      'expire' in value &&
      ((value as StoredValue).expire === null || typeof (value as StoredValue).expire === 'number')
    )
  }
}

const localStore = new StorageUtil(StorageType.Local)
const sessionStore = new StorageUtil(StorageType.Session)

export const localStorage = localStore
export const sessionStorage = sessionStore
export { localStore, sessionStore, StorageUtil, StorageType }
export default localStore
