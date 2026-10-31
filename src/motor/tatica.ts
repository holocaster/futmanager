import { elencoDe } from './elenco'
import type { Carreira, Escalacao, Formacao, Jogador, Posicao, Postura } from './tipos'

export const FORMACOES: Record<Formacao, Record<Posicao, number>> = {
  '4-4-2': { G: 1, D: 4, M: 4, A: 2 },
  '4-3-3': { G: 1, D: 4, M: 3, A: 3 },
  '4-5-1': { G: 1, D: 4, M: 5, A: 1 },
  '3-5-2': { G: 1, D: 3, M: 5, A: 2 },
  '3-4-3': { G: 1, D: 3, M: 4, A: 3 },
  '5-3-2': { G: 1, D: 5, M: 3, A: 2 },
  '5-4-1': { G: 1, D: 5, M: 4, A: 1 },
}

export const POSTURAS: Postura[] = ['defensiva', 'equilibrada', 'ofensiva']

export const MULTIPLICADOR_POSTURA: Record<Postura, { ataque: number; defesa: number }> = {
  defensiva: { ataque: 0.96, defesa: 1.04 },
  equilibrada: { ataque: 1, defesa: 1 },
  ofensiva: { ataque: 1.03, defesa: 0.975 },
}

export const PENALIDADE_FORA_DE_POSICAO = 12
export const MAX_RESERVAS = 7
export const FORMACAO_IA: Formacao = '4-4-2'
export const POSTURA_IA: Postura = 'equilibrada'

export const POSICOES: Posicao[] = ['G', 'D', 'M', 'A']

export function setoresDaFormacao(formacao: Formacao): Posicao[] {
  return POSICOES.flatMap((p) => Array<Posicao>(FORMACOES[formacao][p]).fill(p))
}

export const CONDICAO_POR_MINUTO: Record<Postura, number> = { defensiva: 0.14, equilibrada: 0.17, ofensiva: 0.23 }

export const fatorCondicao = (condicao: number) => 0.85 + (0.15 * condicao) / 100
export const fatorMoral = (moral: number) => 1 + (moral - 70) * 0.002

export function forcaEfetiva(jogador: Jogador): number {
  return jogador.forca * fatorCondicao(jogador.condicao) * fatorMoral(jogador.moral)
}

export function forcaNoSetor(jogador: Jogador, setor: Posicao): number {
  return forcaEfetiva(jogador) - (jogador.posicao === setor ? 0 : PENALIDADE_FORA_DE_POSICAO)
}

export const disponivel = (jogador: Jogador) => jogador.lesao === 0 && jogador.suspensao === 0

const distancia = (a: Posicao, b: Posicao) => Math.abs(POSICOES.indexOf(a) - POSICOES.indexOf(b))

export function atribuirSetores(titulares: readonly Jogador[], formacao: Formacao): Posicao[] {
  if (titulares.length === 11) return setoresDaFormacao(formacao)
  const vagas = { ...FORMACOES[formacao] }
  const setores = titulares.map((j): Posicao | null => {
    if (!vagas[j.posicao]) return null
    vagas[j.posicao]--
    return j.posicao
  })
  return setores.map((setor, i) => {
    if (setor) return setor
    const livres = POSICOES.filter((p) => vagas[p] > 0)
    const melhor = livres.reduce((a, b) => distancia(titulares[i].posicao, b) < distancia(titulares[i].posicao, a) ? b : a)
    vagas[melhor]--
    return melhor
  })
}

