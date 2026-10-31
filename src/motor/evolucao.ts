import { elencoDe } from './elenco'
import { COMPOSICAO_ELENCO, FORCA_MEDIA_POR_PORTE, gerarJogador, gerarJogadorDaBase } from './jogadores'
import { aproxNormal, inteiro, proximo } from './rng'
import { POSICOES } from './tatica'
import type { Carreira, Jogador, Posicao } from './tipos'

export const ELENCO_MINIMO = 16
export const ELENCO_ALVO = 22
export const ELENCO_MAXIMO = 32
export const GOLEIROS_MINIMOS = 2
export const IDADE_PRIMEIRA_APOSENTADORIA = 34

export const FRACAO_DO_POTENCIAL_POR_ANO = 0.4
export const RUIDO_DA_EVOLUCAO = 4
const EVOLUCAO_MEDIA_POR_IDADE: [maxIdade: number, pontos: number][] = [
  [27, 0.7],
  [30, -0.5],
  [33, -2],
  [Infinity, -4],
]

const limitar = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

function evoluir(carreira: Carreira, j: Jogador): void {
  const ruido = aproxNormal(carreira.rng) * RUIDO_DA_EVOLUCAO
  if (j.idade <= 21) {
    const folga = Math.max(0, j.potencial - j.forca)
    j.forca += limitar(Math.round(folga * FRACAO_DO_POTENCIAL_POR_ANO + ruido), 0, folga)
  } else {
    j.forca = limitar(j.forca + Math.round(EVOLUCAO_MEDIA_POR_IDADE.find(([maxIdade]) => j.idade <= maxIdade)![1] + ruido), 1, 99)
  }
  j.potencial = Math.max(j.potencial, j.forca)
  j.idade++
}

export const chanceDeAposentadoria = (idade: number) => (idade < IDADE_PRIMEIRA_APOSENTADORIA ? 0 : Math.min(1, (idade - 33) * 0.2))

export function envelhecerEAposentar(carreira: Carreira): Jogador[] {
  const aposentados: Jogador[] = []
  for (const j of Object.values(carreira.jogadores)) {
    evoluir(carreira, j)
    if (proximo(carreira.rng) < chanceDeAposentadoria(j.idade)) {
      delete carreira.jogadores[j.id]
      if (j.clubeId === carreira.clubeId) aposentados.push(j)
    }
  }
  return aposentados
}

export function posicaoMaisCarente(elenco: readonly Jogador[]): Posicao {
  const faltam = (p: Posicao) => COMPOSICAO_ELENCO.filter((x) => x === p).length - elenco.filter((j) => j.posicao === p).length
  if (elenco.filter((j) => j.posicao === 'G').length < GOLEIROS_MINIMOS) return 'G'
  return POSICOES.reduce((a, b) => (faltam(b) > faltam(a) ? b : a))
}

const precisaDeReposicao = (elenco: readonly Jogador[]) =>
  elenco.length < ELENCO_MAXIMO && (elenco.length < ELENCO_ALVO || elenco.filter((j) => j.posicao === 'G').length < GOLEIROS_MINIMOS)

export function completarElencos(carreira: Carreira, novoAno: number): { base: Jogador[]; repostos: Jogador[] } {
  const doTecnico = { base: [] as Jogador[], repostos: [] as Jogador[] }
  const novoId = () => `j${carreira.proximoJogadorId++}`
  for (const clube of carreira.clubes) {
    const elenco = elencoDe(carreira, clube.id)
    const forcaMedia = FORCA_MEDIA_POR_PORTE[clube.porte]
    const adicionar = (j: Jogador, destino: Jogador[]) => {
      carreira.jogadores[j.id] = j
      elenco.push(j)
      if (clube.id === carreira.clubeId) destino.push(j)
    }
    const vagasDaBase = Math.min(inteiro(carreira.rng, 2, 3), ELENCO_MAXIMO - elenco.length)
    for (let i = 0; i < vagasDaBase; i++) adicionar(gerarJogadorDaBase(carreira.rng, novoId(), clube.id, posicaoMaisCarente(elenco), forcaMedia, novoAno), doTecnico.base)
    while (precisaDeReposicao(elenco)) adicionar(gerarJogador(carreira.rng, novoId(), clube.id, posicaoMaisCarente(elenco), forcaMedia, novoAno), doTecnico.repostos)
  }
  return doTecnico
}
