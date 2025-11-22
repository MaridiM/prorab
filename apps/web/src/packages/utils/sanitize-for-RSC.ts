export function sanitizeForRSC(value: any): any {
    if (value == null) return value
    const t = typeof value
    if (t === 'string' || t === 'number' || t === 'boolean') return value
    if (t === 'bigint') return value.toString()
    if (value instanceof Date) return value.toISOString()
    if (value instanceof URL) return value.toString()
    if (value instanceof URLSearchParams) return Object.fromEntries(value)
    if (value instanceof Map) return Object.fromEntries(value)
    if (value instanceof Set) return Array.from(value)
    if (value instanceof Error) return { name: value.name, message: value.message }
  
    if (Array.isArray(value)) return value.map(sanitizeForRSC)
  
    const proto = Object.getPrototypeOf(value)
    if (proto !== Object.prototype && proto !== null) {
      const plain: Record<string, any> = {}
      for (const k of Object.keys(value)) plain[k] = sanitizeForRSC(value[k])
      return plain
    }
    if (proto === null) {
      const plain: Record<string, any> = {}
      for (const k of Object.keys(value)) plain[k] = sanitizeForRSC(value[k])
      return plain
    }
    const out: Record<string, any> = {}
    for (const k of Object.keys(value)) out[k] = sanitizeForRSC(value[k])
    return out
  }
