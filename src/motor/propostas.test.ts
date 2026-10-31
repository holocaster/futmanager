import { describe, expect, it } from 'vitest'
import { novaCarreira } from './carreira'
import { elencoDe } from './elenco'
import { clubePorId } from './financas'
import { janelaAberta, proporTroca, transferir, valorDe } from './mercado'
import { aceitarProposta, contrapropor, definirAVenda, gerarPropostas, recusarProposta, TETO_DA_CONTRAPROPOSTA } from './propostas'
import { simularRodada } from './rodada'
import { aplicarEscalacaoAutomatica, validarEscalacao } from './tatica'
import type { Carreira } from './tipos'

function carreiraComPropostas(seed = 1) {
  const carreira = novaCarreira(seed, 'flamengo')
  for (const c of carreira.clubes) c.saldo = 1e10
  const j = elencoDe(carreira, 'flamengo').find((x) => x.posicao === 'M')!
  carreira.propostas.push({ compradorId: 'palmeiras', jogadorId: j.id, valor: valorDe(j) })
  return { carreira, j, proposta: carreira.propostas[0] }
}

function jogar(carreira: Carreira): void {
  aplicarEscalacaoAutomatica(carreira)
  simularRodada(carreira)
}

describe('definirAVenda', () => {
  it('marca e desmarca Jogador do Tecnico com preco', () => {
    const carreira = novaCarreira(1, 'flamengo')
    const j = elencoDe(carreira, 'flamengo')[0]
    expect(definirAVenda(carreira, j.id, 1_234_567.4)).toBeNull()
    expect(j.aVenda).toBe(1_234_567)
    expect(definirAVenda(carreira, j.id, null)).toBeNull()
    expect(j.aVenda).toBeNull()
  })

  it('recusa preco invalido e Jogador de outro Clube', () => {
    const carreira = novaCarreira(1, 'flamengo')
    const j = elencoDe(carreira, 'flamengo')[0]
    for (const preco of [0, -1, NaN]) expect(definirAVenda(carreira, j.id, preco)).toMatch(/maior que zero/)
    expect(j.aVenda).toBeNull()
    expect(definirAVenda(carreira, elencoDe(carreira, 'santos')[0].id, 1000)).toMatch(/Elenco/)
  })
})

describe('Propostas da IA', () => {
  it('chegam tambem ao terminar uma data da Copa com a Janela aberta', () => {
    const carreira = novaCarreira(1, 'flamengo')
    for (let i = 0; i < 3; i++) jogar(carreira)
    expect(carreira.calendario[carreira.proximaData].tipo).toBe('copa')
    expect(janelaAberta(carreira)).toBe(true)
    carreira.propostas = []
    for (const c of carreira.clubes) c.saldo = 1e10
    for (const j of elencoDe(carreira, 'flamengo')) definirAVenda(carreira, j.id, valorDe(j))
    jogar(carreira)
    expect(janelaAberta(carreira)).toBe(true)
    expect(carreira.propostas.length).toBeGreaterThan(0)
  })

  it('so chegam com a Janela aberta e expiram quando ela fecha', () => {
    const carreira = novaCarreira(7, 'santos')
    for (const j of elencoDe(carreira, 'santos')) definirAVenda(carreira, j.id, valorDe(j))
    let recebeu = 0
    while (carreira.proximaData < carreira.calendario.length) {
      jogar(carreira)
      if (carreira.propostas.length) {
        recebeu++
        expect(janelaAberta(carreira)).toBe(true)
      }
      if (!janelaAberta(carreira)) expect(carreira.propostas).toEqual([])
    }
    expect(recebeu).toBeGreaterThan(0)
  }, 30000)

  it('uma Proposta pendente some quando a Janela fecha', () => {
    const { carreira } = carreiraComPropostas()
    carreira.proximaData = carreira.calendario.findIndex((d) => d.tipo === 'divisao' && d.rodada === 22) + 1
    expect(janelaAberta(carreira)).toBe(true)
    jogar(carreira)
    expect(janelaAberta(carreira)).toBe(false)
    expect(carreira.propostas).toEqual([])
  })

  it('Jogador a venda recebe muito mais Propostas que os demais (N grande)', () => {
    const carreira = novaCarreira(3, 'flamengo')
    for (const c of carreira.clubes) c.saldo = 1e10
    const elenco = elencoDe(carreira, 'flamengo')
    const aVenda = elenco.slice(0, 5)
    for (const j of aVenda) definirAVenda(carreira, j.id, valorDe(j))
    const contagem = new Map<string, number>()
    for (let i = 0; i < 400; i++) {
      carreira.propostas = []
      gerarPropostas(carreira)
      for (const p of carreira.propostas) contagem.set(p.jogadorId, (contagem.get(p.jogadorId) ?? 0) + 1)
    }
    const media = (js: typeof elenco) => js.reduce((s, j) => s + (contagem.get(j.id) ?? 0), 0) / js.length
    const outros = elenco.slice(5)
    expect(media(aVenda)).toBeGreaterThan(20 * media(outros))
    expect(media(outros)).toBeGreaterThan(0)
  })

  it('compradores tem saldo, Porte compativel e espaco no Elenco', () => {
    const carreira = novaCarreira(3, 'flamengo')
    for (const j of elencoDe(carreira, 'flamengo')) definirAVenda(carreira, j.id, valorDe(j))
    for (const c of carreira.clubes) c.saldo = c.porte === 5 ? 1e10 : c.id === 'palmeiras' ? 1 : 1e10
    for (const j of elencoDe(carreira, 'santos').slice(0, 7)) j.clubeId = 'cruzeiro'
    for (let i = 0; i < 50; i++) gerarPropostas(carreira)
    expect(carreira.propostas.length).toBeGreaterThan(20)
    for (const p of carreira.propostas) {
      const comprador = clubePorId(carreira, p.compradorId)
      expect(comprador.saldo).toBeGreaterThanOrEqual(p.valor)
      expect(Math.abs(comprador.porte - 5)).toBeLessThanOrEqual(1)
      expect(p.compradorId).not.toBe('flamengo')
      expect(p.compradorId).not.toBe('cruzeiro')
    }
  })

  it('nao gera Proposta que deixaria o Elenco do Tecnico abaixo de 16', () => {
    const carreira = novaCarreira(3, 'flamengo')
    for (const c of carreira.clubes) c.saldo = 1e10
    const elenco = elencoDe(carreira, 'flamengo')
    for (const j of elenco) definirAVenda(carreira, j.id, valorDe(j))
    for (const j of elenco.filter((x) => x.posicao !== 'G').slice(0, 9)) j.clubeId = 'santos'
    expect(elencoDe(carreira, 'flamengo')).toHaveLength(16)
    for (let i = 0; i < 20; i++) gerarPropostas(carreira)
    expect(carreira.propostas).toEqual([])
  })
})

