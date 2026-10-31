import { embaralhar } from './rng'
import type { Clube, DataCalendario, Divisao, PartidaAgendada, Rng } from './tipos'

export const RODADAS_ANTES_DA_COPA = [3, 6, 9, 12, 15, 18, 24, 28, 32, 36]

export function gerarRodadas(ids: readonly string[]): [string, string][][] {
  const n = ids.length
  const resto = ids.slice(1)
  const turno: [string, string][][] = []
  for (let r = 0; r < n - 1; r++) {
    const rodada: [string, string][] = []
    const circulo = [ids[0], ...resto.slice(n - 1 - r), ...resto.slice(0, n - 1 - r)]
    for (let i = 0; i < n / 2; i++) {
      const a = circulo[i]
      const b = circulo[n - 1 - i]
      rodada.push((i === 0) === (r % 2 === 0) ? [a, b] : [b, a])
    }
    turno.push(rodada)
  }
  const returno = turno.map((rodada) => rodada.map(([casa, fora]): [string, string] => [fora, casa]))
  return [...turno, ...returno]
}

export function montarCalendario(rng: Rng, clubes: readonly Clube[]): DataCalendario[] {
  const porDivisao = (['A', 'B', 'C'] as Divisao[]).map((divisao) => ({
    divisao,
    rodadas: gerarRodadas(embaralhar(rng, clubes.filter((c) => c.divisao === divisao).map((c) => c.id))),
  }))
  const datas = Array.from({ length: 38 }, (_, i): DataCalendario => ({
    tipo: 'divisao',
    rodada: i + 1,
    partidas: porDivisao.flatMap(({ divisao, rodadas }) =>
      rodadas[i].map(([casaId, foraId]): PartidaAgendada => ({ divisao, casaId, foraId, resultado: null })),
    ),
  }))
  return datas.flatMap((data) => {
    const k = RODADAS_ANTES_DA_COPA.indexOf(data.rodada)
    return k < 0 ? [data] : [data, { tipo: 'copa', rodada: k + 1, partidas: [] }]
  })
}
