import { elencoDe } from './elenco'
import { clubePorId } from './financas'
import { erroDeElenco, janelaAberta, transferir, valorDe } from './mercado'
import { escolher, proximo } from './rng'
import type { Carreira, PropostaDaIA } from './tipos'

export const CHANCE_POR_DATA_A_VENDA = 0.25
export const CHANCE_POR_DATA_OCASIONAL = 0.01
export const OFERTA_MINIMA = 0.85
export const OFERTA_AMPLITUDE = 0.3
export const TETO_DA_CONTRAPROPOSTA = 1.2
export const DIFERENCA_DE_PORTE = 1

export function definirAVenda(carreira: Carreira, jogadorId: string, preco: number | null): string | null {
  const j = carreira.jogadores[jogadorId]
  if (!j || j.clubeId !== carreira.clubeId) return 'O Jogador não é do seu Elenco.'
  if (preco !== null && (!Number.isFinite(preco) || preco <= 0)) return 'Informe um preço maior que zero.'
  j.aVenda = preco === null ? null : Math.round(preco)
  return null
}

export function gerarPropostas(carreira: Carreira): void {
  const tecnico = clubePorId(carreira, carreira.clubeId)
  for (const j of elencoDe(carreira, tecnico.id)) {
    if (proximo(carreira.rng) >= (j.aVenda !== null ? CHANCE_POR_DATA_A_VENDA : CHANCE_POR_DATA_OCASIONAL)) continue
    const compradores = carreira.clubes.filter(
      (c) => c.id !== tecnico.id && Math.abs(c.porte - tecnico.porte) <= DIFERENCA_DE_PORTE && !carreira.propostas.some((p) => p.jogadorId === j.id && p.compradorId === c.id),
    )
    if (!compradores.length) continue
    const comprador = escolher(carreira.rng, compradores)
    const valor = Math.round((j.aVenda ?? valorDe(j)) * (OFERTA_MINIMA + OFERTA_AMPLITUDE * proximo(carreira.rng)))
    if (comprador.saldo < valor || erroDeElenco(carreira, comprador.id, [], [j]) || erroDeElenco(carreira, tecnico.id, [j], [])) continue
    carreira.propostas.push({ compradorId: comprador.id, jogadorId: j.id, valor })
  }
}

export function atualizarPropostas(carreira: Carreira): void {
  if (janelaAberta(carreira)) gerarPropostas(carreira)
  else carreira.propostas = []
}

function concluir(carreira: Carreira, proposta: PropostaDaIA, valor: number): string | null {
  const j = carreira.jogadores[proposta.jogadorId]
  if (!j || j.clubeId !== carreira.clubeId) return 'O Jogador não é do seu Elenco.'
  if (!carreira.propostas.includes(proposta)) return 'Esta Proposta não está mais pendente.'
  if (!janelaAberta(carreira)) return 'A Janela de transferências está fechada.'
  if (clubePorId(carreira, proposta.compradorId).saldo < valor) return 'O Clube comprador não tem mais saldo para esta Proposta.'
  const erro = erroDeElenco(carreira, carreira.clubeId, [j], []) ?? erroDeElenco(carreira, proposta.compradorId, [], [j])
  if (erro) return erro
  transferir(carreira, j, proposta.compradorId, valor)
  return null
}

export function aceitarProposta(carreira: Carreira, proposta: PropostaDaIA): string | null {
  return concluir(carreira, proposta, proposta.valor)
}

export function recusarProposta(carreira: Carreira, proposta: PropostaDaIA): void {
  carreira.propostas = carreira.propostas.filter((p) => p !== proposta)
}

export interface RespostaDeContraproposta {
  resultado: 'aceita' | 'desistiu' | 'bloqueada'
  mensagem: string
}

export function contrapropor(carreira: Carreira, proposta: PropostaDaIA, valor: number): RespostaDeContraproposta {
  const j = carreira.jogadores[proposta.jogadorId]
  if (!j || j.clubeId !== carreira.clubeId) return { resultado: 'bloqueada', mensagem: 'O Jogador não é do seu Elenco.' }
  if (!carreira.propostas.includes(proposta)) return { resultado: 'bloqueada', mensagem: 'Esta Proposta não está mais pendente.' }
  if (!Number.isFinite(valor) || valor <= 0) return { resultado: 'bloqueada', mensagem: 'Informe um valor maior que zero.' }
  valor = Math.round(valor)
  if (valor > valorDe(j) * TETO_DA_CONTRAPROPOSTA) {
    recusarProposta(carreira, proposta)
    return { resultado: 'desistiu', mensagem: 'O Clube desistiu da Proposta.' }
  }
  const erro = concluir(carreira, proposta, valor)
  return erro ? { resultado: 'bloqueada', mensagem: erro } : { resultado: 'aceita', mensagem: `Venda fechada por R$ ${valor.toLocaleString('pt-BR')}.` }
}
