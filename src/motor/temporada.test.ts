import { describe, expect, it } from 'vitest'
import { novaCarreira, SALDO_INICIAL } from './carreira'
import { artilheiros, artilheirosCopa, classificacao } from './classificacao'
import { premioDaPosicao } from './financas'
import { simularRodada, tecnicoJogaNaProximaData } from './rodada'
import { aplicarEscalacaoAutomatica, validarEscalacao } from './tatica'
import { fimDeTemporada } from './temporada'
import type { Carreira, Divisao, DivisaoJogavel } from './tipos'

const DIVISOES: DivisaoJogavel[] = ['A', 'B', 'C']

function jogarTemporada(carreira: Carreira): void {
  while (carreira.proximaData < carreira.calendario.length) {
    aplicarEscalacaoAutomatica(carreira)
    simularRodada(carreira)
  }
}

const clubesDa = (carreira: Carreira, divisao: Divisao) => carreira.clubes.filter((c) => c.divisao === divisao).map((c) => c.id)

function afundar(carreira: Carreira, clubeId: string): void {
  for (const d of carreira.calendario) {
    if (d.tipo !== 'divisao') continue
    for (const p of d.partidas) {
      if (p.casaId === clubeId) p.resultado = { golsCasa: 0, golsFora: 9 }
      if (p.foraId === clubeId) p.resultado = { golsCasa: 9, golsFora: 0 }
    }
  }
}

