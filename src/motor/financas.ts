import type { CategoriaFinanceira, Carreira, Clube, Divisao, DivisaoJogavel, Extrato, Porte } from './tipos'

export const CATEGORIAS: CategoriaFinanceira[] = ['salarios', 'patrocinio', 'bilheteria', 'premiacao', 'transferencias']

export const PATROCINIO_POR_PORTE: Record<Porte, number> = { 5: 23_500_000, 4: 12_000_000, 3: 5_000_000, 2: 2_600_000, 1: 1_400_000 }
export const FATOR_PATROCINIO_DIVISAO: Record<Divisao, number> = { A: 1, B: 0.85, C: 0.7, D: 0.6 }
export const ANO_BASE_PATROCINIO = 2026
export const CRESCIMENTO_ANUAL_PATROCINIO = 0.2
const FATOR_MAXIMO_PATROCINIO = Number.MAX_SAFE_INTEGER / Math.max(...Object.values(PATROCINIO_POR_PORTE))
export const BILHETERIA_POR_PORTE: Record<Porte, number> = { 5: 600_000, 4: 300_000, 3: 125_000, 2: 65_000, 1: 35_000 }
export const PREMIO_COPA = [150_000, 250_000, 500_000, 1_000_000, 2_000_000, 5_000_000]
export const PREMIO_TOPO_DA_DIVISAO: Record<DivisaoJogavel, number> = { A: 4_000_000, B: 1_200_000, C: 600_000 }
export const RODADAS_DE_DIVISAO = 38
export const JOGOS_DO_DESEMPENHO = 5

export const extratoZerado = (): Extrato => ({ salarios: 0, patrocinio: 0, bilheteria: 0, premiacao: 0, transferencias: 0 })

export function lancar(clube: Clube, categoria: CategoriaFinanceira, valor: number): void {
  const saldo = clube.saldo + valor
  const acumulado = clube.extrato[categoria] + valor
  if (![valor, saldo, acumulado].every(Number.isFinite)) throw new Error('O lançamento financeiro precisa ser finito.')
  clube.saldo = saldo
  clube.extrato[categoria] = acumulado
}

export const clubePorId = (carreira: Carreira, id: string) => carreira.clubes.find((c) => c.id === id)!

export function folhaMensal(carreira: Carreira, clubeId: string): number {
  const folha = Object.values(carreira.jogadores).reduce((s, j) => (j.clubeId === clubeId ? s + j.salario : s), 0)
  if (!Number.isFinite(folha)) throw new Error('A folha salarial precisa ser finita.')
  return folha
}

export function pagarDataDeDivisao(carreira: Carreira): void {
  const fatorAnual = 1 + CRESCIMENTO_ANUAL_PATROCINIO
  const anos = Math.min(carreira.ano - ANO_BASE_PATROCINIO, Math.log(FATOR_MAXIMO_PATROCINIO) / Math.log(fatorAnual))
  const crescimento = fatorAnual ** anos
  const folha = new Map<string, number>()
  for (const j of Object.values(carreira.jogadores)) folha.set(j.clubeId, (folha.get(j.clubeId) ?? 0) + j.salario)
  if (![...folha.values()].every(Number.isFinite)) throw new Error('A folha salarial precisa ser finita.')
  for (const clube of carreira.clubes) {
    lancar(clube, 'salarios', -Math.round(((folha.get(clube.id) ?? 0) / RODADAS_DE_DIVISAO) * 12))
    lancar(clube, 'patrocinio', Math.round((PATROCINIO_POR_PORTE[clube.porte] * FATOR_PATROCINIO_DIVISAO[clube.divisao] * crescimento) / RODADAS_DE_DIVISAO))
  }
}

export function aproveitamentoRecente(carreira: Carreira, clubeId: string, ate: number): number {
  let pontos = 0
  let jogos = 0
  for (let i = ate - 1; i >= 0 && jogos < JOGOS_DO_DESEMPENHO; i--) {
    const p = carreira.calendario[i].partidas.find((j) => j.casaId === clubeId || j.foraId === clubeId)
    if (!p?.resultado) continue
    const { golsCasa, golsFora } = p.resultado
    const saldo = p.casaId === clubeId ? golsCasa - golsFora : golsFora - golsCasa
    pontos += saldo > 0 ? 3 : saldo === 0 ? 1 : 0
    jogos++
  }
  return jogos ? pontos / (3 * jogos) : 0.5
}

export function receberBilheteria(carreira: Carreira, mandanteId: string, indiceData: number): void {
  const clube = clubePorId(carreira, mandanteId)
  const fator = 0.8 + 0.4 * aproveitamentoRecente(carreira, mandanteId, indiceData)
  lancar(clube, 'bilheteria', Math.round(BILHETERIA_POR_PORTE[clube.porte] * fator))
}

export function pagarPremioCopa(carreira: Carreira, clubeId: string, fase: number): void {
  lancar(clubePorId(carreira, clubeId), 'premiacao', PREMIO_COPA[fase])
}

export function premioDaPosicao(divisao: DivisaoJogavel, posicao: number): number {
  return Math.round(PREMIO_TOPO_DA_DIVISAO[divisao] * (1 - (0.9 * (posicao - 1)) / 19))
}
