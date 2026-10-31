import { elencoDe } from './elenco'
import { ELENCO_MAXIMO, ELENCO_MINIMO, GOLEIROS_MINIMOS } from './evolucao'
import { clubePorId, lancar } from './financas'
import { salarioPedido, valorDeMercado } from './jogadores'
import { aplicarEscalacaoAutomatica } from './tatica'
import type { Carreira, Jogador, Posicao } from './tipos'

export const DURACAO_CONTRATO_COMPRA = 3
export const MELHORES_DO_CLUBE = 11
export const FATOR_PRECO_DOS_MELHORES = 1.3
export const FATOR_PRECO_DOS_DEMAIS = 1.1
export const FRACAO_MINIMA_DA_CONTRAPROPOSTA = 0.7
export const MAX_TRANSFERENCIAS_RECENTES = 100

const JANELAS: [min: number, max: number][] = [
  [0, 3],
  [19, 22],
]

export const rodadasJogadas = (carreira: Carreira) => carreira.calendario.slice(0, carreira.proximaData).filter((d) => d.tipo === 'divisao').length

export function janelaAberta(carreira: Carreira): boolean {
  const n = rodadasJogadas(carreira)
  return JANELAS.some(([min, max]) => n >= min && n <= max)
}

export const valorDe = (j: Jogador) => valorDeMercado(j.forca, j.idade)

function entreOsMelhores(carreira: Carreira, jogador: Jogador): boolean {
  const melhores = elencoDe(carreira, jogador.clubeId).sort((a, b) => b.forca - a.forca || a.id.localeCompare(b.id, 'en', { numeric: true }))
  return melhores.slice(0, MELHORES_DO_CLUBE).includes(jogador)
}

export function precoPedido(carreira: Carreira, jogador: Jogador): number {
  return Math.round(valorDe(jogador) * (entreOsMelhores(carreira, jogador) ? FATOR_PRECO_DOS_MELHORES : FATOR_PRECO_DOS_DEMAIS))
}

export function erroDeElenco(carreira: Carreira, clubeId: string, saem: readonly Jogador[], entram: readonly Jogador[]): string | null {
  const antes = elencoDe(carreira, clubeId)
  const depois = [...antes.filter((j) => !saem.includes(j)), ...entram]
  const goleiros = (elenco: readonly Jogador[]) => elenco.filter((j) => j.posicao === 'G').length
  const nome = clubePorId(carreira, clubeId).nome
  if (depois.length > ELENCO_MAXIMO && depois.length > antes.length) return `${nome} ficaria com mais de ${ELENCO_MAXIMO} Jogadores.`
  if (depois.length < ELENCO_MINIMO && depois.length < antes.length) return `${nome} ficaria com menos de ${ELENCO_MINIMO} Jogadores.`
  if (goleiros(depois) < GOLEIROS_MINIMOS && goleiros(depois) < goleiros(antes)) return `${nome} ficaria com menos de ${GOLEIROS_MINIMOS} goleiros.`
  return null
}

export function contratarJogador(carreira: Carreira, jogador: Jogador, clubeId: string): void {
  const doTecnico = [jogador.clubeId, clubeId].includes(carreira.clubeId)
  carreira.propostas = carreira.propostas.filter((p) => p.jogadorId !== jogador.id)
  jogador.clubeId = clubeId
  jogador.contratoAte = carreira.ano + DURACAO_CONTRATO_COMPRA
  jogador.salario = salarioPedido(jogador.forca, jogador.idade, jogador.moral)
  jogador.aVenda = null
  if (doTecnico) {
    const { titulares, reservas } = carreira.escalacao
    if ([...titulares, ...reservas].some((id) => carreira.jogadores[id].clubeId !== carreira.clubeId)) aplicarEscalacaoAutomatica(carreira)
  }
}

function registrar(carreira: Carreira, jogador: Jogador, paraId: string, valor: number, troca: boolean): void {
  carreira.transferencias.push({ ano: carreira.ano, rodada: rodadasJogadas(carreira), jogadorId: jogador.id, nome: jogador.nome, deId: jogador.clubeId, paraId, valor, troca })
  if (carreira.transferencias.length > MAX_TRANSFERENCIAS_RECENTES) carreira.transferencias.shift()
}

export function transferir(carreira: Carreira, jogador: Jogador, destinoId: string, valor: number): void {
  lancar(clubePorId(carreira, destinoId), 'transferencias', -valor)
  lancar(clubePorId(carreira, jogador.clubeId), 'transferencias', valor)
  registrar(carreira, jogador, destinoId, valor, false)
  contratarJogador(carreira, jogador, destinoId)
}

export interface RespostaDeCompra {
  resultado: 'aceita' | 'contraproposta' | 'recusada' | 'bloqueada'
  mensagem: string
  preco?: number
}

const bloqueada = (mensagem: string): RespostaDeCompra => ({ resultado: 'bloqueada', mensagem })