describe('fimDeTemporada', () => {
  it('so roda depois da ultima data', () => {
    expect(() => fimDeTemporada(novaCarreira(1, 'flamengo'))).toThrow()
  })

  it('4 sobem e 4 descem em cada fronteira e as Divisoes seguem com 20 e o Pool com 8', () => {
    const carreira = novaCarreira(11, 'flamengo')
    jogarTemporada(carreira)
    const ordem = Object.fromEntries(DIVISOES.map((d) => [d, classificacao(carreira, d).map((l) => l.clubeId)]))
    const pool = clubesDa(carreira, 'D')
    fimDeTemporada(carreira)
    const depois = Object.fromEntries((['A', 'B', 'C', 'D'] as Divisao[]).map((d) => [d, new Set(clubesDa(carreira, d))]))
    expect(depois.A).toEqual(new Set([...ordem.A.slice(0, 16), ...ordem.B.slice(0, 4)]))
    expect(depois.B).toEqual(new Set([...ordem.A.slice(16), ...ordem.B.slice(4, 16), ...ordem.C.slice(0, 4)]))
    expect(ordem.B.slice(16).every((id) => depois.C.has(id))).toBe(true)
    expect(ordem.C.slice(16).every((id) => depois.D.has(id))).toBe(true)
    expect(ordem.C.slice(4, 16).every((id) => depois.C.has(id))).toBe(true)
    expect(depois.C.size).toBe(20)
    expect(depois.D.size).toBe(8)
    expect([...depois.C].filter((id) => pool.includes(id))).toHaveLength(4)
  }, 30000)

  it('o Historico registra campeoes, artilheiros, tabelas finais, acessos e rebaixamentos', () => {
    const carreira = novaCarreira(12, 'santos')
    jogarTemporada(carreira)
    const esperado = {
      tabelas: Object.fromEntries(DIVISOES.map((d) => [d, classificacao(carreira, d)])),
      artilheiros: Object.fromEntries(DIVISOES.map((d) => [d, artilheiros(carreira, d, 1)[0]])),
      artilheiroCopa: artilheirosCopa(carreira, 1)[0],
      campeaoCopa: carreira.copa.campeaoId,
    }
    const resumo = fimDeTemporada(carreira)
    expect(carreira.historico).toEqual([resumo])
    expect(resumo.ano).toBe(2026)
    for (const d of DIVISOES) {
      expect(resumo.tabelas[d]).toEqual(esperado.tabelas[d])
      expect(resumo.campeoes[d]).toBe(esperado.tabelas[d][0].clubeId)
      const { partidas: _partidas, ...artilheiro } = esperado.artilheiros[d]
      expect(resumo.artilheiros[d]).toEqual(artilheiro)
    }
    expect(resumo.campeoes.copa).toBe(esperado.campeaoCopa)
    const { partidas: _partidas, ...artilheiroCopa } = esperado.artilheiroCopa
    expect(resumo.artilheiros.copa).toEqual(artilheiroCopa)
    expect(resumo.movimentos).toHaveLength(24)
    expect(resumo.movimentos.filter((m) => m.para === 'D')).toHaveLength(4)
  }, 30000)

  it('zera estatisticas, amarelos e suspensoes, renova desempate, calendario e Copa e vira o ano', () => {
    const carreira = novaCarreira(13, 'palmeiras')
    jogarTemporada(carreira)
    Object.values(carreira.jogadores)[0].amarelos = 2
    Object.values(carreira.jogadores)[1].suspensao = 1
    const desempate = JSON.stringify(carreira.desempate)
    const copaAntiga = JSON.stringify(carreira.copa)
    fimDeTemporada(carreira)
    expect(carreira.ano).toBe(2027)
    expect(carreira.proximaData).toBe(0)
    expect(carreira.calendario).toHaveLength(48)
    expect(carreira.calendario.every((d) => d.partidas.every((p) => p.resultado === null))).toBe(true)
    expect(carreira.calendario.filter((d) => d.tipo === 'divisao').every((d) => d.partidas.length === 30)).toBe(true)
    for (const j of Object.values(carreira.jogadores)) {
      expect(j.stats).toEqual({ partidas: 0, golsDivisao: 0, golsCopa: 0 })
      expect(j.amarelos).toBe(0)
      expect(j.suspensao).toBe(0)
    }
    expect(JSON.stringify(carreira.desempate)).not.toBe(desempate)
    expect(Object.keys(carreira.desempate)).toHaveLength(68)
    expect(JSON.stringify(carreira.copa)).not.toBe(copaAntiga)
    expect(carreira.copa.campeaoId).toBeNull()
    expect(carreira.copa.participantes).toHaveLength(64)
    expect(carreira.copa.fases[0]).toHaveLength(32)
    for (const c of carreira.clubes) expect(Object.values(c.extrato).every((v) => v === 0)).toBe(true)
  }, 30000)

  it('paga a premiacao por posicao final em cada Divisao', () => {
    const carreira = novaCarreira(14, 'flamengo')
    jogarTemporada(carreira)
    const antes = new Map(carreira.clubes.map((c) => [c.id, c.saldo]))
    const premiosCopa = new Map(carreira.clubes.map((c) => [c.id, c.extrato.premiacao]))
    const tabelas = DIVISOES.map((d) => classificacao(carreira, d))
    fimDeTemporada(carreira)
    DIVISOES.forEach((d, k) => {
      tabelas[k].forEach((l, i) => {
        const clube = carreira.clubes.find((c) => c.id === l.clubeId)!
        expect(clube.saldo - antes.get(l.clubeId)!).toBe(premioDaPosicao(d, i + 1))
      })
      expect(premioDaPosicao(d, 1)).toBeGreaterThan(premioDaPosicao(d, 20))
      expect(premioDaPosicao(d, 20)).toBeGreaterThan(0)
    })
    expect(carreira.historico[0].premiacaoDoTecnico).toBe(premiosCopa.get('flamengo')! + premioDaPosicao('A', tabelas[0].findIndex((l) => l.clubeId === 'flamengo') + 1))
  }, 30000)

  it('um Clube de meio de tabela continua com 80% a 150% do saldo inicial depois da premiacao', () => {
    for (const seed of [1, 2, 3]) {
      const carreira = novaCarreira(seed, 'flamengo')
      jogarTemporada(carreira)
      const meios = DIVISOES.map((d) => classificacao(carreira, d)[9].clubeId)
      const transferencias = new Map(meios.map((id) => [id, carreira.clubes.find((c) => c.id === id)!.extrato.transferencias]))
      fimDeTemporada(carreira)
      for (const id of meios) {
        const clube = carreira.clubes.find((c) => c.id === id)!
        const razao = (clube.saldo - transferencias.get(id)!) / SALDO_INICIAL[clube.porte]
        expect(razao, `${id} seed ${seed}`).toBeGreaterThan(0.8)
        expect(razao, `${id} seed ${seed}`).toBeLessThan(1.5)
      }
    }
  }, 30000)

  it('duas Temporadas seguidas rodam sem erro e mantem as invariantes', () => {
    const carreira = novaCarreira(15, 'corinthians')
    for (let t = 0; t < 2; t++) {
      jogarTemporada(carreira)
      fimDeTemporada(carreira)
      expect(DIVISOES.map((d) => clubesDa(carreira, d).length)).toEqual([20, 20, 20])
      expect(clubesDa(carreira, 'D')).toHaveLength(8)
      expect(carreira.clubes.every((c) => Number.isFinite(c.saldo))).toBe(true)
      expect(new Set(carreira.copa.participantes).size).toBe(64)
    }
    expect(carreira.ano).toBe(2028)
    expect(carreira.historico.map((h) => h.ano)).toEqual([2026, 2027])
  }, 30000)
})

