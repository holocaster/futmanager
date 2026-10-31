import type { Carreira, Jogador } from './tipos'

export function elencoDe(carreira: Carreira, clubeId: string): Jogador[] {
  return Object.values(carreira.jogadores).filter((j) => j.clubeId === clubeId)
}