export function proporCompra(carreira: Carreira, jogadorId: string, oferta: number): RespostaDeCompra {
  const jogador = carreira.jogadores[jogadorId]
  if (!janelaAberta(carreira)) return bloqueada('A Janela de transferências está fechada.')
  if (!jogador || jogador.clubeId === carreira.clubeId) return bloqueada('Escolha um Jogador de outro Clube.')
  if (!Number.isFinite(oferta) || oferta <= 0) return bloqueada('Informe um valor de oferta maior que zero.')
  oferta = Math.round(oferta)
  const saldo = clubePorId(carreira, carreira.clubeId).saldo
  if (saldo < 0) return bloqueada('Seu saldo está negativo: as compras estão bloqueadas.')
  if (saldo < oferta) return bloqueada('Saldo insuficiente para esta oferta.')
  const erro = erroDeElenco(carreira, jogador.clubeId, [jogador], []) ?? erroDeElenco(carreira, carreira.clubeId, [], [jogador])
  if (erro) return bloqueada(erro)
  const preco = precoPedido(carreira, jogador)
  if (oferta >= preco) {
    transferir(carreira, jogador, carreira.clubeId, oferta)
    return { resultado: 'aceita', mensagem: `${jogador.nome} é seu por R$ ${oferta.toLocaleString('pt-BR')}.` }
  }
  if (oferta >= preco * FRACAO_MINIMA_DA_CONTRAPROPOSTA) return { resultado: 'contraproposta', preco, mensagem: `O Clube pede R$ ${preco.toLocaleString('pt-BR')}.` }
  return { resultado: 'recusada', mensagem: 'O Clube recusou a oferta.' }
}

export interface FiltroDeBusca {
  posicao?: Posicao
  forcaMin?: number
  forcaMax?: number
  idadeMin?: number
  idadeMax?: number
  valorMax?: number
}

export function buscarJogadores(carreira: Carreira, f: FiltroDeBusca, limite = 100): Jogador[] {
  return Object.values(carreira.jogadores)
    .filter(
      (j) =>
        j.clubeId !== carreira.clubeId &&
        (!f.posicao || j.posicao === f.posicao) &&
        j.forca >= (f.forcaMin ?? 0) &&
        j.forca <= (f.forcaMax ?? 99) &&
        j.idade >= (f.idadeMin ?? 0) &&
        j.idade <= (f.idadeMax ?? 99) &&
        valorDe(j) <= (f.valorMax ?? Infinity),
    )
    .sort((a, b) => b.forca - a.forca || a.id.localeCompare(b.id, 'en', { numeric: true }))
    .slice(0, limite)
}

export interface RespostaDeTroca {
  resultado: 'aceita' | 'recusada' | 'bloqueada'
  mensagem: string
}

export function proporTroca(carreira: Carreira, meuJogadorId: string, alvoId: string, dinheiro: number): RespostaDeTroca {
  const meu = carreira.jogadores[meuJogadorId]
  const alvo = carreira.jogadores[alvoId]
  const bloqueada = (mensagem: string): RespostaDeTroca => ({ resultado: 'bloqueada', mensagem })
  if (!janelaAberta(carreira)) return bloqueada('A Janela de transferências está fechada.')
  if (!meu || meu.clubeId !== carreira.clubeId) return bloqueada('Escolha um Jogador do seu Elenco para oferecer.')
  if (!alvo || alvo.clubeId === carreira.clubeId) return bloqueada('Escolha um Jogador de outro Clube.')
  if (!Number.isFinite(dinheiro)) return bloqueada('Informe um valor em dinheiro válido.')
  dinheiro = Math.round(dinheiro)
  const tecnico = clubePorId(carreira, carreira.clubeId)
  const ia = clubePorId(carreira, alvo.clubeId)
  if (dinheiro > 0 && tecnico.saldo < 0) return bloqueada('Seu saldo está negativo: não dá para pagar dinheiro na Troca.')
  if (dinheiro > 0 && tecnico.saldo < dinheiro) return bloqueada('Saldo insuficiente para o dinheiro oferecido.')
  const erro = erroDeElenco(carreira, tecnico.id, [meu], [alvo]) ?? erroDeElenco(carreira, ia.id, [alvo], [meu])
  if (erro) return bloqueada(erro)
  if (dinheiro < 0 && ia.saldo < -dinheiro) return { resultado: 'recusada', mensagem: `${ia.nome} não tem saldo para pagar esse dinheiro.` }
  if (valorDe(meu) + dinheiro < precoPedido(carreira, alvo)) return { resultado: 'recusada', mensagem: `${ia.nome} recusou a Troca.` }
  lancar(tecnico, 'transferencias', -dinheiro)
  lancar(ia, 'transferencias', dinheiro)
  registrar(carreira, meu, ia.id, 0, true)
  registrar(carreira, alvo, tecnico.id, 0, true)
  contratarJogador(carreira, meu, ia.id)
  contratarJogador(carreira, alvo, tecnico.id)
  return { resultado: 'aceita', mensagem: `Troca fechada: ${meu.nome} por ${alvo.nome}.` }
}
