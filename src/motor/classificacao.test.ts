import { describe, expect, it } from 'vitest'
import { classificar } from './classificacao'
import type { PartidaAgendada } from './tipos'

const partida = (casaId: string, foraId: string, golsCasa: number, golsFora: number): PartidaAgendada => ({
  divisao: 'A',
  casaId,
  foraId,
  resultado: { golsCasa, golsFora },
})

const ordem = (ids: string[], partidas: PartidaAgendada[], desempate: Record<string, number> = {}) =>
  classificar(ids, partidas, desempate).map((l) => l.clubeId)

const antes = (ids: string[], a: string, b: string) => ids.indexOf(a) < ids.indexOf(b)

describe('classificar', () => {
  it('soma P, J, V, E, D, GP, GC e SG', () => {
    const linhas = classificar(['a', 'b', 'c'], [partida('a', 'b', 3, 1), partida('c', 'a', 2, 2), partida('b', 'c', 0, 1)], {})
    expect(linhas.find((l) => l.clubeId === 'a')).toMatchObject({ p: 4, j: 2, v: 1, e: 1, d: 0, gp: 5, gc: 3, sg: 2 })
    expect(linhas.find((l) => l.clubeId === 'b')).toMatchObject({ p: 0, j: 2, v: 0, e: 0, d: 2, gp: 1, gc: 4, sg: -3 })
    expect(linhas.find((l) => l.clubeId === 'c')).toMatchObject({ p: 4, j: 2, v: 1, e: 1, d: 0, gp: 3, gc: 2, sg: 1 })
  })

  it('ignora Partidas sem resultado', () => {
    const pendente: PartidaAgendada = { divisao: 'A', casaId: 'a', foraId: 'b', resultado: null }
    expect(classificar(['a', 'b'], [pendente], {}).every((l) => l.j === 0 && l.p === 0)).toBe(true)
  })

  it('criterio 1: pontos', () => {
    expect(ordem(['a', 'b'], [partida('a', 'b', 0, 1)])).toEqual(['b', 'a'])
  })

  it('criterio 2: vitorias, mesmo com saldo e gols pro piores', () => {
    const partidas = [partida('a', 'x', 1, 0), partida('y', 'a', 5, 0), partida('b', 'x', 0, 0), partida('b', 'y', 0, 0), partida('b', 'z', 0, 0)]
    expect(antes(ordem(['b', 'a', 'x', 'y', 'z'], partidas), 'a', 'b')).toBe(true)
  })

  it('criterio 3: saldo de gols, mesmo com menos gols pro', () => {
    const partidas = [partida('a', 'x', 2, 0), partida('y', 'a', 1, 0), partida('b', 'x', 4, 3), partida('y', 'b', 1, 0)]
    const linhas = classificar(['b', 'a', 'x', 'y'], partidas, {})
    expect(linhas.find((l) => l.clubeId === 'a')).toMatchObject({ p: 3, v: 1, sg: 1, gp: 2 })
    expect(linhas.find((l) => l.clubeId === 'b')).toMatchObject({ p: 3, v: 1, sg: 0, gp: 4 })
    expect(antes(linhas.map((l) => l.clubeId), 'a', 'b')).toBe(true)
  })

  it('criterio 4: gols pro', () => {
    const partidas = [partida('a', 'x', 1, 0), partida('y', 'a', 1, 0), partida('b', 'x', 3, 2), partida('y', 'b', 1, 0)]
    expect(antes(ordem(['a', 'b', 'x', 'y'], partidas), 'b', 'a')).toBe(true)
  })

  it('criterio 5: confronto direto por pontos, acima do sorteio', () => {
    const partidas = [partida('a', 'b', 1, 0), partida('y', 'a', 1, 0), partida('b', 'x', 1, 0)]
    const linhas = classificar(['b', 'a', 'x', 'y'], partidas, { a: 0.9, b: 0.1 })
    expect(linhas.find((l) => l.clubeId === 'a')).toMatchObject({ p: 3, v: 1, sg: 0, gp: 1 })
    expect(linhas.find((l) => l.clubeId === 'b')).toMatchObject({ p: 3, v: 1, sg: 0, gp: 1 })
    const ids = linhas.map((l) => l.clubeId)
    expect(ids.indexOf('a')).toBeLessThan(ids.indexOf('b'))
  })

  it('criterio 5: confronto direto empatado em pontos decide pelo saldo entre os dois', () => {
    const partidas = [partida('a', 'b', 2, 0), partida('b', 'a', 1, 0), partida('y', 'a', 3, 0), partida('z', 'b', 2, 1)]
    const linhas = classificar(['b', 'a', 'y', 'z'], partidas, { a: 0.9, b: 0.1 })
    expect(linhas.find((l) => l.clubeId === 'a')).toMatchObject({ p: 3, v: 1, sg: -2, gp: 2 })
    expect(linhas.find((l) => l.clubeId === 'b')).toMatchObject({ p: 3, v: 1, sg: -2, gp: 2 })
    const ids = linhas.map((l) => l.clubeId)
    expect(ids.indexOf('a')).toBeLessThan(ids.indexOf('b'))
  })

  it('criterio 5: confronto direto entre tres clubes empatados', () => {
    const partidas = [
      partida('a', 'b', 1, 0), partida('a', 'c', 1, 0), partida('b', 'c', 1, 0),
      partida('y', 'a', 2, 0), partida('b', 'x', 1, 0), partida('z', 'b', 1, 0),
      partida('c', 'x', 1, 0), partida('c', 'y', 1, 0),
    ]
    const linhas = classificar(['c', 'b', 'a', 'x', 'y', 'z'], partidas, { a: 0.9, b: 0.5, c: 0.1 })
    for (const id of ['a', 'b', 'c']) expect(linhas.find((l) => l.clubeId === id)).toMatchObject({ p: 6, v: 2, sg: 0, gp: 2 })
    const ids = linhas.map((l) => l.clubeId)
    expect(ids.indexOf('a')).toBeLessThan(ids.indexOf('b'))
    expect(ids.indexOf('b')).toBeLessThan(ids.indexOf('c'))
  })

  it('criterio 5: confronto direto circular cai no sorteio', () => {
    const partidas = [partida('a', 'b', 1, 0), partida('b', 'c', 1, 0), partida('c', 'a', 1, 0)]
    expect(ordem(['a', 'b', 'c'], partidas, { a: 0.7, b: 0.2, c: 0.5 })).toEqual(['b', 'c', 'a'])
  })

  it('criterio 6: sorteio pelo RNG quando tudo empata, de forma deterministica', () => {
    const desempate = { a: 0.7, b: 0.2, c: 0.5 }
    expect(ordem(['a', 'b', 'c'], [], desempate)).toEqual(['b', 'c', 'a'])
    expect(ordem(['c', 'a', 'b'], [], desempate)).toEqual(['b', 'c', 'a'])
  })
})
