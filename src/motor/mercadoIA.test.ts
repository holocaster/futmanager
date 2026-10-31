import { describe, expect, it } from 'vitest'
import { novaCarreira } from './carreira'
import { elencoDe } from './elenco'
import { ELENCO_ALVO, ELENCO_MAXIMO, ELENCO_MINIMO } from './evolucao'
import { clubePorId } from './financas'
import { janelaAberta, precoPedido } from './mercado'
import { tentarTransferencia, TENTATIVAS_POR_DATA, transferenciasDaIA } from './mercadoIA'
import { simularRodada } from './rodada'
import { aplicarEscalacaoAutomatica } from './tatica'
import type { Carreira } from './tipos'

function depoisDaRodada(carreira: Carreira, n: number): void {
  carreira.proximaData = n === 0 ? 0 : carreira.calendario.findIndex((d) => d.tipo === 'divisao' && d.rodada === n) + 1
}

describe('Transferencias entre clubes da IA', () => {
  it('acontecem tambem ao terminar uma data da Copa com a Janela aberta', () => {
    const carreira = novaCarreira(1, 'flamengo')
    for (let i = 0; i < 3; i++) {
      aplicarEscalacaoAutomatica(carreira)
      simularRodada(carreira)
    }
    expect(carreira.calendario[carreira.proximaData].tipo).toBe('copa')
    const antes = carreira.transferencias.length
    aplicarEscalacaoAutomatica(carreira)
    simularRodada(carreira)
    expect(janelaAberta(carreira)).toBe(true)
    expect(carreira.transferencias.length).toBeGreaterThan(antes)
    expect(carreira.transferencias.length - antes).toBeLessThanOrEqual(TENTATIVAS_POR_DATA)
  })

  it('so acontecem com a Janela aberta', () => {
    const fechada = novaCarreira(1, 'flamengo')
    depoisDaRodada(fechada, 10)
    for (let i = 0; i < 100; i++) transferenciasDaIA(fechada)
    expect(fechada.transferencias).toEqual([])
    const aberta = novaCarreira(1, 'flamengo')
    for (let i = 0; i < 100; i++) transferenciasDaIA(aberta)
    expect(janelaAberta(aberta)).toBe(true)
    expect(aberta.transferencias.length).toBeGreaterThan(0)
  })

  it('sao poucas por data de Janela aberta', () => {
    const carreira = novaCarreira(2, 'flamengo')
    transferenciasDaIA(carreira)
    expect(carreira.transferencias.length).toBeLessThanOrEqual(TENTATIVAS_POR_DATA)
  })

  it('nunca envolvem o Clube do Tecnico', () => {
    const carreira = novaCarreira(3, 'flamengo')
    const antes = JSON.stringify(elencoDe(carreira, 'flamengo'))
    const saldo = clubePorId(carreira, 'flamengo').saldo
    for (let i = 0; i < 300; i++) tentarTransferencia(carreira)
    expect(carreira.transferencias.length).toBeGreaterThan(10)
    for (const t of carreira.transferencias) {
      expect(t.deId).not.toBe('flamengo')
      expect(t.paraId).not.toBe('flamengo')
    }
    expect(JSON.stringify(elencoDe(carreira, 'flamengo'))).toBe(antes)
    expect(clubePorId(carreira, 'flamengo').saldo).toBe(saldo)
  })

  it('o comprador leva Jogador melhor que o seu pior na posicao, de Clube de Porte igual ou menor', () => {
    const carreira = novaCarreira(4, 'flamengo')
    let verificadas = 0
    for (let i = 0; i < 300; i++) {
      const piores = new Map<string, number>()
      for (const j of Object.values(carreira.jogadores)) piores.set(`${j.clubeId}-${j.posicao}`, Math.min(j.forca, piores.get(`${j.clubeId}-${j.posicao}`) ?? 100))
      const antes = carreira.transferencias.length
      tentarTransferencia(carreira)
      if (carreira.transferencias.length === antes) continue
      const t = carreira.transferencias[carreira.transferencias.length - 1]
      const j = carreira.jogadores[t.jogadorId]
      expect(j.forca).toBeGreaterThan(piores.get(`${t.paraId}-${j.posicao}`) ?? 0)
      expect(clubePorId(carreira, t.deId).porte).toBeLessThanOrEqual(clubePorId(carreira, t.paraId).porte)
      expect(t.valor).toBeGreaterThan(0)
      verificadas++
    }
    expect(verificadas).toBeGreaterThan(10)
  })

  it('nao viola limites de Elenco e o comprador nunca fica com saldo negativo', () => {
    const carreira = novaCarreira(5, 'flamengo')
    const minimoInicial = Math.min(...carreira.clubes.map((c) => c.saldo))
    for (let i = 0; i < 600; i++) tentarTransferencia(carreira)
    expect(carreira.transferencias.length).toBeGreaterThan(50)
    for (const c of carreira.clubes) {
      const elenco = elencoDe(carreira, c.id)
      expect(elenco.length, c.id).toBeGreaterThanOrEqual(ELENCO_MINIMO)
      expect(elenco.length, c.id).toBeLessThanOrEqual(ELENCO_MAXIMO)
      expect(elenco.filter((j) => j.posicao === 'G').length, c.id).toBeGreaterThanOrEqual(2)
      if (c.id !== 'flamengo') expect(c.saldo, c.id).toBeGreaterThanOrEqual(0)
    }
    expect(minimoInicial).toBeGreaterThan(0)
  })

  it('Clube com saldo negativo nao compra', () => {
    const carreira = novaCarreira(6, 'flamengo')
    for (const id of ['santos', 'palmeiras']) clubePorId(carreira, id).saldo = -1e12
    for (let i = 0; i < 300; i++) tentarTransferencia(carreira)
    expect(carreira.transferencias.length).toBeGreaterThan(10)
    expect(carreira.transferencias.every((t) => t.paraId !== 'santos' && t.paraId !== 'palmeiras')).toBe(true)
  })

  it('o dinheiro muda de mao pelo preco pedido e os Contratos sao novos', () => {
    const carreira = novaCarreira(7, 'flamengo')
    tentarTransferencia(carreira)
    for (let i = 0; i < 50 && !carreira.transferencias.length; i++) tentarTransferencia(carreira)
    const t = carreira.transferencias[0]
    const j = carreira.jogadores[t.jogadorId]
    expect(j.clubeId).toBe(t.paraId)
    expect(j.contratoAte).toBe(carreira.ano + 3)
    expect(clubePorId(carreira, t.paraId).extrato.transferencias).toBeLessThan(0)
    expect(clubePorId(carreira, t.deId).extrato.transferencias).toBeGreaterThan(0)
    expect(t.valor).toBeLessThanOrEqual(precoPedido(carreira, j) * 10)
  })

  it('repoe Elencos: um Clube abaixo do alvo ganha Jogadores e os vendedores ficam em 22 ou mais', () => {
    const carreira = novaCarreira(8, 'flamengo')
    for (const j of elencoDe(carreira, 'santos').slice(0, 8)) delete carreira.jogadores[j.id]
    expect(elencoDe(carreira, 'santos')).toHaveLength(17)
    for (let i = 0; i < 400; i++) tentarTransferencia(carreira)
    expect(elencoDe(carreira, 'santos').length).toBeGreaterThanOrEqual(ELENCO_ALVO)
    for (const c of carreira.clubes) if (c.id !== 'santos' && c.id !== 'flamengo') expect(elencoDe(carreira, c.id).length, c.id).toBeGreaterThanOrEqual(ELENCO_ALVO - 3)
  })

  it('uma Temporada inteira com mercado ligado segue valida, com Elencos entre 16 e 32', () => {
    const carreira = novaCarreira(9, 'flamengo')
    while (carreira.proximaData < carreira.calendario.length) {
      aplicarEscalacaoAutomatica(carreira)
      simularRodada(carreira)
    }
    expect(carreira.transferencias.length).toBeGreaterThan(5)
    for (const c of carreira.clubes) {
      expect(elencoDe(carreira, c.id).length).toBeGreaterThanOrEqual(ELENCO_MINIMO)
      expect(elencoDe(carreira, c.id).length).toBeLessThanOrEqual(ELENCO_MAXIMO)
      expect(Number.isFinite(c.saldo)).toBe(true)
    }
  }, 30000)
})
