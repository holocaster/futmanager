import { elencoDe } from './elenco'
import { salarioPedido } from './jogadores'
import { inteiro } from './rng'
import type { Carreira, Jogador } from './tipos'

export const DURACAO_MINIMA = 1
export const DURACAO_MAXIMA = 5
export const DURACAO_MAXIMA_IA = 4
export const IDADE_LIMITE_RENOVACAO_IA = 33

export function renovarContrato(carreira: Carreira, jogadorId: string, anos: number): string | null {
  const j = carreira.jogadores[jogadorId]
  if (!j || j.clubeId !== carreira.clubeId) return 'O Jogador não é do seu Elenco.'
  if (!Number.isInteger(anos) || anos < DURACAO_MINIMA || anos > DURACAO_MAXIMA) return `A duração do Contrato vai de ${DURACAO_MINIMA} a ${DURACAO_MAXIMA} anos.`
  j.contratoAte = Math.max(j.contratoAte, carreira.ano + anos)
  j.salario = Math.max(j.salario, salarioPedido(j.forca, j.idade, j.moral))
  return null
}

function mediana(valores: number[]): number {
  const v = [...valores].sort((a, b) => a - b)
  const meio = Math.floor(v.length / 2)
  return v.length % 2 ? v[meio] : (v[meio - 1] + v[meio]) / 2
}

export function encerrarContratos(carreira: Carreira): Jogador[] {
  const sairam: Jogador[] = []
  for (const clube of carreira.clubes) {
    const elenco = elencoDe(carreira, clube.id)
    const forcaMediana = mediana(elenco.map((j) => j.forca))
    for (const j of elenco.filter((x) => x.contratoAte <= carreira.ano)) {
      const renova = clube.id !== carreira.clubeId && j.forca > forcaMediana && j.idade < IDADE_LIMITE_RENOVACAO_IA
      if (renova) {
        j.contratoAte = carreira.ano + inteiro(carreira.rng, DURACAO_MINIMA, DURACAO_MAXIMA_IA)
        j.salario = Math.max(j.salario, salarioPedido(j.forca, j.idade, j.moral))
      } else {
        delete carreira.jogadores[j.id]
        if (clube.id === carreira.clubeId) sairam.push(j)
      }
    }
  }
  return sairam
}
