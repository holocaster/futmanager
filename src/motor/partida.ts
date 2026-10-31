import { proximo, inteiro } from './rng'
import { atribuirSetores, FORMACOES, forcaNoSetor, MULTIPLICADOR_POSTURA, POSICOES, CONDICAO_POR_MINUTO } from './tatica'
import type { Formacao, Jogador, Posicao, Postura, Rng } from './tipos'

export const FATOR_CASA = 1.15
export const CHANCE_BASE = 0.12
export const CONVERSAO_BASE = 0.102
export const ESCALA_FORCA = 36
export const CONVERSAO_MAXIMA = 0.9
export const CHANCE_MAXIMA = 0.5
export const PROB_AMARELO = 0.0222
export const PROB_VERMELHO = 0.00012
export const PROB_LESAO = 0.0013
export const REDUCAO_SEGUNDO_AMARELO = 0.12
export const INTERVALO_RECALCULO = 15
export const MAX_SUBSTITUICOES = 5
export const MAX_PARADAS = 3
export const MINUTO_INTERVALO = 45
export const LIMITE_CANSACO = 80
export const MINUTO_TROCA_CANSACO = 60
export const MINUTO_POSTURA_FINAL = 75
export const PROB_PENALTI = 0.76
export const COBRANCAS_INICIAIS = 5

const PESO_ATAQUE: Record<Posicao, number> = { G: 0, D: 0.15, M: 0.35, A: 0.5 }
const PESO_DEFESA: Record<Posicao, number> = { G: 0.3, D: 0.35, M: 0.25, A: 0.1 }
const PESO_AUTOR: Record<Posicao, number> = { G: 0.05, D: 1, M: 3, A: 6 }
const PESO_CARTAO: Record<Posicao, number> = { G: 0.2, D: 1.3, M: 1.2, A: 0.9 }
export const EXPOENTE_ATAQUE = 0.35
export const EXPOENTE_DEFESA = 0.75

export interface LadoPartida {
  titulares: Jogador[]
  setores: Posicao[]
  banco: Jogador[]
  jogaram: Jogador[]
  substituidos: string[]
  vagas: Posicao[]
  substituicoes: number
  paradas: number
  minutoParada: number
  formacao: Formacao
  postura: Postura
}

export interface ResultadoPartida {
  golsCasa: number
  golsFora: number
  autores: string[]
  amarelos: number
  vermelhos: number
  lesoes: number
}

export function criarLado(titulares: readonly Jogador[], formacao: Formacao, postura: Postura, banco: readonly Jogador[] = []): LadoPartida {
  return { titulares: [...titulares], setores: atribuirSetores(titulares, formacao), banco: [...banco], jogaram: [...titulares], substituidos: [], vagas: [], substituicoes: 0, paradas: 0, minutoParada: -1, formacao, postura }
}

export function forcasDoLado(lado: LadoPartida): { ataque: number; defesa: number } {
  const soma = { G: 0, D: 0, M: 0, A: 0 }
  const contagem = { G: 0, D: 0, M: 0, A: 0 }
  lado.titulares.forEach((j, i) => {
    soma[lado.setores[i]] += forcaNoSetor(j, lado.setores[i])
    contagem[lado.setores[i]]++
  })
  const referencia = FORMACOES['4-4-2']
  let ataque = 0
  let defesa = 0
  for (const p of POSICOES) {
    const n = contagem[p]
    if (n === 0) continue
    const media = soma[p] / n
    ataque += media * Math.pow(n / referencia[p], EXPOENTE_ATAQUE) * PESO_ATAQUE[p]
    defesa += media * (p === 'A' ? 1 : Math.pow(n / referencia[p], EXPOENTE_DEFESA)) * PESO_DEFESA[p]
  }
  const postura = MULTIPLICADOR_POSTURA[lado.postura]
  return { ataque: ataque * postura.ataque, defesa: defesa * postura.defesa }
}

function sortear(rng: Rng, titulares: readonly Jogador[], peso: (j: Jogador) => number): Jogador {
  let total = 0
  for (const j of titulares) total += peso(j)
  let alvo = proximo(rng) * total
  for (const j of titulares) {
    alvo -= peso(j)
    if (alvo < 0) return j
  }
  return titulares[titulares.length - 1]
}

