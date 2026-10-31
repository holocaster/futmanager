import { describe, expect, it } from 'vitest'
import { novaCarreira } from './carreira'
import { elencoDe } from './elenco'
import { clubePorId } from './financas'
import { salarioPedido, valorDeMercado } from './jogadores'
import { simularRodada } from './rodada'
import { aplicarEscalacaoAutomatica, validarEscalacao } from './tatica'
import { buscarJogadores, janelaAberta, MAX_TRANSFERENCIAS_RECENTES, precoPedido, proporCompra, proporTroca, transferir, valorDe } from './mercado'
import type { Carreira, Jogador } from './tipos'

function depoisDaRodada(carreira: Carreira, n: number): Carreira {
  carreira.proximaData = n === 0 ? 0 : carreira.calendario.findIndex((d) => d.tipo === 'divisao' && d.rodada === n) + 1
  return carreira
}

const porForca = (carreira: Carreira, clubeId: string) => elencoDe(carreira, clubeId).sort((a, b) => b.forca - a.forca || a.id.localeCompare(b.id, 'en', { numeric: true }))

function alvo(carreira: Carreira, clubeId = 'palmeiras', posicao: Jogador['posicao'] = 'M'): Jogador {
  return porForca(carreira, clubeId).filter((j) => j.posicao === posicao)[1]
}

describe('Janela', () => {
  it('abre com 0 a 3 Rodadas de Divisao jogadas e com 19 a 22, e fecha nas demais', () => {
    const carreira = novaCarreira(1, 'flamengo')
    for (let n = 0; n <= 38; n++) expect(janelaAberta(depoisDaRodada(carreira, n)), `rodada ${n}`).toBe(n <= 3 || (n >= 19 && n <= 22))
  })

  it('a data da Copa nao conta como Rodada de Divisao', () => {
    const carreira = novaCarreira(1, 'flamengo')
    depoisDaRodada(carreira, 3)
    carreira.proximaData++
    expect(carreira.calendario[carreira.proximaData - 1].tipo).toBe('copa')
    expect(janelaAberta(carreira)).toBe(true)
  })

  it('fora da Janela nenhuma compra e concluida', () => {
    const carreira = depoisDaRodada(novaCarreira(1, 'flamengo'), 10)
    const j = alvo(carreira)
    const saldo = clubePorId(carreira, 'flamengo').saldo
    const r = proporCompra(carreira, j.id, 1e9)
    expect(r.resultado).toBe('bloqueada')
    expect(r.mensagem).toMatch(/Janela/)
    expect(j.clubeId).toBe('palmeiras')
    expect(clubePorId(carreira, 'flamengo').saldo).toBe(saldo)
  })
})

describe('preco pedido', () => {
  it('1,3 x valor entre os 11 melhores do Clube e 1,1 x valor nos demais', () => {
    const carreira = novaCarreira(2, 'flamengo')
    const elenco = porForca(carreira, 'palmeiras')
    expect(precoPedido(carreira, elenco[0])).toBe(Math.round(valorDeMercado(elenco[0].forca, elenco[0].idade) * 1.3))
    expect(precoPedido(carreira, elenco[10])).toBe(Math.round(valorDeMercado(elenco[10].forca, elenco[10].idade) * 1.3))
    expect(precoPedido(carreira, elenco[11])).toBe(Math.round(valorDeMercado(elenco[11].forca, elenco[11].idade) * 1.1))
  })
})