describe('responder a Proposta', () => {
  it('a Troca remove as Propostas dos dois Jogadores e preserva as demais', () => {
    const { carreira, j } = carreiraComPropostas()
    const alvo = elencoDe(carreira, 'santos').find((x) => x.posicao === 'M')!
    const outro = elencoDe(carreira, 'flamengo').find((x) => x.id !== j.id)!
    const restante = { compradorId: 'palmeiras', jogadorId: outro.id, valor: valorDe(outro) }
    carreira.propostas.push({ compradorId: 'santos', jogadorId: j.id, valor: 5 })
    carreira.propostas.push({ compradorId: 'palmeiras', jogadorId: alvo.id, valor: 5 }, restante)
    expect(proporTroca(carreira, j.id, alvo.id, 1e8).resultado).toBe('aceita')
    expect(carreira.propostas).toEqual([restante])
  })

  it('aceitar uma Proposta antiga depois da Troca nao transfere entre clubes da IA', () => {
    const { carreira, j, proposta } = carreiraComPropostas()
    const alvo = elencoDe(carreira, 'santos').find((x) => x.posicao === 'M')!
    expect(proporTroca(carreira, j.id, alvo.id, 1e8).resultado).toBe('aceita')
    const antes = JSON.stringify(carreira)
    expect(aceitarProposta(carreira, proposta)).toMatch(/Elenco/)
    expect(JSON.stringify(carreira)).toBe(antes)
  })

  it('Proposta removida pela Troca nao volta a valer quando o Jogador retorna ao Tecnico', () => {
    const { carreira, j, proposta } = carreiraComPropostas()
    const alvo = elencoDe(carreira, 'santos').find((x) => x.posicao === 'M')!
    expect(proporTroca(carreira, j.id, alvo.id, 1e8).resultado).toBe('aceita')
    transferir(carreira, j, carreira.clubeId, valorDe(j))
    expect(carreira.propostas).toEqual([])
    const antes = JSON.stringify(carreira)
    expect(aceitarProposta(carreira, proposta)).toMatch(/pendente/)
    expect(contrapropor(carreira, proposta, 1)).toMatchObject({ resultado: 'bloqueada', mensagem: expect.stringMatching(/pendente/) })
    expect(JSON.stringify(carreira)).toBe(antes)
  })

  it('aceitar fecha a Transferencia na hora, com dinheiro, Contrato e Propostas do Jogador removidas', () => {
    const { carreira, j, proposta } = carreiraComPropostas()
    carreira.propostas.push({ compradorId: 'santos', jogadorId: j.id, valor: 5 })
    const meu = clubePorId(carreira, 'flamengo')
    const comprador = clubePorId(carreira, 'palmeiras')
    const saldos = [meu.saldo, comprador.saldo]
    expect(aceitarProposta(carreira, proposta)).toBeNull()
    expect(j.clubeId).toBe('palmeiras')
    expect(j.contratoAte).toBe(carreira.ano + 3)
    expect(meu.saldo).toBe(saldos[0] + proposta.valor)
    expect(comprador.saldo).toBe(saldos[1] - proposta.valor)
    expect(carreira.propostas).toEqual([])
  })

  it('vender um titular refaz a Escalacao e a Rodada segue valida', () => {
    const { carreira } = carreiraComPropostas()
    const titular = carreira.jogadores[carreira.escalacao.titulares[5]]
    carreira.propostas = [{ compradorId: 'palmeiras', jogadorId: titular.id, valor: valorDe(titular) }]
    aceitarProposta(carreira, carreira.propostas[0])
    expect(validarEscalacao(carreira, carreira.escalacao)).toEqual([])
    expect(carreira.escalacao.titulares).not.toContain(titular.id)
    simularRodada(carreira)
    expect(carreira.proximaData).toBe(1)
  })

  it('recusar remove a Proposta e o Jogador fica', () => {
    const { carreira, j, proposta } = carreiraComPropostas()
    recusarProposta(carreira, proposta)
    expect(carreira.propostas).toEqual([])
    expect(j.clubeId).toBe('flamengo')
  })

  it('o limite minimo de Elenco do Tecnico impede a venda e a Proposta continua pendente', () => {
    const { carreira, j, proposta } = carreiraComPropostas()
    for (const o of elencoDe(carreira, 'flamengo').filter((x) => x !== j && x.posicao !== 'G').slice(0, 9)) o.clubeId = 'santos'
    expect(elencoDe(carreira, 'flamengo')).toHaveLength(16)
    expect(aceitarProposta(carreira, proposta)).toMatch(/menos de 16/)
    expect(j.clubeId).toBe('flamengo')
    expect(carreira.propostas).toHaveLength(1)
  })

  it('o comprador sem saldo ou sem espaco no Elenco nao fecha a venda', () => {
    const { carreira, j, proposta } = carreiraComPropostas()
    clubePorId(carreira, 'palmeiras').saldo = proposta.valor - 1
    expect(aceitarProposta(carreira, proposta)).toMatch(/saldo/)
    clubePorId(carreira, 'palmeiras').saldo = 1e10
    for (const o of elencoDe(carreira, 'santos').slice(0, 7)) o.clubeId = 'palmeiras'
    expect(aceitarProposta(carreira, proposta)).toMatch(/mais de 32/)
    expect(j.clubeId).toBe('flamengo')
  })

  it('fora da Janela a venda nao e concluida', () => {
    const { carreira, j, proposta } = carreiraComPropostas()
    carreira.proximaData = carreira.calendario.findIndex((d) => d.tipo === 'divisao' && d.rodada === 10) + 1
    expect(aceitarProposta(carreira, proposta)).toMatch(/Janela/)
    expect(j.clubeId).toBe('flamengo')
  })
})

