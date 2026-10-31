import { pagarPremioCopa } from './financas'
import { embaralhar } from './rng'
import type { Carreira, Clube, ConfrontoCopa, Copa, PartidaAgendada, PernaCopa, Rng } from './tipos'

export const FASES = [
  { nome: '1ª fase', idaEVolta: false },
  { nome: '2ª fase', idaEVolta: false },
  { nome: 'Oitavas de final', idaEVolta: true },
  { nome: 'Quartas de final', idaEVolta: true },
  { nome: 'Semifinal', idaEVolta: true },
  { nome: 'Final', idaEVolta: true },
]

const DATAS_COPA = FASES.flatMap((_, fase): { fase: number; perna: PernaCopa }[] =>
  FASES[fase].idaEVolta ? [{ fase, perna: 'ida' }, { fase, perna: 'volta' }] : [{ fase, perna: 'unica' }],
)

export function criarCopa(rng: Rng, clubes: readonly Clube[], clubeId: string): Copa {
  const pool = clubes.filter((c) => c.divisao === 'D')
  const obrigatorio = pool.filter((c) => c.id === clubeId)
  const sorteados = embaralhar(rng, pool.filter((c) => c.id !== clubeId)).slice(0, 4 - obrigatorio.length)
  const participantes = [...clubes.filter((c) => c.divisao !== 'D'), ...obrigatorio, ...sorteados].map((c) => c.id)
  return { participantes, fases: [], campeaoId: null }
}

const indicesDaCopa = (carreira: Carreira) => carreira.calendario.flatMap((d, i) => (d.tipo === 'copa' ? [i] : []))

function datasDaFase(carreira: Carreira, fase: number): number[] {
  return indicesDaCopa(carreira).filter((_, k) => DATAS_COPA[k].fase === fase)
}

export function rotuloDaData(carreira: Carreira, indice: number): string {
  const data = carreira.calendario[indice]
  if (data.tipo === 'divisao') return `Rodada ${data.rodada}`
  const { fase, perna } = DATAS_COPA[data.rodada - 1]
  return `Copa do Brasil - ${FASES[fase].nome}${perna === 'unica' ? '' : perna === 'ida' ? ' (ida)' : ' (volta)'}`
}

export function sortearFase(carreira: Carreira, fase: number, ids: readonly string[]): void {
  const sorteados = embaralhar(carreira.rng, ids)
  const confrontos: ConfrontoCopa[] = []
  for (let i = 0; i < sorteados.length; i += 2) confrontos.push({ primeiroId: sorteados[i], segundoId: sorteados[i + 1], vencedorId: null })
  carreira.copa.fases[fase] = confrontos
  const divisaoDe = new Map(carreira.clubes.map((c) => [c.id, c.divisao]))
  const indices = indicesDaCopa(carreira)
  indices.forEach((indice, k) => {
    if (DATAS_COPA[k].fase !== fase) return
    const perna = DATAS_COPA[k].perna
    carreira.calendario[indice].partidas = confrontos.map((c): PartidaAgendada => {
      const casaId = perna === 'volta' ? c.segundoId : c.primeiroId
      return { divisao: divisaoDe.get(casaId)!, casaId, foraId: perna === 'volta' ? c.primeiroId : c.segundoId, resultado: null, copa: { fase, perna } }
    })
  })
}

function jogosDoPar(carreira: Carreira, fase: number, a: string, b: string): PartidaAgendada[] {
  return datasDaFase(carreira, fase)
    .flatMap((i) => carreira.calendario[i].partidas)
    .filter((p) => (p.casaId === a && p.foraId === b) || (p.casaId === b && p.foraId === a))
}

export const jogosDoConfronto = (carreira: Carreira, fase: number, c: ConfrontoCopa) => jogosDoPar(carreira, fase, c.primeiroId, c.segundoId)

export function vencedorDoConfronto(primeiroId: string, segundoId: string, jogos: readonly PartidaAgendada[]): string {
  let primeiro = 0
  let segundo = 0
  for (const { casaId, resultado } of jogos) {
    primeiro += casaId === primeiroId ? resultado!.golsCasa : resultado!.golsFora
    segundo += casaId === primeiroId ? resultado!.golsFora : resultado!.golsCasa
  }
  if (primeiro !== segundo) return primeiro > segundo ? primeiroId : segundoId
  const ultimo = jogos[jogos.length - 1]
  const { casa, fora } = ultimo.resultado!.penaltis!
  return (casa > fora ? ultimo.casaId : ultimo.foraId) === primeiroId ? primeiroId : segundoId
}

export function anteriorDaVolta(carreira: Carreira, partida: PartidaAgendada): { casa: number; fora: number } {
  const ida = jogosDoPar(carreira, partida.copa!.fase, partida.casaId, partida.foraId).find((p) => p.copa!.perna === 'ida')!
  return { casa: ida.resultado!.golsFora, fora: ida.resultado!.golsCasa }
}

export function iniciarCopa(carreira: Carreira): void {
  sortearFase(carreira, 0, carreira.copa.participantes)
}

export function encerrarDataCopa(carreira: Carreira, indice: number): void {
  const { fase, perna } = DATAS_COPA[carreira.calendario[indice].rodada - 1]
  if (perna === 'ida') return
  const confrontos = carreira.copa.fases[fase]
  for (const c of confrontos) {
    c.vencedorId = vencedorDoConfronto(c.primeiroId, c.segundoId, jogosDoConfronto(carreira, fase, c))
    pagarPremioCopa(carreira, c.vencedorId, fase)
  }
  if (fase === FASES.length - 1) carreira.copa.campeaoId = confrontos[0].vencedorId
  else sortearFase(carreira, fase + 1, confrontos.map((c) => c.vencedorId!))
}
