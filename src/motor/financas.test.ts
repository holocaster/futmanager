import { describe, expect, it } from 'vitest'
import { novaCarreira, SALDO_INICIAL } from './carreira'
import { classificacao } from './classificacao'
import { CATEGORIAS, FATOR_PATROCINIO_DIVISAO, folhaMensal, lancar, pagarDataDeDivisao, PATROCINIO_POR_PORTE, PREMIO_COPA, receberBilheteria } from './financas'
import { carregar, salvar } from '../save'
import { memoria } from '../save.test-helpers'
import { fimDeTemporada } from './temporada'
import { simularRodada } from './rodada'
import { aplicarEscalacaoAutomatica } from './tatica'
import type { Carreira, Divisao } from './tipos'

function jogar(carreira: Carreira, datas = 1): void {
  for (let i = 0; i < datas; i++) {
    aplicarEscalacaoAutomatica(carreira)
    simularRodada(carreira)
  }
}

const somaDoExtrato = (c: Carreira['clubes'][number]) => CATEGORIAS.reduce((s, k) => s + c.extrato[k], 0)

describe('extrato e saldo', () => {
  it('rateia salario mensal finito sem transbordar no intermediario da multiplicacao', () => {
    const c = novaCarreira(1, 'flamengo')
    Object.values(c.jogadores).find((j) => j.clubeId === c.clubeId)!.salario = Number.MAX_VALUE / 2
    pagarDataDeDivisao(c)
    const clube = c.clubes.find((clube) => clube.id === c.clubeId)!
    expect(c.clubes.every((clube) => [clube.saldo, ...Object.values(clube.extrato)].every(Number.isFinite))).toBe(true)
    expect(-clube.extrato.salarios / (Number.MAX_VALUE / 2)).toBeCloseTo(0.3157894736842105, 14)
  })

  it.each(['valor', 'saldo', 'extrato'] as const)('recusa lancamento nao finito ou overflow em %s antes de alterar o Clube', (campo) => {
    const c = novaCarreira(1, 'flamengo')
    const clube = c.clubes[0]
    if (campo === 'saldo') clube.saldo = Number.MAX_VALUE
    if (campo === 'extrato') clube.extrato.patrocinio = Number.MAX_VALUE
    const antes = structuredClone(clube)
    const valores = campo === 'valor' ? [NaN, Infinity, -Infinity] : [Number.MAX_VALUE]
    for (const valor of valores) {
      expect(() => lancar(clube, 'patrocinio', valor)).toThrow(/finito/)
      expect(clube).toEqual(antes)
    }
  })

  it('recusa folha agregada que transborda antes dos lancamentos, sem saldo ou extrato parcial', () => {
    const c = novaCarreira(1, 'flamengo')
    for (const j of Object.values(c.jogadores).filter((j) => j.clubeId === c.clubeId).slice(0, 2)) j.salario = Number.MAX_VALUE
    const antes = structuredClone(c.clubes)
    expect(() => folhaMensal(c, c.clubeId)).toThrow(/finita/)
    expect(() => pagarDataDeDivisao(c)).toThrow(/finita/)
    expect(c.clubes).toEqual(antes)
  })

  it.each([5826, 10000, Number.MAX_SAFE_INTEGER])('mantem receitas e finanças finitas no ano acelerado %i, com igualdade Tecnico/IA e Save sem perda', (ano) => {
    const humano = novaCarreira(1, 'flamengo')
    const ia = novaCarreira(1, 'santos')
    for (const c of [humano, ia]) {
      c.ano = ano
      const clube = c.clubes.find((clube) => clube.id === 'flamengo')!
      const antes = clube.saldo = -1_000_000_000_000_000
      pagarDataDeDivisao(c)
      expect(c.clubes.every((clube) => [clube.saldo, ...Object.values(clube.extrato)].every(Number.isFinite))).toBe(true)
      expect(clube.extrato.patrocinio).toBeGreaterThan(0)
      expect(clube.saldo).toBe(antes + clube.extrato.salarios + clube.extrato.patrocinio)
      expect(clube.saldo).toBeLessThan(0)
      const storage = memoria()
      expect(salvar(storage, 1, c)).toBeNull()
      expect(carregar(storage, 1)).toEqual(c)
    }
    expect(humano.clubes.map((c) => c.extrato.patrocinio)).toEqual(ia.clubes.map((c) => c.extrato.patrocinio))
    const porteUm = humano.clubes.filter((c) => c.porte === 1)
    expect(Math.max(...porteUm.filter((c) => c.divisao === 'D').map((c) => c.extrato.patrocinio))).toBeLessThan(Math.min(...porteUm.filter((c) => c.divisao === 'C').map((c) => c.extrato.patrocinio)))
  })

  it('patrocinio cresce por ano igualmente para Tecnico/IA e entra somente pelo extrato, sem resgatar divida', () => {
    const humano = novaCarreira(1, 'flamengo')
    const ia = novaCarreira(1, 'santos')
    humano.ano = ia.ano = 2030
    for (const c of [humano, ia]) {
      const clube = c.clubes.find((clube) => clube.id === 'flamengo')!
      clube.saldo = -100_000_000
      expect(clube.extrato.patrocinio).toBe(0)
      const folha = folhaMensal(c, clube.id)
      pagarDataDeDivisao(c)
      expect(clube.extrato.patrocinio).toBeGreaterThan(23_500_000 / 38)
      expect(clube.saldo).toBe(-100_000_000 + clube.extrato.patrocinio - Math.round(folha * 12 / 38))
      expect(clube.saldo).toBeLessThan(0)
    }
    expect(humano.clubes.find((clube) => clube.id === 'flamengo')!.extrato.patrocinio).toBe(ia.clubes.find((clube) => clube.id === 'flamengo')!.extrato.patrocinio)
  })

  it('a virada preserva divida e so credita premiacao efetiva, inclusive no Pool', () => {
    const c = novaCarreira(1, 'flamengo')
    c.proximaData = c.calendario.length
    const clube = c.clubes.find((clube) => clube.id === 'abc')!
    clube.saldo = -50_000_000
    fimDeTemporada(c)
    expect(clube.saldo).toBe(-50_000_000)
    expect(clube.extrato).toEqual({ salarios: 0, patrocinio: 0, bilheteria: 0, premiacao: 0, transferencias: 0 })
  })

  it('o saldo muda exatamente pelo extrato depois de uma Rodada de Divisao, em todos os 68 clubes', () => {
    const carreira = novaCarreira(1, 'flamengo')
    const antes = carreira.clubes.map((c) => c.saldo)
    jogar(carreira)
    carreira.clubes.forEach((c, i) => {
      expect(c.saldo - antes[i]).toBe(somaDoExtrato(c))
      expect(c.extrato.salarios).toBeLessThan(0)
      expect(c.extrato.patrocinio).toBeGreaterThan(0)
    })
  })

  it('salario do mes e folha x 12 / 38 e patrocinio segue Divisao e Porte (Pool com o menor)', () => {
    const carreira = novaCarreira(1, 'flamengo')
    const folha = folhaMensal(carreira, 'flamengo')
    jogar(carreira)
    const clube = (id: string) => carreira.clubes.find((c) => c.id === id)!
    expect(clube('flamengo').extrato.salarios).toBe(-Math.round((folha * 12) / 38))
    expect(clube('flamengo').extrato.patrocinio).toBe(Math.round((PATROCINIO_POR_PORTE[5] * FATOR_PATROCINIO_DIVISAO.A) / 38))
    const patrocinio = (d: Divisao) => Math.min(...carreira.clubes.filter((c) => c.divisao === d && c.porte === 1).map((c) => c.extrato.patrocinio))
    expect(clube('abc').extrato.patrocinio).toBeGreaterThan(0)
    expect(patrocinio('D')).toBeLessThan(patrocinio('C'))
  })

  it('o mandante recebe bilheteria e o visitante nao (data da Copa)', () => {
    const carreira = novaCarreira(2, 'flamengo')
    jogar(carreira, 3)
    const antes = carreira.clubes.map((c) => c.extrato.bilheteria)
    jogar(carreira)
    expect(carreira.calendario[3].tipo).toBe('copa')
    const mandantes = new Set(carreira.calendario[3].partidas.map((p) => p.casaId))
    const visitantes = new Set(carreira.calendario[3].partidas.map((p) => p.foraId))
    carreira.clubes.forEach((c, i) => {
      const ganho = c.extrato.bilheteria - antes[i]
      if (mandantes.has(c.id)) expect(ganho).toBeGreaterThan(0)
      if (visitantes.has(c.id)) expect(ganho).toBe(0)
    })
  })

  it('a bilheteria de um mandante sobe com o desempenho recente', () => {
    const bilheteria = (vitoria: boolean) => {
      const carreira = novaCarreira(3, 'flamengo')
      const mandante = carreira.calendario[1].partidas[0].casaId
      const anterior = carreira.calendario[0].partidas.find((p) => p.casaId === mandante || p.foraId === mandante)!
      const casa = anterior.casaId === mandante
      anterior.resultado = vitoria === casa ? { golsCasa: 2, golsFora: 0 } : { golsCasa: 0, golsFora: 2 }
      receberBilheteria(carreira, mandante, 1)
      return carreira.clubes.find((c) => c.id === mandante)!.extrato.bilheteria
    }
    expect(bilheteria(true)).toBeGreaterThan(bilheteria(false))
  })
})

