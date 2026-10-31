import { montarCalendario } from './calendario'
import { CLUBES } from './clubes'
import { criarCopa, iniciarCopa } from './copa'
import { extratoZerado } from './financas'
import { COMPOSICAO_ELENCO, FORCA_MEDIA_POR_PORTE, gerarJogador } from './jogadores'
import { criarRng, proximo } from './rng'
import { escalarAutomatico, FORMACAO_IA, POSTURA_IA } from './tatica'
import type { Carreira, Jogador, Porte } from './tipos'

export const VERSAO_CARREIRA = 8
export const ANO_INICIAL = 2026

export const SALDO_INICIAL: Record<Porte, number> = {
  5: 60_000_000,
  4: 30_000_000,
  3: 12_000_000,
  2: 5_000_000,
  1: 2_000_000,
}

export function novaCarreira(seed: number, clubeId: string): Carreira {
  const escolhido = CLUBES.find((c) => c.id === clubeId)
  if (!escolhido || escolhido.divisao === 'D') throw new Error(`Clube invalido para iniciar carreira: ${clubeId}`)

  const rng = criarRng(seed)
  const jogadores: Record<string, Jogador> = {}
  let proximoJogadorId = 1
  for (const clube of CLUBES) {
    for (const posicao of COMPOSICAO_ELENCO) {
      const id = `j${proximoJogadorId++}`
      jogadores[id] = gerarJogador(rng, id, clube.id, posicao, FORCA_MEDIA_POR_PORTE[clube.porte], ANO_INICIAL)
    }
  }

  const clubes = CLUBES.map((c) => ({ ...c, cores: [...c.cores] as [string, string], saldo: SALDO_INICIAL[c.porte], extrato: extratoZerado() }))
  const calendario = montarCalendario(rng, clubes)
  const desempate = Object.fromEntries(clubes.map((c) => [c.id, proximo(rng)]))
  const copa = criarCopa(rng, clubes, clubeId)

  const elencoDoTecnico = Object.values(jogadores).filter((j) => j.clubeId === clubeId)
  const escalacao = { formacao: FORMACAO_IA, postura: POSTURA_IA, ...escalarAutomatico(elencoDoTecnico, FORMACAO_IA) }

  const carreira: Carreira = {
    versao: VERSAO_CARREIRA,
    ano: ANO_INICIAL,
    clubeId,
    rng,
    escalacao,
    proximoJogadorId,
    clubes,
    jogadores,
    calendario,
    proximaData: 0,
    desempate,
    copa,
    historico: [],
    propostas: [],
    transferencias: [],
    artilharia: [],
  }
  iniciarCopa(carreira)
  return carreira
}
