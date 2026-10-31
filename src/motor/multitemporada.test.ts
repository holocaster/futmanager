import { expect, it } from 'vitest'
import { carregar, salvar } from '../save'
import { memoria } from '../save.test-helpers'
import { novaCarreira } from './carreira'
import { classificacao } from './classificacao'
import { folhaMensal, premioDaPosicao } from './financas'
import { valorDe } from './mercado'
import { avancarMinuto, finalizarRodada, iniciarRodada, simularRodada } from './rodada'
import { aplicarEscalacaoAutomatica, disponivel } from './tatica'
import { fimDeTemporada } from './temporada'
import type { Carreira, Divisao, Jogador } from './tipos'

const DIVISOES: Divisao[] = ['A', 'B', 'C', 'D']
const media = (jogadores: Jogador[]) => jogadores.reduce((s, j) => s + j.forca, 0) / jogadores.length
const forcas = (c: Carreira) => ({
  divisao: Object.fromEntries(DIVISOES.map((d) => [d, media(Object.values(c.jogadores).filter((j) => c.clubes.find((clube) => clube.id === j.clubeId)!.divisao === d))])),
  porte: Object.fromEntries([1, 2, 3, 4, 5].map((p) => [p, media(Object.values(c.jogadores).filter((j) => c.clubes.find((clube) => clube.id === j.clubeId)!.porte === p))])),
})

function invariantes(c: Carreira, minimo: number) {
  const ids = new Set(c.clubes.map((clube) => clube.id))
  const elencos = new Map(c.clubes.map((clube) => [clube.id, [] as Jogador[]]))
  for (const [id, j] of Object.entries(c.jogadores)) {
    if (id !== j.id || !ids.has(j.clubeId) || ![j.forca, j.potencial, j.salario, valorDe(j), j.condicao, j.moral, j.idade, j.contratoAte, j.lesao, j.suspensao, j.amarelos, ...Object.values(j.stats)].every(Number.isFinite)
      || j.forca < 1 || j.forca > 99 || j.potencial < j.forca || j.potencial > 99 || j.condicao < 0 || j.condicao > 100 || j.moral < 0 || j.moral > 100 || j.salario <= 0 || j.idade < 17 || j.idade >= 38 || j.contratoAte < c.ano || j.contratoAte > c.ano + 5 || j.lesao < 0 || j.lesao > 6 || j.suspensao < 0 || j.amarelos < 0 || j.amarelos > 2 || Object.values(j.stats).some((v) => v < 0)) throw new Error(`Jogador invalido: ${c.ano}/${c.proximaData}/${id}`)
    elencos.get(j.clubeId)!.push(j)
  }
  for (const clube of c.clubes) {
    const elenco = elencos.get(clube.id)!
    if (elenco.length < minimo || elenco.length > 32 || elenco.filter((j) => j.posicao === 'G').length < 2 || ![clube.saldo, ...Object.values(clube.extrato)].every(Number.isFinite)) throw new Error(`Clube invalido: ${c.ano}/${c.proximaData}/${clube.id}`)
  }
  expect(new Set(Object.values(c.jogadores).map((j) => j.id)).size).toBe(Object.keys(c.jogadores).length)
  expect(c.propostas.every((p) => ids.has(p.compradorId) && c.jogadores[p.jogadorId]?.clubeId === c.clubeId && Number.isFinite(p.valor))).toBe(true)
  expect(c.transferencias.every((t) => ids.has(t.deId) && ids.has(t.paraId) && Number.isFinite(t.valor))).toBe(true)
  expect(c.artilharia.every((a) => ids.has(a.clubeId) && Number.isInteger(a.gols) && a.gols >= 0 && a.partidas > 0)).toBe(true)
}