describe('proporCompra', () => {
  function cenario() {
    const carreira = novaCarreira(3, 'flamengo')
    clubePorId(carreira, 'flamengo').saldo = 1e10
    const j = alvo(carreira)
    return { carreira, j, preco: precoPedido(carreira, j) }
  }

  it('aceita oferta igual ou maior que o preco pedido', () => {
    for (const fator of [1, 1.5]) {
      const { carreira, j, preco } = cenario()
      const r = proporCompra(carreira, j.id, Math.round(preco * fator))
      expect(r.resultado).toBe('aceita')
      expect(j.clubeId).toBe('flamengo')
    }
  })

  it('faz contraproposta com o preco pedido entre 70% e o preco, e recusa abaixo', () => {
    const { carreira, j, preco } = cenario()
    for (const oferta of [Math.ceil(preco * 0.7), preco - 1]) {
      const r = proporCompra(carreira, j.id, oferta)
      expect(r).toMatchObject({ resultado: 'contraproposta', preco })
      expect(j.clubeId).toBe('palmeiras')
    }
    expect(proporCompra(carreira, j.id, Math.ceil(preco * 0.7) - 1).resultado).toBe('recusada')
    expect(j.clubeId).toBe('palmeiras')
  })

  it('o Tecnico aceita a contraproposta repetindo a oferta com o preco pedido', () => {
    const { carreira, j, preco } = cenario()
    const contra = proporCompra(carreira, j.id, Math.ceil(preco * 0.8))
    expect(contra.resultado).toBe('contraproposta')
    expect(proporCompra(carreira, j.id, contra.preco!).resultado).toBe('aceita')
    expect(j.clubeId).toBe('flamengo')
  })

  it('movimenta o dinheiro na hora nos dois Clubes e lanca no extrato', () => {
    const { carreira, j, preco } = cenario()
    const comprador = clubePorId(carreira, 'flamengo')
    const vendedor = clubePorId(carreira, 'palmeiras')
    const saldos = [comprador.saldo, vendedor.saldo]
    proporCompra(carreira, j.id, preco + 1000)
    expect(comprador.saldo).toBe(saldos[0] - preco - 1000)
    expect(vendedor.saldo).toBe(saldos[1] + preco + 1000)
    expect(comprador.extrato.transferencias).toBe(-preco - 1000)
    expect(vendedor.extrato.transferencias).toBe(preco + 1000)
  })

  it('o Jogador chega com Contrato de 3 anos e salario pedido', () => {
    const { carreira, j, preco } = cenario()
    proporCompra(carreira, j.id, preco)
    expect(j.contratoAte).toBe(carreira.ano + 3)
    expect(j.salario).toBe(salarioPedido(j.forca, j.idade, j.moral))
    expect(elencoDe(carreira, 'flamengo')).toContain(j)
  })

  it('bloqueia com saldo negativo ou insuficiente, sem fim de jogo', () => {
    const { carreira, j, preco } = cenario()
    const meu = clubePorId(carreira, 'flamengo')
    meu.saldo = preco - 1
    const insuficiente = proporCompra(carreira, j.id, preco)
    expect(insuficiente).toMatchObject({ resultado: 'bloqueada' })
    expect(insuficiente.mensagem).toMatch(/insuficiente/)
    meu.saldo = -5
    const negativo = proporCompra(carreira, j.id, 1)
    expect(negativo.resultado).toBe('bloqueada')
    expect(negativo.mensagem).toMatch(/negativo/)
    expect(j.clubeId).toBe('palmeiras')
  })

  it('respeita o limite de 32 Jogadores do comprador', () => {
    const { carreira, j, preco } = cenario()
    const outros = elencoDe(carreira, 'santos').slice(0, 7)
    for (const o of outros) o.clubeId = 'flamengo'
    expect(elencoDe(carreira, 'flamengo')).toHaveLength(32)
    const r = proporCompra(carreira, j.id, preco)
    expect(r.resultado).toBe('bloqueada')
    expect(r.mensagem).toMatch(/mais de 32/)
  })

  it('respeita o minimo de 16 Jogadores e de 2 goleiros do vendedor', () => {
    const { carreira, j, preco } = cenario()
    const resto = elencoDe(carreira, 'palmeiras').filter((x) => x !== j)
    for (const o of resto.filter((x) => x.posicao !== 'G').slice(0, 9)) o.clubeId = 'santos'
    expect(elencoDe(carreira, 'palmeiras')).toHaveLength(16)
    expect(proporCompra(carreira, j.id, preco).mensagem).toMatch(/menos de 16/)
    const goleiro = elencoDe(carreira, 'palmeiras').filter((x) => x.posicao === 'G')
    goleiro.slice(2).forEach((g) => (g.clubeId = 'santos'))
    for (const o of elencoDe(carreira, 'santos').filter((x) => x.posicao !== 'G').slice(0, 6)) o.clubeId = 'palmeiras'
    const g = goleiro[0]
    expect(elencoDe(carreira, 'palmeiras').filter((x) => x.posicao === 'G')).toHaveLength(2)
    expect(proporCompra(carreira, g.id, 1e9).mensagem).toMatch(/goleiros/)
  })

  it('recusa Jogador do proprio Clube e oferta invalida', () => {
    const { carreira } = cenario()
    const meu = elencoDe(carreira, 'flamengo')[0]
    expect(proporCompra(carreira, meu.id, 1000).resultado).toBe('bloqueada')
    expect(proporCompra(carreira, alvo(carreira).id, 0).resultado).toBe('bloqueada')
    expect(proporCompra(carreira, alvo(carreira).id, NaN).resultado).toBe('bloqueada')
  })

  it('a Rodada seguinte roda normalmente depois da compra', () => {
    const { carreira, j, preco } = cenario()
    proporCompra(carreira, j.id, preco)
    expect(j.aVenda).toBeNull()
    aplicarEscalacaoAutomatica(carreira)
    simularRodada(carreira)
    expect(carreira.proximaData).toBe(1)
  })
})

