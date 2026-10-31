export type Divisao = 'A' | 'B' | 'C' | 'D'
export type DivisaoJogavel = Exclude<Divisao, 'D'>
export type Posicao = 'G' | 'D' | 'M' | 'A'
export type Porte = 1 | 2 | 3 | 4 | 5
export type Formacao = '4-4-2' | '4-3-3' | '4-5-1' | '3-5-2' | '3-4-3' | '5-3-2' | '5-4-1'
export type Postura = 'defensiva' | 'equilibrada' | 'ofensiva'

export interface Escalacao {
  formacao: Formacao
  postura: Postura
  titulares: string[]
  reservas: string[]
}

export interface ClubeBase {
  id: string
  nome: string
  nomeCurto: string
  cidade: string
  uf: string
  cores: [string, string]
  porte: Porte
  divisao: Divisao
}

export type CategoriaFinanceira = 'salarios' | 'patrocinio' | 'bilheteria' | 'premiacao' | 'transferencias'

export type Extrato = Record<CategoriaFinanceira, number>

export interface Clube extends ClubeBase {
  saldo: number
  extrato: Extrato
}

export interface Jogador {
  id: string
  nome: string
  posicao: Posicao
  idade: number
  forca: number
  potencial: number
  salario: number
  contratoAte: number
  condicao: number
  moral: number
  lesao: number
  suspensao: number
  amarelos: number
  stats: { partidas: number; golsDivisao: number; golsCopa: number }
  clubeId: string
  aVenda: number | null
}

export interface Rng {
  estado: number
}

export interface Resultado {
  golsCasa: number
  golsFora: number
  penaltis?: { casa: number; fora: number }
}

export type PernaCopa = 'unica' | 'ida' | 'volta'

export interface PartidaAgendada {
  divisao: Divisao
  casaId: string
  foraId: string
  resultado: Resultado | null
  copa?: { fase: number; perna: PernaCopa }
}

export interface DataCalendario {
  tipo: 'divisao' | 'copa'
  rodada: number
  partidas: PartidaAgendada[]
}

export interface ConfrontoCopa {
  primeiroId: string
  segundoId: string
  vencedorId: string | null
}

export interface Copa {
  participantes: string[]
  fases: ConfrontoCopa[][]
  campeaoId: string | null
}

export interface LinhaClassificacao {
  clubeId: string
  p: number
  j: number
  v: number
  e: number
  d: number
  gp: number
  gc: number
  sg: number
}

export type CompeticaoHistorico = DivisaoJogavel | 'copa'

export interface OrigemDosGols {
  clubeId: string
  gols: number
}

export interface ArtilheiroHistorico {
  jogadorId: string
  nome: string
  gols: number
  origens: OrigemDosGols[]
}

export interface LinhaArtilharia extends ArtilheiroHistorico {
  partidas: number
}

export interface AgregadoArtilharia {
  jogadorId: string
  nome: string
  competicao: CompeticaoHistorico
  clubeId: string
  gols: number
  partidas: number
}

export interface MovimentoDivisao {
  clubeId: string
  de: Divisao
  para: Divisao
}

export interface JogadorNoResumo {
  nome: string
  posicao: Posicao
  idade: number
  forca: number
}

export interface MudancasDoElenco {
  saidas: JogadorNoResumo[]
  aposentados: JogadorNoResumo[]
  base: JogadorNoResumo[]
  repostos: JogadorNoResumo[]
}

export interface TemporadaPassada {
  ano: number
  campeoes: Record<CompeticaoHistorico, string | null>
  artilheiros: Record<CompeticaoHistorico, ArtilheiroHistorico | null>
  tabelas: Record<DivisaoJogavel, LinhaClassificacao[]>
  movimentos: MovimentoDivisao[]
  premiacaoDoTecnico: number
  elencoDoTecnico: MudancasDoElenco
}

export interface PropostaDaIA {
  compradorId: string
  jogadorId: string
  valor: number
}

export interface Transferencia {
  ano: number
  rodada: number
  jogadorId: string
  nome: string
  deId: string
  paraId: string
  valor: number
  troca: boolean
}

export interface Carreira {
  versao: number
  ano: number
  clubeId: string
  rng: Rng
  escalacao: Escalacao
  proximoJogadorId: number
  clubes: Clube[]
  jogadores: Record<string, Jogador>
  calendario: DataCalendario[]
  proximaData: number
  desempate: Record<string, number>
  copa: Copa
  historico: TemporadaPassada[]
  propostas: PropostaDaIA[]
  transferencias: Transferencia[]
  artilharia: AgregadoArtilharia[]
}