export interface Cartao {
  jogadorId: string
  tipo: 'amarelo' | 'vermelho'
}

export interface Lesao {
  jogadorId: string
  datas: number
}

export interface PartidaAoVivo {
  casa: LadoPartida
  fora: LadoPartida
  razaoCasa: number
  razaoFora: number
  golsCasa: number
  golsFora: number
  autores: string[]
  cartoes: Cartao[]
  lesoes: Lesao[]
}

export interface Lance {
  lado: 'casa' | 'fora'
  tipo: 'gol' | 'chance' | 'amarelo' | 'vermelho' | 'lesao'
  jogador: Jogador
  segundoAmarelo?: boolean
}

export function recalcularRazoes(partida: PartidaAoVivo): void {
  const forcasCasa = forcasDoLado(partida.casa)
  const forcasFora = forcasDoLado(partida.fora)
  partida.razaoCasa = FATOR_CASA * Math.exp((forcasCasa.ataque - forcasFora.defesa) / ESCALA_FORCA)
  partida.razaoFora = Math.exp((forcasFora.ataque - forcasCasa.defesa) / ESCALA_FORCA)
}

export function criarPartida(casa: LadoPartida, fora: LadoPartida): PartidaAoVivo {
  const partida: PartidaAoVivo = { casa, fora, razaoCasa: 1, razaoFora: 1, golsCasa: 0, golsFora: 0, autores: [], cartoes: [], lesoes: [] }
  recalcularRazoes(partida)
  return partida
}

function lance(rng: Rng, razao: number, lado: LadoPartida): Pick<Lance, 'tipo' | 'jogador'> | null {
  if (!lado.titulares.length) return null
  if (proximo(rng) >= Math.min(CHANCE_MAXIMA, CHANCE_BASE * razao)) return null
  const jogador = sortear(rng, lado.titulares, (j) => PESO_AUTOR[j.posicao] * j.forca)
  return { tipo: proximo(rng) < Math.min(CONVERSAO_MAXIMA, CONVERSAO_BASE * razao) ? 'gol' : 'chance', jogador }
}

export function removerDoCampo(lado: LadoPartida, jogador: Jogador): Posicao {
  const i = lado.titulares.indexOf(jogador)
  lado.titulares.splice(i, 1)
  return lado.setores.splice(i, 1)[0]
}

function expulsar(partida: PartidaAoVivo, nome: 'casa' | 'fora', jogador: Jogador, lances: Lance[], segundoAmarelo?: boolean): void {
  partida.cartoes.push({ jogadorId: jogador.id, tipo: 'vermelho' })
  removerDoCampo(partida[nome], jogador)
  lances.push({ lado: nome, tipo: 'vermelho', jogador, segundoAmarelo })
}

function disciplina(rng: Rng, partida: PartidaAoVivo, nome: 'casa' | 'fora', lances: Lance[]): boolean {
  const lado = partida[nome]
  const sorteio = proximo(rng)
  if (sorteio >= PROB_VERMELHO + PROB_AMARELO + PROB_LESAO || !lado.titulares.length) return false
  if (sorteio < PROB_VERMELHO) {
    expulsar(partida, nome, sortear(rng, lado.titulares, () => 1), lances)
  } else if (sorteio < PROB_VERMELHO + PROB_AMARELO) {
    const amarelosDe = (j: Jogador) => partida.cartoes.filter((c) => c.jogadorId === j.id && c.tipo === 'amarelo').length
    const jogador = sortear(rng, lado.titulares, (j) => PESO_CARTAO[j.posicao] * (amarelosDe(j) ? REDUCAO_SEGUNDO_AMARELO : 1))
    partida.cartoes.push({ jogadorId: jogador.id, tipo: 'amarelo' })
    if (amarelosDe(jogador) === 2) expulsar(partida, nome, jogador, lances, true)
    else {
      lances.push({ lado: nome, tipo: 'amarelo', jogador })
      return false
    }
  } else {
    const jogador = sortear(rng, lado.titulares, () => 1)
    partida.lesoes.push({ jogadorId: jogador.id, datas: inteiro(rng, 1, 6) })
    lado.vagas.push(removerDoCampo(lado, jogador))
    lances.push({ lado: nome, tipo: 'lesao', jogador })
  }
  return true
}