describe('premiacao da Copa', () => {
  it('quem avanca recebe a premiacao da fase e quem cai nao recebe', () => {
    const carreira = novaCarreira(4, 'flamengo')
    jogar(carreira, 5)
    const { fases } = carreira.copa
    const vencedores = new Set(fases[0].map((c) => c.vencedorId))
    for (const clube of carreira.clubes) {
      if (!carreira.copa.participantes.includes(clube.id)) expect(clube.extrato.premiacao).toBe(0)
      else expect(clube.extrato.premiacao).toBe(vencedores.has(clube.id) ? PREMIO_COPA[0] : 0)
    }
    expect(fases[0]).toHaveLength(32)
  })

  it('o campeao recebe a premiacao de todas as fases', () => {
    const carreira = novaCarreira(5, 'flamengo')
    jogar(carreira, 48)
    const campeao = carreira.clubes.find((c) => c.id === carreira.copa.campeaoId)!
    expect(campeao.extrato.premiacao).toBe(PREMIO_COPA.reduce((s, v) => s + v, 0))
  }, 20000)
})

describe('calibracao do caixa', () => {
  it('o 10o colocado termina com 80% a 150% do saldo inicial em pelo menos 90% de 30 seeds por Divisao', () => {
    const dentroDaFaixa = { A: 0, B: 0, C: 0 }
    const amostras = 30
    for (let seed = 1; seed <= amostras; seed++) {
      const carreira = novaCarreira(seed, 'flamengo')
      jogar(carreira, carreira.calendario.length)
      for (const divisao of ['A', 'B', 'C'] as const) {
        const meio = carreira.clubes.find((c) => c.id === classificacao(carreira, divisao)[9].clubeId)!
        const razao = (meio.saldo - meio.extrato.transferencias) / SALDO_INICIAL[meio.porte]
        if (razao >= 0.8 && razao <= 1.5) dentroDaFaixa[divisao]++
      }
    }
    for (const divisao of ['A', 'B', 'C'] as const) expect(dentroDaFaixa[divisao], divisao).toBeGreaterThanOrEqual(amostras * 0.9)
  }, 120000)
})