export function escalarAutomatico(elenco: readonly Jogador[], formacao: Formacao): Pick<Escalacao, 'titulares' | 'reservas'> {
  const disponiveis = elenco.filter(disponivel).sort((a, b) => forcaEfetiva(b) - forcaEfetiva(a) || a.id.localeCompare(b.id))
  const porSetor: Record<Posicao, Jogador[]> = { G: [], D: [], M: [], A: [] }
  const usados = new Set<Jogador>()
  for (const p of POSICOES) {
    porSetor[p] = disponiveis.filter((j) => j.posicao === p).slice(0, FORMACOES[formacao][p])
    porSetor[p].forEach((j) => usados.add(j))
  }
  for (const p of POSICOES) {
    while (porSetor[p].length < FORMACOES[formacao][p]) {
      const restantes = disponiveis.filter((j) => !usados.has(j))
      const deLinha = restantes.filter((j) => j.posicao !== 'G')
      const candidatos = p !== 'G' && deLinha.length ? deLinha : restantes
      if (!candidatos.length) break
      const melhor = candidatos.reduce((a, b) => (distancia(b.posicao, p) < distancia(a.posicao, p) ? b : a))
      porSetor[p].push(melhor)
      usados.add(melhor)
    }
  }
  const titulares = usados.size < 11 ? [...usados] : POSICOES.flatMap((p) => porSetor[p])
  const resto = disponiveis.filter((j) => !usados.has(j))
  const goleiro = resto.find((j) => j.posicao === 'G')
  const reservas = [...(goleiro ? [goleiro] : []), ...resto.filter((j) => j !== goleiro)].slice(0, MAX_RESERVAS)
  return { titulares: titulares.map((j) => j.id), reservas: reservas.map((j) => j.id) }
}

export function validarEscalacao(carreira: Carreira, escalacao: Escalacao): string[] {
  const erros: string[] = []
  const { titulares, reservas } = escalacao
  const elegiveis = elencoDe(carreira, carreira.clubeId).filter(disponivel)
  const esperados = Math.min(11, elegiveis.length)
  if (titulares.length !== esperados) erros.push(`A Escalação precisa de ${esperados} titulares (há ${titulares.length}).`)
  if (reservas.length > MAX_RESERVAS) erros.push(`O banco pode ter no máximo ${MAX_RESERVAS} reservas (há ${reservas.length}).`)
  const todos = [...titulares, ...reservas]
  if (new Set(todos).size !== todos.length) erros.push('Há Jogador repetido na Escalação.')
  const escalados = todos.map((id) => carreira.jogadores[id])
  if (escalados.some((j) => !j || j.clubeId !== carreira.clubeId)) erros.push('Há Jogador na Escalação que não é do Elenco.')
  for (const j of escalados) {
    if (!j) continue
    if (j.lesao > 0) erros.push(`${j.nome} está lesionado.`)
    if (j.suspensao > 0) erros.push(`${j.nome} está suspenso.`)
  }
  const jogadores = titulares.map((id) => carreira.jogadores[id])
  const setores = titulares.length <= 11 && jogadores.every(Boolean) ? atribuirSetores(jogadores, escalacao.formacao) : setoresDaFormacao(escalacao.formacao)
  const noGol = jogadores.find((_j, i) => setores[i] === 'G')
  const goleiroNaLinha = jogadores.some((j, i) => j?.posicao === 'G' && setores[i] !== 'G')
  const sobraJogadorDeLinha = elegiveis.some((j) => j.posicao !== 'G' && !titulares.includes(j.id))
  if (elegiveis.some((j) => j.posicao === 'G') && noGol?.posicao !== 'G') erros.push('Os titulares precisam de um goleiro no gol.')
  if (goleiroNaLinha && sobraJogadorDeLinha) erros.push('Há goleiro na linha com Jogador de linha disponível.')
  return erros
}

export function aplicarEscalacaoAutomatica(carreira: Carreira): void {
  Object.assign(carreira.escalacao, escalarAutomatico(elencoDe(carreira, carreira.clubeId), carreira.escalacao.formacao))
}

export function mudarFormacao(carreira: Carreira, formacao: Formacao): void {
  const e = carreira.escalacao
  const ordem = (id: string) => POSICOES.indexOf(carreira.jogadores[id].posicao)
  e.titulares = [...e.titulares].sort((a, b) => ordem(a) - ordem(b))
  e.formacao = formacao
}

export function mudarPostura(carreira: Carreira, postura: Postura): void {
  carreira.escalacao.postura = postura
}

export function trocarJogadores(carreira: Carreira, idA: string, idB: string): void {
  const { titulares, reservas } = carreira.escalacao
  const lugar = (id: string): [string[], number] | null => {
    for (const lista of [titulares, reservas]) {
      const i = lista.indexOf(id)
      if (i >= 0) return [lista, i]
    }
    return null
  }
  const a = lugar(idA)
  const b = lugar(idB)
  if (a) a[0][a[1]] = idB
  if (b) b[0][b[1]] = idA
}