export const LADOS = ['casa', 'fora'] as const
export type NomeLado = (typeof LADOS)[number]

export interface Troca {
  lado: NomeLado
  sai: Jogador | null
  entra: Jogador
}

export type ResultadoAcao = { erro: string } | { troca: Troca }

export function substituirNoLado(partida: PartidaAoVivo, nome: NomeLado, minuto: number, saiId: string | null, entraId: string): ResultadoAcao {
  const lado = partida[nome]
  const entra = lado.banco.find((j) => j.id === entraId)
  if (!entra) return { erro: lado.substituidos.includes(entraId) ? 'Jogador já substituído não volta ao jogo.' : 'O Jogador que entra precisa estar no banco.' }
  const sai = saiId === null ? null : lado.titulares.find((j) => j.id === saiId)
  if (saiId === null && !lado.vagas.length) return { erro: 'Não há vaga em campo: escolha quem sai.' }
  if (saiId !== null && !sai) {
    return { erro: partida.cartoes.some((c) => c.jogadorId === saiId && c.tipo === 'vermelho') ? 'Jogador expulso não pode ser substituído.' : 'O Jogador que sai precisa estar em campo.' }
  }
  if (lado.substituicoes >= MAX_SUBSTITUICOES) return { erro: `Limite de ${MAX_SUBSTITUICOES} Substituições atingido.` }
  const novaParada = minuto !== MINUTO_INTERVALO && minuto !== lado.minutoParada
  if (novaParada && lado.paradas >= MAX_PARADAS) return { erro: `Limite de ${MAX_PARADAS} paradas atingido.` }
  lado.banco.splice(lado.banco.indexOf(entra), 1)
  if (sai) {
    lado.titulares[lado.titulares.indexOf(sai)] = entra
    lado.substituidos.push(sai.id)
  } else {
    const vaga = lado.vagas.includes(entra.posicao) ? entra.posicao : lado.vagas[0]
    lado.vagas.splice(lado.vagas.indexOf(vaga), 1)
    lado.titulares.push(entra)
    lado.setores.push(vaga)
  }
  lado.jogaram.push(entra)
  lado.substituicoes++
  if (novaParada) {
    lado.paradas++
    lado.minutoParada = minuto
  }
  recalcularRazoes(partida)
  return { troca: { lado: nome, sai: sai ?? null, entra } }
}

export function mudarPosturaDoLado(partida: PartidaAoVivo, nome: NomeLado, postura: Postura): void {
  partida[nome].postura = postura
  recalcularRazoes(partida)
}

export function mudarFormacaoDoLado(partida: PartidaAoVivo, nome: NomeLado, formacao: Formacao): void {
  const lado = partida[nome]
  lado.titulares.sort((a, b) => POSICOES.indexOf(a.posicao) - POSICOES.indexOf(b.posicao))
  lado.setores = atribuirSetores(lado.titulares, formacao)
  const livres = POSICOES.flatMap((p) => Array<Posicao>(FORMACOES[formacao][p] - lado.setores.filter((s) => s === p).length).fill(p))
  lado.vagas = lado.vagas.map((vaga) => {
    const i = livres.indexOf(vaga)
    return i < 0 ? null : livres.splice(i, 1)[0]
  }).map((vaga) => vaga ?? livres.shift()!)
  lado.formacao = formacao
  recalcularRazoes(partida)
}