describe('contraproposta do Tecnico', () => {
  it('contraproposta por Jogador fora do Elenco ou removido e bloqueada antes do teto', () => {
    for (const removido of [false, true]) {
      const { carreira, j, proposta } = carreiraComPropostas()
      j.clubeId = 'santos'
      if (removido) delete carreira.jogadores[j.id]
      const antes = JSON.stringify(carreira)
      expect(contrapropor(carreira, proposta, 1e9)).toMatchObject({ resultado: 'bloqueada', mensagem: expect.stringMatching(/Elenco/) })
      expect(JSON.stringify(carreira)).toBe(antes)
    }
  })

  it('a IA aceita ate 1,2 x o valor, pagando o valor contraproposto', () => {
    const { carreira, j, proposta } = carreiraComPropostas()
    const teto = Math.floor(valorDe(j) * TETO_DA_CONTRAPROPOSTA)
    const comprador = clubePorId(carreira, 'palmeiras')
    const saldo = comprador.saldo
    expect(contrapropor(carreira, proposta, teto)).toMatchObject({ resultado: 'aceita' })
    expect(j.clubeId).toBe('palmeiras')
    expect(comprador.saldo).toBe(saldo - teto)
  })

  it('a IA desiste acima do teto e a Proposta some', () => {
    const { carreira, j, proposta } = carreiraComPropostas()
    const r = contrapropor(carreira, proposta, Math.ceil(valorDe(j) * TETO_DA_CONTRAPROPOSTA) + 1)
    expect(r.resultado).toBe('desistiu')
    expect(carreira.propostas).toEqual([])
    expect(j.clubeId).toBe('flamengo')
  })

  it('valor invalido nao muda nada', () => {
    const { carreira, proposta } = carreiraComPropostas()
    expect(contrapropor(carreira, proposta, 0).resultado).toBe('bloqueada')
    expect(carreira.propostas).toHaveLength(1)
  })
})