describe('buscarJogadores', () => {
  it('filtra por posicao, forca, idade e valor, sem incluir o proprio Clube', () => {
    const carreira = novaCarreira(4, 'flamengo')
    const r = buscarJogadores(carreira, { posicao: 'A', forcaMin: 60, forcaMax: 70, idadeMin: 20, idadeMax: 28, valorMax: 1_500_000 }, 1000)
    expect(r.length).toBeGreaterThan(0)
    for (const j of r) {
      expect(j.posicao).toBe('A')
      expect(j.forca).toBeGreaterThanOrEqual(60)
      expect(j.forca).toBeLessThanOrEqual(70)
      expect(j.idade).toBeGreaterThanOrEqual(20)
      expect(j.idade).toBeLessThanOrEqual(28)
      expect(valorDeMercado(j.forca, j.idade)).toBeLessThanOrEqual(1_500_000)
      expect(j.clubeId).not.toBe('flamengo')
    }
    expect(buscarJogadores(carreira, {}, 5000).length).toBe(Object.keys(carreira.jogadores).length - 25)
  })

  it('ordena por forca e respeita o limite', () => {
    const carreira = novaCarreira(4, 'flamengo')
    const r = buscarJogadores(carreira, {}, 20)
    expect(r).toHaveLength(20)
    for (let i = 1; i < r.length; i++) expect(r[i].forca).toBeLessThanOrEqual(r[i - 1].forca)
  })
})

