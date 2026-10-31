import { ELENCO_ALVO, ELENCO_MAXIMO, posicaoMaisCarente } from './evolucao'
import { erroDeElenco, janelaAberta, precoPedido, transferir } from './mercado'
import { escolher } from './rng'
import type { Carreira, Jogador } from './tipos'

export const TENTATIVAS_POR_DATA = 3

export function tentarTransferencia(carreira: Carreira): void {
  const elencos = new Map<string, Jogador[]>(carreira.clubes.map((c) => [c.id, []]))
  for (const j of Object.values(carreira.jogadores)) elencos.get(j.clubeId)!.push(j)
  const doutros = carreira.clubes.filter((c) => c.id !== carreira.clubeId)
  const compradores = doutros.filter((c) => c.saldo > 0 && elencos.get(c.id)!.length < ELENCO_MAXIMO)
  if (!compradores.length) return
  const carentes = compradores.filter((c) => elencos.get(c.id)!.length < ELENCO_ALVO)
  const comprador = escolher(carreira.rng, carentes.length ? carentes : compradores)
  const elenco = elencos.get(comprador.id)!
  const posicao = posicaoMaisCarente(elenco)
  const forcas = elenco.filter((j) => j.posicao === posicao).map((j) => j.forca)
  const pior = forcas.length ? Math.min(...forcas) : 0
  const vendedores = doutros.filter((c) => c.id !== comprador.id && c.porte <= comprador.porte && elencos.get(c.id)!.length > ELENCO_ALVO)
  const candidatos = vendedores.flatMap((c) => elencos.get(c.id)!.filter((j) => j.posicao === posicao && j.forca > pior))
  if (!candidatos.length) return
  const jogador = escolher(carreira.rng, candidatos)
  const preco = precoPedido(carreira, jogador)
  if (comprador.saldo < preco || erroDeElenco(carreira, jogador.clubeId, [jogador], []) || erroDeElenco(carreira, comprador.id, [], [jogador])) return
  transferir(carreira, jogador, comprador.id, preco)
}

export function transferenciasDaIA(carreira: Carreira): void {
  if (!janelaAberta(carreira)) return
  for (let i = 0; i < TENTATIVAS_POR_DATA; i++) tentarTransferencia(carreira)
}