describe('Clube do Tecnico no Pool', () => {
  it('cai para o Pool, segue sem Partida de Divisao, joga a Copa e volta a Serie C', () => {
    const carreira = novaCarreira(16, 'anapolis')
    jogarTemporada(carreira)
    afundar(carreira, 'anapolis')
    const resumo = fimDeTemporada(carreira)
    expect(resumo.movimentos).toContainEqual({ clubeId: 'anapolis', de: 'C', para: 'D' })
    const clube = () => carreira.clubes.find((c) => c.id === 'anapolis')!
    expect(clube().divisao).toBe('D')
    expect(carreira.copa.participantes).toContain('anapolis')

    let datasDeDivisao = 0
    let jogosDeCopa = 0
    while (carreira.proximaData < carreira.calendario.length) {
      const data = carreira.calendario[carreira.proximaData]
      if (data.tipo === 'divisao') {
        datasDeDivisao++
        expect(tecnicoJogaNaProximaData(carreira)).toBe(false)
        expect(data.partidas.some((p) => p.casaId === 'anapolis' || p.foraId === 'anapolis')).toBe(false)
      } else if (tecnicoJogaNaProximaData(carreira)) jogosDeCopa++
      aplicarEscalacaoAutomatica(carreira)
      simularRodada(carreira)
    }
    expect(datasDeDivisao).toBe(38)
    expect(jogosDeCopa).toBeGreaterThan(0)
    expect(clube().extrato.salarios).toBeLessThan(0)

    fimDeTemporada(carreira)
    expect(clube().divisao).toBe('C')
    expect(DIVISOES.map((d) => clubesDa(carreira, d).length)).toEqual([20, 20, 20])
    expect(clubesDa(carreira, 'D')).toHaveLength(8)
    expect(carreira.historico).toHaveLength(2)
  }, 30000)
})

describe('varias Temporadas sem o Tecnico renovar ninguem', () => {
  it.each([
    [42, 'guarani'],
    [8, 'ceara'],
  ])('toda data e jogavel com Escalacao automatica valida (seed %i, %s)', (seed, clubeId) => {
    const carreira = novaCarreira(seed, clubeId)
    for (let t = 0; t < 5; t++) {
      while (carreira.proximaData < carreira.calendario.length) {
        aplicarEscalacaoAutomatica(carreira)
        if (tecnicoJogaNaProximaData(carreira)) expect(validarEscalacao(carreira, carreira.escalacao), `${carreira.ano} data ${carreira.proximaData}`).toEqual([])
        simularRodada(carreira)
      }
      fimDeTemporada(carreira)
    }
    expect(carreira.ano).toBe(2031)
  }, 60000)
})
