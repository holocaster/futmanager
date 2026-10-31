import type { Jogador } from '../motor/tipos'

export const CONDICAO_BAIXA = 80

export function dinheiro(valor: number): string {
  const sinal = valor < 0 ? '-' : ''
  const v = Math.abs(valor)
  if (v >= 1_000_000) return `${sinal}R$ ${(v / 1_000_000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mi`
  if (v >= 1_000) return `${sinal}R$ ${Math.round(v / 1_000).toLocaleString('pt-BR')} mil`
  return `${sinal}R$ ${v}`
}

export function situacao(j: Jogador): string {
  if (j.lesao > 0) return `Lesionado (${j.lesao})`
  if (j.suspensao > 0) return 'Suspenso'
  if (j.amarelos === 2) return 'Pendurado'
  if (j.amarelos === 1) return '1 amarelo'
  return ''
}
