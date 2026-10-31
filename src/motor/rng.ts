import type { Rng } from './tipos'

export function criarRng(seed: number): Rng {
  return { estado: seed >>> 0 }
}

export function proximo(rng: Rng): number {
  rng.estado = (rng.estado + 0x6d2b79f5) >>> 0
  let t = rng.estado
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

export function inteiro(rng: Rng, min: number, max: number): number {
  return min + Math.floor(proximo(rng) * (max - min + 1))
}

export function escolher<T>(rng: Rng, itens: readonly T[]): T {
  return itens[inteiro(rng, 0, itens.length - 1)]
}

export function aproxNormal(rng: Rng): number {
  return proximo(rng) + proximo(rng) + proximo(rng) - 1.5
}

export function embaralhar<T>(rng: Rng, itens: readonly T[]): T[] {
  const copia = [...itens]
  for (let i = copia.length - 1; i > 0; i--) {
    const j = inteiro(rng, 0, i)
    ;[copia[i], copia[j]] = [copia[j], copia[i]]
  }
  return copia
}
