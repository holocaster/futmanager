import type { ArmazenamentoSave } from './save'

export function memoria(limite = Infinity): ArmazenamentoSave & { itens: Map<string, string> } {
  const itens = new Map<string, string>()
  return {
    itens,
    getItem: (k) => itens.get(k) ?? null,
    setItem: (k, v) => {
      if (v.length > limite) throw new DOMException('cheio', 'QuotaExceededError')
      itens.set(k, v)
    },
    removeItem: (k) => void itens.delete(k),
  }
}
