import { montarCalendario } from './calendario'
import { artilheiros, artilheirosCopa, classificacao } from './classificacao'
import { encerrarContratos } from './contratos'
import { criarCopa, iniciarCopa } from './copa'
import { completarElencos, envelhecerEAposentar } from './evolucao'
import { clubePorId, extratoZerado, lancar, premioDaPosicao } from './financas'
import { embaralhar, proximo } from './rng'
import { aplicarEscalacaoAutomatica, validarEscalacao } from './tatica'
import type { Carreira, CompeticaoHistorico, Jogador, Divisao, DivisaoJogavel, LinhaClassificacao, MovimentoDivisao, TemporadaPassada } from './tipos'

export const VAGAS_DE_ACESSO = 4

const DIVISOES: DivisaoJogavel[] = ['A', 'B', 'C']
const ACIMA: Record<'B' | 'C', Divisao> = { B: 'A', C: 'B' }
const ABAIXO: Record<DivisaoJogavel, Divisao> = { A: 'B', B: 'C', C: 'D' }

const ids = (linhas: LinhaClassificacao[]) => linhas.map((l) => l.clubeId)

function registrarHistorico(carreira: Carreira, tabelas: Record<DivisaoJogavel, LinhaClassificacao[]>, movimentos: MovimentoDivisao[]): TemporadaPassada {
  const campeoes = { A: tabelas.A[0].clubeId, B: tabelas.B[0].clubeId, C: tabelas.C[0].clubeId, copa: carreira.copa.campeaoId } as Record<CompeticaoHistorico, string | null>
  const artilheiro = (d: CompeticaoHistorico) => {
    const j = d === 'copa' ? artilheirosCopa(carreira, 1)[0] : artilheiros(carreira, d, 1)[0]
    return j ? { jogadorId: j.jogadorId, nome: j.nome, gols: j.gols, origens: j.origens } : null
  }
  const temporada: TemporadaPassada = {
    ano: carreira.ano,
    campeoes,
    artilheiros: { A: artilheiro('A'), B: artilheiro('B'), C: artilheiro('C'), copa: artilheiro('copa') },
    tabelas,
    movimentos,
    premiacaoDoTecnico: clubePorId(carreira, carreira.clubeId).extrato.premiacao,
    elencoDoTecnico: { saidas: [], aposentados: [], base: [], repostos: [] },
  }
  carreira.historico.push(temporada)
  return temporada
}

function definirMovimentos(carreira: Carreira, tabelas: Record<DivisaoJogavel, LinhaClassificacao[]>): MovimentoDivisao[] {
  const movimentos: MovimentoDivisao[] = []
  const mover = (clubeIds: string[], de: Divisao, para: Divisao) => clubeIds.forEach((clubeId) => movimentos.push({ clubeId, de, para }))
  const pool = carreira.clubes.filter((c) => c.divisao === 'D')
  const doTecnico = pool.filter((c) => c.id === carreira.clubeId)
  const sorteados = embaralhar(carreira.rng, pool.filter((c) => c.id !== carreira.clubeId)).slice(0, VAGAS_DE_ACESSO - doTecnico.length)
  for (const d of DIVISOES) {
    if (d !== 'A') mover(ids(tabelas[d].slice(0, VAGAS_DE_ACESSO)), d, ACIMA[d])
    mover(ids(tabelas[d].slice(-VAGAS_DE_ACESSO)), d, ABAIXO[d])
  }
  mover([...doTecnico, ...sorteados].map((c) => c.id), 'D', 'C')
  return movimentos
}

export function fimDeTemporada(carreira: Carreira): TemporadaPassada {
  if (carreira.proximaData < carreira.calendario.length) throw new Error('A Temporada ainda nao terminou')

  const tabelas = { A: classificacao(carreira, 'A'), B: classificacao(carreira, 'B'), C: classificacao(carreira, 'C') }
  for (const d of DIVISOES) tabelas[d].forEach((l, i) => lancar(clubePorId(carreira, l.clubeId), 'premiacao', premioDaPosicao(d, i + 1)))

  const movimentos = definirMovimentos(carreira, tabelas)
  const temporada = registrarHistorico(carreira, tabelas, movimentos)
  for (const m of movimentos) clubePorId(carreira, m.clubeId).divisao = m.para

  const foto = (j: Jogador) => ({ nome: j.nome, posicao: j.posicao, idade: j.idade, forca: j.forca })
  const mudancas = temporada.elencoDoTecnico
  mudancas.saidas = encerrarContratos(carreira).map(foto)
  mudancas.aposentados = envelhecerEAposentar(carreira).map(foto)
  const { base, repostos } = completarElencos(carreira, carreira.ano + 1)
  mudancas.base = base.map(foto)
  mudancas.repostos = repostos.map(foto)

  for (const j of Object.values(carreira.jogadores)) {
    j.stats = { partidas: 0, golsDivisao: 0, golsCopa: 0 }
    j.amarelos = 0
    j.suspensao = 0
  }
  for (const clube of carreira.clubes) clube.extrato = extratoZerado()
  carreira.artilharia = []

  carreira.ano++
  carreira.calendario = montarCalendario(carreira.rng, carreira.clubes)
  carreira.proximaData = 0
  carreira.desempate = Object.fromEntries(carreira.clubes.map((c) => [c.id, proximo(carreira.rng)]))
  carreira.copa = criarCopa(carreira.rng, carreira.clubes, carreira.clubeId)
  iniciarCopa(carreira)
  if (validarEscalacao(carreira, carreira.escalacao).length) aplicarEscalacaoAutomatica(carreira)
  return temporada
}