describe('proporTroca', () => {
  function cenario() {
    const carreira = novaCarreira(5, 'flamengo')
    const meu = elencoDe(carreira, 'flamengo').filter((j) => j.posicao === 'M')[3]
    const alvo = alvoDe(carreira)
    return { carreira, meu, alvo, preco: precoPedido(carreira, alvo) }
  }
  const alvoDe = (carreira: Carreira) => porForca(carreira, 'palmeiras').filter((j) => j.posicao === 'M')[1]

  it('aceita na fronteira: valor oferecido + dinheiro igual ao preco pedido, e recusa um real abaixo', () => {
    const { carreira, meu, alvo, preco } = cenario()
    const falta = preco - valorDe(meu)
    expect(proporTroca(carreira, meu.id, alvo.id, falta - 1).resultado).toBe('recusada')
    expect(alvo.clubeId).toBe('palmeiras')
    expect(proporTroca(carreira, meu.id, alvo.id, falta).resultado).toBe('aceita')
    expect(alvo.clubeId).toBe('flamengo')
    expect(meu.clubeId).toBe('palmeiras')
  })

  it('dinheiro do Tecnico: os saldos e o extrato mudam, e os Jogadores ganham Contrato de 3 anos', () => {
    const { carreira, meu, alvo, preco } = cenario()
    clubePorId(carreira, 'flamengo').saldo = 1e10
    const falta = Math.max(1, preco - valorDe(meu))
    const saldos = ['flamengo', 'palmeiras'].map((id) => clubePorId(carreira, id).saldo)
    proporTroca(carreira, meu.id, alvo.id, falta)
    expect(clubePorId(carreira, 'flamengo').saldo).toBe(saldos[0] - falta)
    expect(clubePorId(carreira, 'palmeiras').saldo).toBe(saldos[1] + falta)
    expect(clubePorId(carreira, 'flamengo').extrato.transferencias).toBe(-falta)
    expect(meu.contratoAte).toBe(carreira.ano + 3)
    expect(alvo.contratoAte).toBe(carreira.ano + 3)
  })

  it('dinheiro para o Tecnico: a IA paga a diferenca quando o seu Jogador vale mais que o pedido', () => {
    const { carreira, alvo, preco } = cenario()
    const caro = porForca(carreira, 'flamengo')[0]
    const sobra = valorDe(caro) - preco
    expect(sobra).toBeGreaterThan(1000)
    const saldos = ['flamengo', 'palmeiras'].map((id) => clubePorId(carreira, id).saldo)
    const r = proporTroca(carreira, caro.id, alvo.id, -sobra)
    expect(r.resultado).toBe('aceita')
    expect(clubePorId(carreira, 'flamengo').saldo).toBe(saldos[0] + sobra)
    expect(clubePorId(carreira, 'palmeiras').saldo).toBe(saldos[1] - sobra)
  })

  it('a IA sem saldo para o dinheiro recusa', () => {
    const { carreira, alvo } = cenario()
    const caro = porForca(carreira, 'flamengo')[0]
    clubePorId(carreira, 'palmeiras').saldo = 10
    expect(proporTroca(carreira, caro.id, alvo.id, -1000).resultado).toBe('recusada')
    expect(alvo.clubeId).toBe('palmeiras')
  })

  it('bloqueia dinheiro do Tecnico com saldo negativo ou insuficiente', () => {
    const { carreira, meu, alvo } = cenario()
    const tecnico = clubePorId(carreira, 'flamengo')
    tecnico.saldo = 500
    expect(proporTroca(carreira, meu.id, alvo.id, 501)).toMatchObject({ resultado: 'bloqueada' })
    tecnico.saldo = -1
    expect(proporTroca(carreira, meu.id, alvo.id, 1).mensagem).toMatch(/negativo/)
    expect(alvo.clubeId).toBe('palmeiras')
  })

  it('respeita os limites de Elenco: nao deixa 2 goleiros em menos', () => {
    const { carreira, alvo } = cenario()
    const goleiros = elencoDe(carreira, 'flamengo').filter((j) => j.posicao === 'G')
    goleiros.slice(2).forEach((g) => (g.clubeId = 'santos'))
    clubePorId(carreira, 'flamengo').saldo = 1e10
    const r = proporTroca(carreira, goleiros[0].id, alvo.id, 1e9)
    expect(r.resultado).toBe('bloqueada')
    expect(r.mensagem).toMatch(/goleiros/)
  })

  it('fora da Janela a Troca nao acontece e Jogador do proprio Clube e invalido', () => {
    const { carreira, meu, alvo } = cenario()
    expect(proporTroca(carreira, meu.id, elencoDe(carreira, 'flamengo')[0].id, 0).resultado).toBe('bloqueada')
    expect(proporTroca(carreira, alvo.id, meu.id, 0).resultado).toBe('bloqueada')
    depoisDaRodada(carreira, 10)
    expect(proporTroca(carreira, meu.id, alvo.id, 1e9).mensagem).toMatch(/Janela/)
  })

  it('a Troca de um titular refaz a Escalacao e fica registrada nas transferencias recentes', () => {
    const { carreira, alvo } = cenario()
    clubePorId(carreira, 'flamengo').saldo = 1e10
    const titular = carreira.jogadores[carreira.escalacao.titulares[5]]
    proporTroca(carreira, titular.id, alvo.id, 1e9)
    expect(validarEscalacao(carreira, carreira.escalacao)).toEqual([])
    expect(carreira.transferencias).toHaveLength(2)
    expect(carreira.transferencias.every((t) => t.troca)).toBe(true)
    expect(carreira.transferencias.map((t) => t.nome).sort()).toEqual([alvo.nome, titular.nome].sort())
  })
})

describe('transferencias recentes', () => {
  it('toda compra do Tecnico e registrada com valor, clubes e momento', () => {
    const carreira = novaCarreira(3, 'flamengo')
    clubePorId(carreira, 'flamengo').saldo = 1e10
    const j = alvo(carreira)
    const preco = precoPedido(carreira, j)
    proporCompra(carreira, j.id, preco)
    expect(carreira.transferencias).toEqual([{ ano: 2026, rodada: 0, jogadorId: j.id, nome: j.nome, deId: 'palmeiras', paraId: 'flamengo', valor: preco, troca: false }])
  })

  it('guarda so as mais recentes', () => {
    const carreira = novaCarreira(3, 'flamengo')
    clubePorId(carreira, 'flamengo').saldo = 1e12
    const jogadores = buscarJogadores(carreira, {}, MAX_TRANSFERENCIAS_RECENTES + 5)
    for (const j of jogadores) transferir(carreira, j, 'flamengo', 1)
    expect(carreira.transferencias).toHaveLength(MAX_TRANSFERENCIAS_RECENTES)
    expect(carreira.transferencias[MAX_TRANSFERENCIAS_RECENTES - 1].jogadorId).toBe(jogadores[MAX_TRANSFERENCIAS_RECENTES + 4].id)
  })
})
