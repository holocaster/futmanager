import { VERSAO_CARREIRA } from './motor/carreira'
import { CATEGORIAS } from './motor/financas'
import { FORMACOES, POSICOES, POSTURAS } from './motor/tatica'
import type { Carreira } from './motor/tipos'

const objeto = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === 'object' && !Array.isArray(v)
const numero = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)
const inteiro = (v: unknown): v is number => numero(v) && Number.isSafeInteger(v) && v >= 0
const texto = (v: unknown): v is string => typeof v === 'string'
const lista = (v: unknown, validar: (item: unknown) => boolean): boolean => Array.isArray(v) && v.every(validar)
const campos = (v: unknown, nomes: readonly string[], validar: (item: unknown) => boolean): boolean => objeto(v) && nomes.every((k) => validar(v[k]))
const umDe = (v: unknown, opcoes: readonly unknown[]): boolean => opcoes.includes(v)
const divisao = (v: unknown) => ['A', 'B', 'C', 'D'].some((d) => v === d)
const competicao = (v: unknown) => ['A', 'B', 'C', 'copa'].some((d) => v === d)

export function carreiraValida(v: unknown): v is Carreira {
  if (!objeto(v) || v.versao !== VERSAO_CARREIRA || !inteiro(v.ano) || !inteiro(v.proximoJogadorId)
    || !objeto(v.rng) || !inteiro(v.rng.estado) || v.rng.estado > 0xffffffff
    || !Array.isArray(v.clubes) || !v.clubes.length || !objeto(v.jogadores)
    || !Array.isArray(v.calendario) || !v.calendario.length || !inteiro(v.proximaData) || v.proximaData > v.calendario.length) return false

  const clubes = new Set(v.clubes.filter(objeto).map((c) => c.id))
  const clube = (id: unknown): boolean => texto(id) && clubes.has(id)
  const jogadores = v.jogadores
  const jogador = (id: unknown): boolean => texto(id) && Object.hasOwn(jogadores, id)
  const nullableClube = (id: unknown) => id === null || clube(id)
  const resultado = (r: unknown) => r === null || (objeto(r) && inteiro(r.golsCasa) && inteiro(r.golsFora)
    && (r.penaltis === undefined || (objeto(r.penaltis) && inteiro(r.penaltis.casa) && inteiro(r.penaltis.fora))))
  const origem = (o: unknown) => objeto(o) && clube(o.clubeId) && inteiro(o.gols)
  const artilheiro = (a: unknown) => a === null || (objeto(a) && texto(a.jogadorId) && texto(a.nome) && inteiro(a.gols) && lista(a.origens, origem))
  const resumoJogador = (j: unknown) => objeto(j) && texto(j.nome) && POSICOES.some((p) => p === j.posicao) && inteiro(j.idade) && numero(j.forca)

  return clubes.size === v.clubes.length && clube(v.clubeId)
    && v.clubes.every((c: unknown) => objeto(c) && texto(c.id) && texto(c.nome) && texto(c.nomeCurto) && texto(c.cidade) && texto(c.uf)
      && Array.isArray(c.cores) && c.cores.length === 2 && c.cores.every(texto)
      && inteiro(c.porte) && c.porte >= 1 && c.porte <= 5 && divisao(c.divisao)
      && numero(c.saldo) && campos(c.extrato, CATEGORIAS, numero))
    && Object.entries(jogadores).every(([id, j]) => objeto(j) && j.id === id && texto(j.nome) && clube(j.clubeId)
      && POSICOES.some((p) => p === j.posicao) && inteiro(j.idade) && numero(j.forca) && numero(j.potencial)
      && numero(j.salario) && inteiro(j.contratoAte) && numero(j.condicao) && numero(j.moral)
      && inteiro(j.lesao) && inteiro(j.suspensao) && inteiro(j.amarelos) && (j.aVenda === null || numero(j.aVenda))
      && campos(j.stats, ['partidas', 'golsDivisao', 'golsCopa'], inteiro))
    && objeto(v.escalacao) && texto(v.escalacao.formacao) && Object.hasOwn(FORMACOES, v.escalacao.formacao)
    && umDe(v.escalacao.postura, POSTURAS)
    && lista(v.escalacao.titulares, jogador) && lista(v.escalacao.reservas, jogador)
    && campos(v.desempate, [...clubes].filter(texto), numero)
    && v.calendario.every((d: unknown) => objeto(d) && ['divisao', 'copa'].some((t) => t === d.tipo) && inteiro(d.rodada)
      && lista(d.partidas, (p) => objeto(p) && divisao(p.divisao) && clube(p.casaId) && clube(p.foraId) && resultado(p.resultado)
        && (p.copa === undefined || (objeto(p.copa) && inteiro(p.copa.fase) && p.copa.fase < 6 && umDe(p.copa.perna, ['unica', 'ida', 'volta'])))))
    && objeto(v.copa) && lista(v.copa.participantes, clube) && nullableClube(v.copa.campeaoId)
    && lista(v.copa.fases, (fase) => lista(fase, (c) => objeto(c) && clube(c.primeiroId) && clube(c.segundoId) && nullableClube(c.vencedorId)))
    && lista(v.propostas, (p) => objeto(p) && clube(p.compradorId) && jogador(p.jogadorId) && numero(p.valor))
    && lista(v.transferencias, (t) => objeto(t) && inteiro(t.ano) && inteiro(t.rodada) && texto(t.jogadorId) && texto(t.nome)
      && clube(t.deId) && clube(t.paraId) && numero(t.valor) && typeof t.troca === 'boolean')
    && lista(v.artilharia, (a) => objeto(a) && texto(a.jogadorId) && texto(a.nome) && competicao(a.competicao)
      && clube(a.clubeId) && inteiro(a.gols) && inteiro(a.partidas))
    && lista(v.historico, (h) => objeto(h) && inteiro(h.ano) && numero(h.premiacaoDoTecnico)
      && campos(h.campeoes, ['A', 'B', 'C', 'copa'], nullableClube)
      && campos(h.artilheiros, ['A', 'B', 'C', 'copa'], artilheiro)
      && campos(h.tabelas, ['A', 'B', 'C'], (tabela) => lista(tabela, (l) => objeto(l) && clube(l.clubeId)
        && ['p', 'j', 'v', 'e', 'd', 'gp', 'gc'].every((k) => inteiro(l[k])) && numero(l.sg)))
      && lista(h.movimentos, (m) => objeto(m) && clube(m.clubeId) && divisao(m.de) && divisao(m.para))
      && campos(h.elencoDoTecnico, ['saidas', 'aposentados', 'base', 'repostos'], (grupo) => lista(grupo, resumoJogador)))
}
