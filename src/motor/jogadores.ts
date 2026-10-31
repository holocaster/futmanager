import { aproxNormal, escolher, inteiro, proximo } from './rng'
import type { Jogador, Porte, Posicao, Rng } from './tipos'

export const FORCA_MEDIA_POR_PORTE: Record<Porte, number> = { 5: 75, 4: 70, 3: 64, 2: 58, 1: 52 }
export const DISPERSAO_FORCA = 14
export const FORCA_ABAIXO_DA_MEDIA_NA_BASE = 10
export const DISPERSAO_BASE = 10
export const COMPOSICAO_ELENCO: readonly Posicao[] = [
  ...Array<Posicao>(3).fill('G'),
  ...Array<Posicao>(8).fill('D'),
  ...Array<Posicao>(8).fill('M'),
  ...Array<Posicao>(6).fill('A'),
]

const PRENOMES = [
  'Lucas', 'Gabriel', 'Mateus', 'Pedro', 'João', 'Rafael', 'Gustavo', 'Felipe', 'Bruno', 'Thiago',
  'Diego', 'Rodrigo', 'Leandro', 'Vinícius', 'Eduardo', 'Marcelo', 'Fábio', 'Renato', 'Caio', 'André',
  'Henrique', 'Matheus', 'Daniel', 'Leonardo', 'Ricardo', 'Fernando', 'Guilherme', 'Alex', 'Wellington', 'Wesley',
  'Jean', 'Igor', 'Murilo', 'Otávio', 'Samuel', 'Davi', 'Renan', 'Danilo', 'Adriano', 'Carlos',
  'Douglas', 'Everton', 'Jonas', 'Cleiton', 'Éder', 'Anderson', 'Luan', 'Yuri', 'Breno', 'Ítalo',
]

const SOBRENOMES = [
  'Silva', 'Santos', 'Oliveira', 'Souza', 'Pereira', 'Costa', 'Rodrigues', 'Almeida', 'Nascimento', 'Lima',
  'Araújo', 'Fernandes', 'Carvalho', 'Gomes', 'Martins', 'Rocha', 'Ribeiro', 'Alves', 'Monteiro', 'Mendes',
  'Barros', 'Freitas', 'Barbosa', 'Pinto', 'Moreira', 'Cavalcanti', 'Dias', 'Castro', 'Campos', 'Cardoso',
  'Teixeira', 'Correia', 'Cunha', 'Nunes', 'Ramos', 'Moura', 'Vieira', 'Machado', 'Lopes', 'Batista',
]

const APELIDOS = [
  'Juninho', 'Betinho', 'Paulinho', 'Zeca', 'Tavinho', 'Neto', 'Bochecha', 'Gigante', 'Cacá', 'Dudu',
  'Léo', 'Kaká', 'Naldo', 'Ceará', 'Baiano', 'Mineiro', 'Gaúcho', 'Carioca', 'Pará', 'Nenê',
]

const FATOR_IDADE: [maxIdade: number, fator: number][] = [
  [21, 1.3],
  [27, 1.0],
  [30, 0.8],
  [33, 0.5],
  [Infinity, 0.3],
]

export function valorDeMercado(forca: number, idade: number): number {
  const fator = FATOR_IDADE.find(([maxIdade]) => idade <= maxIdade)![1]
  return Math.round(50_000 * 1.15 ** (forca - 40) * fator)
}

export function salarioReferencia(valor: number): number {
  return Math.max(5_000, Math.round(valor * 0.01))
}

function gerarNome(rng: Rng): string {
  if (proximo(rng) < 0.15) return escolher(rng, APELIDOS)
  return `${escolher(rng, PRENOMES)} ${escolher(rng, SOBRENOMES)}`
}

export function salarioPedido(forca: number, idade: number, moral: number): number {
  return Math.round(salarioReferencia(valorDeMercado(forca, idade)) * (1 + (70 - moral) * 0.005))
}

function montarJogador(id: string, clubeId: string, nome: string, posicao: Posicao, idade: number, forca: number, potencial: number, contratoAte: number): Jogador {
  return {
    id,
    nome,
    posicao,
    idade,
    forca,
    potencial,
    salario: salarioReferencia(valorDeMercado(forca, idade)),
    contratoAte,
    condicao: 100,
    moral: 70,
    lesao: 0,
    suspensao: 0,
    amarelos: 0,
    stats: { partidas: 0, golsDivisao: 0, golsCopa: 0 },
    clubeId,
    aVenda: null,
  }
}

export function gerarJogador(rng: Rng, id: string, clubeId: string, posicao: Posicao, forcaMedia: number, ano: number): Jogador {
  const nome = gerarNome(rng)
  const idade = inteiro(rng, 17, 35)
  const forca = Math.min(95, Math.max(25, Math.round(forcaMedia + aproxNormal(rng) * DISPERSAO_FORCA)))
  const potencial = idade < 24 ? Math.min(99, forca + inteiro(rng, 0, (24 - idade) * 2)) : forca
  const duracao = inteiro(rng, 1, 4)
  return montarJogador(id, clubeId, nome, posicao, idade, forca, potencial, ano + duracao - 1)
}

export function gerarJogadorDaBase(rng: Rng, id: string, clubeId: string, posicao: Posicao, forcaMedia: number, ano: number): Jogador {
  const nome = gerarNome(rng)
  const idade = inteiro(rng, 17, 18)
  const forca = Math.min(95, Math.max(25, Math.round(forcaMedia - FORCA_ABAIXO_DA_MEDIA_NA_BASE + aproxNormal(rng) * DISPERSAO_BASE)))
  const potencial = Math.min(99, forca + inteiro(rng, 2, 22))
  const duracao = inteiro(rng, 1, 4)
  return montarJogador(id, clubeId, nome, posicao, idade, forca, potencial, ano + duracao - 1)
}
