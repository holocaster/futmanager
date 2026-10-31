import { describe, expect, it } from 'vitest'
import { gerarRodadas } from './calendario'
import { novaCarreira } from './carreira'

const ids = Array.from({ length: 20 }, (_, i) => `c${i}`)

describe('gerarRodadas', () => {
  const rodadas = gerarRodadas(ids)

  it('tem 38 Rodadas de 10 Partidas', () => {
    expect(rodadas).toHaveLength(38)
    for (const r of rodadas) expect(r).toHaveLength(10)
  })

  it('cada Clube joga exatamente uma vez por Rodada', () => {
    for (const r of rodadas) {
      const jogando = r.flatMap(([casa, fora]) => [casa, fora])
      expect(new Set(jogando).size).toBe(20)
    }
  })

  it('cada Clube enfrenta cada adversario uma vez em casa e uma fora', () => {
    const pares = rodadas.flat().map(([casa, fora]) => `${casa}>${fora}`)
    expect(new Set(pares).size).toBe(380)
    for (const a of ids) for (const b of ids) if (a !== b) expect(pares).toContain(`${a}>${b}`)
  })

  it('o returno repete o turno com mando invertido', () => {
    for (let i = 0; i < 19; i++) {
      expect(rodadas[19 + i]).toEqual(rodadas[i].map(([casa, fora]) => [fora, casa]))
    }
  })

  it('ninguem joga mais de duas vezes seguidas em casa ou fora no turno', () => {
    for (const id of ids) {
      let seguidos = 0
      let anterior: boolean | null = null
      for (const r of rodadas.slice(0, 19)) {
        const emCasa = r.some(([casa]) => casa === id)
        seguidos = emCasa === anterior ? seguidos + 1 : 1
        anterior = emCasa
        expect(seguidos).toBeLessThanOrEqual(2)
      }
    }
  })
})

describe('calendario da Carreira', () => {
  const carreira = novaCarreira(5, 'flamengo')

  const divisao = carreira.calendario.filter((d) => d.tipo === 'divisao')

  it('guarda 38 datas de Divisao, cada uma com as Partidas das tres Divisoes sem resultado', () => {
    expect(divisao).toHaveLength(38)
    divisao.forEach((data, i) => {
      expect(data.rodada).toBe(i + 1)
      expect(data.partidas).toHaveLength(30)
      expect(data.partidas.every((j) => j.resultado === null)).toBe(true)
    })
    expect(carreira.proximaData).toBe(0)
  })

  it('cada Partida de Divisao e entre clubes da mesma Divisao', () => {
    const divisaoDe = new Map(carreira.clubes.map((c) => [c.id, c.divisao]))
    for (const j of divisao.flatMap((d) => d.partidas)) {
      expect(divisaoDe.get(j.casaId)).toBe(j.divisao)
      expect(divisaoDe.get(j.foraId)).toBe(j.divisao)
    }
  })

  it('o Pool nao joga as Divisoes', () => {
    const pool = new Set(carreira.clubes.filter((c) => c.divisao === 'D').map((c) => c.id))
    expect(divisao.flatMap((d) => d.partidas).some((j) => pool.has(j.casaId) || pool.has(j.foraId))).toBe(false)
  })

  it('tem 48 datas: 10 da Copa logo apos as Rodadas 3, 6, 9, 12, 15, 18, 24, 28, 32 e 36', () => {
    expect(carreira.calendario).toHaveLength(48)
    const copas = carreira.calendario.flatMap((d, i) => (d.tipo === 'copa' ? [i] : []))
    expect(copas).toEqual([3, 7, 11, 15, 19, 23, 30, 35, 40, 45])
    for (const i of copas) expect(carreira.calendario[i - 1]).toMatchObject({ tipo: 'divisao', rodada: [3, 6, 9, 12, 15, 18, 24, 28, 32, 36][copas.indexOf(i)] })
  })

  it('seeds diferentes geram calendarios diferentes', () => {
    expect(JSON.stringify(novaCarreira(6, 'flamengo').calendario)).not.toBe(JSON.stringify(carreira.calendario))
  })
})