it.each([[1, 'flamengo'], [8, 'ceara'], [42, 'guarani']] as const)('10 Temporadas integradas: seed %i/%s', (seed, clubeId) => {
  const inicio = performance.now()
  const c = novaCarreira(seed, clubeId)
  const inicial = forcas(c)
  const medidas = []
  let jsonCinco = ''
  let bytes = 0
  let envelopeBytes = 0
  for (let temporada = 1; temporada <= 10; temporada++) {
    const transferencias = { A: 0, B: 0, C: 0, D: 0 }
    const vendas = { A: 0, B: 0, C: 0, D: 0 }
    while (c.proximaData < 48) {
      aplicarEscalacaoAutomatica(c)
      const antes = new Set(c.transferencias)
      const rodada = iniciarRodada(c)
      for (const p of rodada.partidas) for (const lado of [p.casa, p.fora]) {
        expect(lado.titulares.every(disponivel) && lado.banco.every(disponivel)).toBe(true)
        expect(new Set([...lado.titulares, ...lado.banco].map((j) => j.id)).size).toBe(lado.titulares.length + lado.banco.length)
      }
      while (rodada.minuto < 90) avancarMinuto(c, rodada)
      finalizarRodada(c, rodada)
      const data = c.calendario[c.proximaData - 1]
      expect(data.partidas.every((p) => p.resultado && [p.resultado.golsCasa, p.resultado.golsFora].every((n) => Number.isInteger(n) && n >= 0))).toBe(true)
      expect(c.proximaData).toBe(rodada.data + 1)
      const novas = c.transferencias.filter((t) => !antes.has(t))
      for (const t of novas) {
        expect(t.deId).not.toBe(clubeId)
        expect(t.paraId).not.toBe(clubeId)
        transferencias[c.clubes.find((clube) => clube.id === t.paraId)!.divisao]++
        vendas[c.clubes.find((clube) => clube.id === t.deId)!.divisao]++
      }
      for (const [id, destino] of new Map(novas.map((t) => [t.jogadorId, t.paraId]))) expect(c.jogadores[id].clubeId).toBe(destino)
      invariantes(c, 16)
    }
    const grupos = DIVISOES.map((d) => {
      const clubes = c.clubes.filter((clube) => clube.divisao === d)
      const somar = (categoria: keyof typeof clubes[number]['extrato']) => clubes.reduce((s, clube) => s + clube.extrato[categoria], 0)
      const premioFinal = d === 'D' ? 0 : classificacao(c, d).reduce((s, _l, i) => s + premioDaPosicao(d, i + 1), 0)
      return { divisao: d, folha: clubes.reduce((s, clube) => s + folhaMensal(c, clube.id), 0), saldo: clubes.reduce((s, clube) => s + clube.saldo, 0) + premioFinal, salarios: somar('salarios'), patrocinio: somar('patrocinio'), bilheteria: somar('bilheteria'), premiacao: somar('premiacao') + premioFinal, transferencias: somar('transferencias'), negativosIA: clubes.filter((clube) => clube.id !== clubeId && clube.saldo + (d === 'D' ? 0 : premioDaPosicao(d, classificacao(c, d).findIndex((l) => l.clubeId === clube.id) + 1)) < 0).length, compras: transferencias[d], vendas: vendas[d] }
    })
    const historico = JSON.stringify(c.historico)
    const desempate = JSON.stringify(c.desempate)
    const resumo = fimDeTemporada(c)
    expect(c.historico.slice(0, -1)).toEqual(JSON.parse(historico))
    expect(c.historico).toHaveLength(temporada)
    expect(c.ano).toBe(2026 + temporada)
    expect(resumo.ano).toBe(c.ano - 1)
    expect(c.proximaData).toBe(0)
    expect(DIVISOES.map((d) => c.clubes.filter((clube) => clube.divisao === d).length)).toEqual([20, 20, 20, 8])
    expect(c.calendario).toHaveLength(48)
    expect(c.calendario.every((d) => d.partidas.every((p) => p.resultado === null))).toBe(true)
    expect(new Set(c.copa.participantes).size).toBe(64)
    expect(c.copa.fases[0]).toHaveLength(32)
    expect(JSON.stringify(c.desempate)).not.toBe(desempate)
    expect(c.artilharia).toEqual([])
    expect(Object.values(c.jogadores).every((j) => j.amarelos === 0 && j.suspensao === 0 && Object.values(j.stats).every((v) => v === 0))).toBe(true)
    expect(c.clubes.every((clube) => Object.values(clube.extrato).every((v) => v === 0))).toBe(true)
    invariantes(c, 22)
    const forca = forcas(c)
    for (const d of DIVISOES) expect(Math.abs(forca.divisao[d] - inicial.divisao[d]), `${temporada}/${d}`).toBeLessThanOrEqual(15)
    medidas.push({ temporada, grupos, forca })
    if (temporada === 5) {
      jsonCinco = JSON.stringify(c)
      bytes = new TextEncoder().encode(jsonCinco).length
      const storage = memoria()
      expect(salvar(storage, 1, c)).toBeNull()
      envelopeBytes = new TextEncoder().encode(storage.getItem('futmanager:save:1')!).length
      const carregada = carregar(storage, 1)!
      expect(JSON.stringify(carregada)).toBe(jsonCinco)
      const continuacao = JSON.parse(jsonCinco) as Carreira
      aplicarEscalacaoAutomatica(continuacao)
      aplicarEscalacaoAutomatica(carregada)
      simularRodada(continuacao)
      simularRodada(carregada)
      expect(JSON.stringify(carregada)).toBe(JSON.stringify(continuacao))
    }
  }
  if (seed === 42) {
    const repetida = novaCarreira(seed, clubeId)
    for (let t = 0; t < 5; t++) {
      while (repetida.proximaData < 48) {
        aplicarEscalacaoAutomatica(repetida)
        simularRodada(repetida)
      }
      fimDeTemporada(repetida)
    }
    expect(JSON.stringify(repetida)).toBe(jsonCinco)
  }
  console.log(JSON.stringify({ seed, clubeId, segundos: (performance.now() - inicio) / 1000, bytes, envelopeBytes, inicial, medidas }))
  expect(bytes).toBeLessThan(2_000_000)
  const ultimas = medidas.slice(7)
  for (const m of ultimas) expect(m.grupos.reduce((s, g) => s + g.compras, 0), `Temporada ${m.temporada}`).toBeGreaterThanOrEqual(1)
  expect(ultimas.reduce((s, m) => {
    const pool = m.grupos.find((g) => g.divisao === 'D')!
    return s + pool.salarios + pool.patrocinio + pool.bilheteria + pool.premiacao
  }, 0) / 3).toBeGreaterThanOrEqual(0)
}, 120000)