export function agirIA(partida: PartidaAoVivo, nome: NomeLado, minuto: number): Troca[] {
  const lado = partida[nome]
  const trocas: Troca[] = []
  const trocar = (saiId: string | null, entra: Jogador | undefined) => {
    if (!entra) return false
    const r = substituirNoLado(partida, nome, minuto, saiId, entra.id)
    if ('troca' in r) trocas.push(r.troca)
    return 'troca' in r
  }
  const melhor = (lista: Jogador[]) => lista.reduce<Jogador | undefined>((a, b) => (!a || b.forca > a.forca ? b : a), undefined)
  while (lado.vagas.length) {
    const vaga = lado.vagas[0]
    if (!trocar(null, melhor(lado.banco.filter((j) => j.posicao === vaga)) ?? melhor(lado.banco))) break
  }
  if (minuto >= MINUTO_TROCA_CANSACO && minuto % 10 === 0) {
    for (const j of [...lado.titulares].sort((a, b) => a.condicao - b.condicao)) {
      if (j.condicao >= LIMITE_CANSACO) break
      trocar(j.id, melhor(lado.banco.filter((r) => r.posicao === j.posicao && r.condicao > j.condicao)))
    }
  }
  if (minuto >= MINUTO_POSTURA_FINAL) {
    const saldo = nome === 'casa' ? partida.golsCasa - partida.golsFora : partida.golsFora - partida.golsCasa
    const desejada: Postura = saldo > 0 ? 'defensiva' : saldo < 0 ? 'ofensiva' : 'equilibrada'
    if (lado.postura !== desejada) mudarPosturaDoLado(partida, nome, desejada)
  }
  return trocas
}

export function avancarMinutoPartida(rng: Rng, partida: PartidaAoVivo, minuto: number): Lance[] {
  const lances: Lance[] = []
  let mudou = false
  for (const nome of LADOS) {
    const lado = partida[nome]
    const doLado = lance(rng, nome === 'casa' ? partida.razaoCasa : partida.razaoFora, lado)
    if (doLado) {
      lances.push({ lado: nome, ...doLado })
      if (doLado.tipo === 'gol') {
        if (nome === 'casa') partida.golsCasa++
        else partida.golsFora++
        partida.autores.push(doLado.jogador.id)
      }
    }
    const perda = CONDICAO_POR_MINUTO[lado.postura]
    for (const j of lado.titulares) j.condicao = Math.max(0, j.condicao - perda)
    if (disciplina(rng, partida, nome, lances)) mudou = true
  }
  if (mudou || minuto % INTERVALO_RECALCULO === 0) recalcularRazoes(partida)
  return lances
}

export function simularPartida(rng: Rng, casa: LadoPartida, fora: LadoPartida): ResultadoPartida {
  const copia = (l: LadoPartida) => criarLado(l.titulares.map((j) => ({ ...j })), l.formacao, l.postura)
  const partida = criarPartida(copia(casa), copia(fora))
  for (let minuto = 1; minuto <= 90; minuto++) avancarMinutoPartida(rng, partida, minuto)
  return {
    golsCasa: partida.golsCasa,
    golsFora: partida.golsFora,
    autores: partida.autores,
    amarelos: partida.cartoes.filter((c) => c.tipo === 'amarelo').length,
    vermelhos: partida.cartoes.filter((c) => c.tipo === 'vermelho').length,
    lesoes: partida.lesoes.length,
  }
}

export interface Cobranca {
  lado: NomeLado
  jogador: Jogador
  convertida: boolean
}

export function disputarPenaltis(rng: Rng, partida: PartidaAoVivo): { casa: number; fora: number; cobrancas: Cobranca[] } {
  const batedores = { casa: [...partida.casa.titulares].reverse(), fora: [...partida.fora.titulares].reverse() }
  if (!batedores.casa.length || !batedores.fora.length) {
    const casaVence = !batedores.fora.length && (batedores.casa.length > 0 || proximo(rng) < 0.5)
    return { casa: casaVence ? 1 : 0, fora: casaVence ? 0 : 1, cobrancas: [] }
  }
  const placar = { casa: 0, fora: 0 }
  const feitas = { casa: 0, fora: 0 }
  const cobrancas: Cobranca[] = []
  const decidido = () =>
    feitas.casa >= COBRANCAS_INICIAIS && feitas.fora >= COBRANCAS_INICIAIS
      ? feitas.casa === feitas.fora && placar.casa !== placar.fora
      : placar.casa > placar.fora + (COBRANCAS_INICIAIS - feitas.fora) || placar.fora > placar.casa + (COBRANCAS_INICIAIS - feitas.casa)
  while (!decidido()) {
    for (const lado of LADOS) {
      const jogador = batedores[lado][feitas[lado] % batedores[lado].length]
      const convertida = proximo(rng) < PROB_PENALTI
      feitas[lado]++
      if (convertida) placar[lado]++
      cobrancas.push({ lado, jogador, convertida })
      if (decidido()) break
    }
  }
  return { ...placar, cobrancas }
}
