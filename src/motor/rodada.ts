import { anteriorDaVolta, encerrarDataCopa } from './copa'
import { elencoDe } from './elenco'
import { pagarDataDeDivisao, receberBilheteria } from './financas'
import { transferenciasDaIA } from './mercadoIA'
import { atualizarPropostas } from './propostas'
import {
  agirIA,
  avancarMinutoPartida,
  criarLado,
  criarPartida,
  disputarPenaltis,
  LADOS,
  MINUTO_INTERVALO,
  mudarFormacaoDoLado,
  mudarPosturaDoLado,
  substituirNoLado,
  type Lance,
  type LadoPartida,
  type NomeLado,
  type PartidaAoVivo,
  type Troca,
} from './partida'
import { escalarAutomatico, FORMACAO_IA, POSTURA_IA, validarEscalacao } from './tatica'
import type { Carreira, CompeticaoHistorico, Formacao, Jogador, Postura } from './tipos'

export const MINUTO_FINAL = 90
export const RECUPERACAO_CONDICAO = 15
export const MORAL_VITORIA = 3
export const MORAL_DERROTA = -3
export const MORAL_RESERVA = -1

export interface EventoPartida {
  partida: number
  minuto: number
  tipo: 'gol' | 'chance' | 'amarelo' | 'vermelho' | 'lesao' | 'substituicao' | 'intervalo' | 'fim' | 'penalti'
  clubeId?: string
  texto: string
  pausa: boolean
}

export interface PartidaDaRodada extends PartidaAoVivo {
  casaId: string
  foraId: string
  eventos: EventoPartida[]
  precisaVencedor: boolean
  anteriorCasa: number
  anteriorFora: number
  penaltis: { casa: number; fora: number } | null
}

export interface Rodada {
  data: number
  minuto: number
  partidas: PartidaDaRodada[]
}

function ladoDoClube(carreira: Carreira, clubeId: string): LadoPartida {
  const jogadores = (ids: string[]) => ids.map((id) => carreira.jogadores[id])
  if (clubeId === carreira.clubeId) {
    const { formacao, postura, titulares, reservas } = carreira.escalacao
    return criarLado(jogadores(titulares), formacao, postura, jogadores(reservas))
  }
  const { titulares, reservas } = escalarAutomatico(elencoDe(carreira, clubeId), FORMACAO_IA)
  return criarLado(jogadores(titulares), FORMACAO_IA, POSTURA_IA, jogadores(reservas))
}

export function partidaDoTecnico(carreira: Carreira, rodada: Rodada): PartidaDaRodada | undefined {
  return rodada.partidas.find((p) => p.casaId === carreira.clubeId || p.foraId === carreira.clubeId)
}

function ladoDoTecnico(carreira: Carreira, rodada: Rodada): { partida: PartidaDaRodada; indice: number; nome: NomeLado } {
  const partida = partidaDoTecnico(carreira, rodada)
  if (!partida) throw new Error('O Clube do Tecnico nao joga nesta data')
  return { partida, indice: rodada.partidas.indexOf(partida), nome: partida.casaId === carreira.clubeId ? 'casa' : 'fora' }
}

export function substituir(carreira: Carreira, rodada: Rodada, saiId: string | null, entraId: string): string | null {
  const { partida, indice, nome } = ladoDoTecnico(carreira, rodada)
  const r = substituirNoLado(partida, nome, rodada.minuto, saiId, entraId)
  if ('erro' in r) return r.erro
  const evento = narrarTroca(carreira, partida, indice, rodada.minuto, r.troca)
  partida.eventos.push(evento)
  return null
}

export function mudarFormacaoNaPartida(carreira: Carreira, rodada: Rodada, formacao: Formacao): void {
  const { partida, nome } = ladoDoTecnico(carreira, rodada)
  mudarFormacaoDoLado(partida, nome, formacao)
}

export function mudarPosturaNaPartida(carreira: Carreira, rodada: Rodada, postura: Postura): void {
  const { partida, nome } = ladoDoTecnico(carreira, rodada)
  mudarPosturaDoLado(partida, nome, postura)
}

export function tecnicoJogaNaProximaData(carreira: Carreira): boolean {
  const data = carreira.calendario[carreira.proximaData]
  return !!data && data.partidas.some((p) => p.casaId === carreira.clubeId || p.foraId === carreira.clubeId)
}

export function iniciarRodada(carreira: Carreira): Rodada {
  const data = carreira.calendario[carreira.proximaData]
  if (!data) throw new Error('Temporada encerrada')
  if (tecnicoJogaNaProximaData(carreira)) {
    const erros = validarEscalacao(carreira, carreira.escalacao)
    if (erros.length) throw new Error(erros.join(' '))
  }
  return {
    data: carreira.proximaData,
    minuto: 0,
    partidas: data.partidas.map((p) => {
      const anterior = p.copa?.perna === 'volta' ? anteriorDaVolta(carreira, p) : { casa: 0, fora: 0 }
      return {
        ...criarPartida(ladoDoClube(carreira, p.casaId), ladoDoClube(carreira, p.foraId)),
        casaId: p.casaId,
        foraId: p.foraId,
        eventos: [],
        precisaVencedor: !!p.copa && p.copa.perna !== 'ida',
        anteriorCasa: anterior.casa,
        anteriorFora: anterior.fora,
        penaltis: null,
      }
    }),
  }
}

const FRASES_CHANCE = ['chuta e não consegue marcar', 'finaliza e perde uma boa chance', 'tem a chance e desperdiça']

function narrar(carreira: Carreira, partida: PartidaDaRodada, indice: number, minuto: number, l: Lance): EventoPartida {
  const clubeId = l.lado === 'casa' ? partida.casaId : partida.foraId
  const clube = carreira.clubes.find((c) => c.id === clubeId)!
  const quem = `${l.jogador.nome} (${clube.nomeCurto})`
  const textos: Record<Lance['tipo'], string> = {
    gol: `Gol! ${l.jogador.nome} marca para o ${clube.nomeCurto} (${partida.golsCasa} x ${partida.golsFora}).`,
    chance: `${quem} ${FRASES_CHANCE[minuto % FRASES_CHANCE.length]}.`,
    amarelo: `Cartão amarelo para ${quem}.`,
    vermelho: l.segundoAmarelo ? `${quem} recebe o segundo amarelo e é expulso.` : `Cartão vermelho! ${quem} é expulso.`,
    lesao: `${quem} se lesiona e deixa o jogo.`,
  }
  const pausa = clubeId === carreira.clubeId && (l.tipo === 'vermelho' || l.tipo === 'lesao')
  return { partida: indice, minuto, tipo: l.tipo, clubeId, texto: textos[l.tipo], pausa }
}

function narrarTroca(carreira: Carreira, partida: PartidaDaRodada, indice: number, minuto: number, t: Troca): EventoPartida {
  const clubeId = t.lado === 'casa' ? partida.casaId : partida.foraId
  const clube = carreira.clubes.find((c) => c.id === clubeId)!
  const quem = t.sai ? `sai ${t.sai.nome}, entra ${t.entra.nome}` : `entra ${t.entra.nome} no lugar do lesionado`
  return { partida: indice, minuto, tipo: 'substituicao', clubeId, texto: `Substituição no ${clube.nomeCurto}: ${quem}.`, pausa: false }
}

function placar(carreira: Carreira, partida: PartidaDaRodada): string {
  const nome = (id: string) => carreira.clubes.find((c) => c.id === id)!.nomeCurto
  return `${nome(partida.casaId)} ${partida.golsCasa} x ${partida.golsFora} ${nome(partida.foraId)}`
}

export function avancarMinuto(carreira: Carreira, rodada: Rodada): EventoPartida[] {
  if (rodada.minuto >= MINUTO_FINAL) throw new Error('Rodada ja terminou')
  rodada.minuto++
  const novos: EventoPartida[] = []
  rodada.partidas.forEach((partida, indice) => {
    for (const l of avancarMinutoPartida(carreira.rng, partida, rodada.minuto)) novos.push(narrar(carreira, partida, indice, rodada.minuto, l))
    for (const nome of LADOS) {
      const clubeId = nome === 'casa' ? partida.casaId : partida.foraId
      if (clubeId === carreira.clubeId) continue
      for (const t of agirIA(partida, nome, rodada.minuto)) novos.push(narrarTroca(carreira, partida, indice, rodada.minuto, t))
    }
    if (rodada.minuto === MINUTO_INTERVALO) novos.push({ partida: indice, minuto: rodada.minuto, tipo: 'intervalo', texto: `Intervalo: ${placar(carreira, partida)}.`, pausa: true })
    if (rodada.minuto === MINUTO_FINAL) {
      novos.push({ partida: indice, minuto: rodada.minuto, tipo: 'fim', texto: `Fim de jogo: ${placar(carreira, partida)}.`, pausa: false })
      novos.push(...decidirNosPenaltis(carreira, partida, indice))
    }
  })
  for (const e of novos) rodada.partidas[e.partida].eventos.push(e)
  return novos
}

function decidirNosPenaltis(carreira: Carreira, partida: PartidaDaRodada, indice: number): EventoPartida[] {
  if (!partida.precisaVencedor || partida.golsCasa + partida.anteriorCasa !== partida.golsFora + partida.anteriorFora) return []
  const nome = (id: string) => carreira.clubes.find((c) => c.id === id)!.nomeCurto
  const { casa, fora, cobrancas } = disputarPenaltis(carreira.rng, partida)
  partida.penaltis = { casa, fora }
  const evento = (texto: string, clubeId?: string): EventoPartida => ({ partida: indice, minuto: MINUTO_FINAL, tipo: 'penalti', clubeId, texto, pausa: false })
  if (!cobrancas.length) return [evento(`Sem cobradores disponíveis${partida.casa.titulares.length || partida.fora.titulares.length ? '' : ' nos dois Clubes (sorteio)'}: ${nome(casa > fora ? partida.casaId : partida.foraId)} vence o desempate.`)]
  return [
    evento('Empate no agregado: decisão nos pênaltis.'),
    ...cobrancas.map((c) => {
      const clubeId = c.lado === 'casa' ? partida.casaId : partida.foraId
      return evento(`Pênalti: ${c.jogador.nome} (${nome(clubeId)}) ${c.convertida ? 'converte' : 'desperdiça'}.`, clubeId)
    }),
    evento(`Pênaltis: ${nome(partida.casaId)} ${casa} x ${fora} ${nome(partida.foraId)}.`),
  ]
}

function aplicarDisciplina(carreira: Carreira, partida: PartidaDaRodada): void {
  const expulsos = new Set(partida.cartoes.filter((c) => c.tipo === 'vermelho').map((c) => c.jogadorId))
  for (const id of expulsos) carreira.jogadores[id].suspensao++
  for (const c of partida.cartoes) {
    if (c.tipo !== 'amarelo' || expulsos.has(c.jogadorId)) continue
    const j = carreira.jogadores[c.jogadorId]
    if (++j.amarelos >= 3) {
      j.amarelos = 0
      j.suspensao++
    }
  }
  for (const l of partida.lesoes) carreira.jogadores[l.jogadorId].lesao = l.datas
}

function aplicarMoral(partida: PartidaDaRodada): void {
  const ajustar = (j: Jogador, delta: number) => (j.moral = Math.min(100, Math.max(0, j.moral + delta)))
  const lados = [
    { lado: partida.casa, saldo: partida.golsCasa - partida.golsFora },
    { lado: partida.fora, saldo: partida.golsFora - partida.golsCasa },
  ]
  for (const { lado, saldo } of lados) {
    const delta = Math.sign(saldo) * MORAL_VITORIA
    for (const j of lado.jogaram) ajustar(j, delta)
    for (const j of lado.banco.filter((r) => !lado.jogaram.includes(r))) ajustar(j, MORAL_RESERVA)
  }
}

export function finalizarRodada(carreira: Carreira, rodada: Rodada): void {
  if (rodada.minuto < MINUTO_FINAL) throw new Error('Rodada ainda nao terminou')
  if (rodada.data !== carreira.proximaData) throw new Error('Rodada ja finalizada')
  const data = carreira.calendario[rodada.data]
  const agregados = new Map(carreira.artilharia.map((a) => [`${a.competicao}:${a.clubeId}:${a.jogadorId}`, a]))
  for (const p of rodada.partidas) receberBilheteria(carreira, p.casaId, rodada.data)
  if (data.tipo === 'divisao') pagarDataDeDivisao(carreira)
  const clubesQueJogaram = new Set(rodada.partidas.flatMap((p) => [p.casaId, p.foraId]))
  for (const j of Object.values(carreira.jogadores)) {
    if (j.lesao > 0) j.lesao--
    if (j.suspensao > 0 && clubesQueJogaram.has(j.clubeId)) j.suspensao--
    j.condicao = Math.min(100, j.condicao + RECUPERACAO_CONDICAO)
  }
  rodada.partidas.forEach((partida, i) => {
    data.partidas[i].resultado = { golsCasa: partida.golsCasa, golsFora: partida.golsFora, ...(partida.penaltis && { penaltis: partida.penaltis }) }
    for (const j of [...partida.casa.jogaram, ...partida.fora.jogaram]) j.stats.partidas++
    for (const id of partida.autores) carreira.jogadores[id].stats[data.tipo === 'copa' ? 'golsCopa' : 'golsDivisao']++
    const competicao = (data.tipo === 'copa' ? 'copa' : data.partidas[i].divisao) as CompeticaoHistorico
    const gols = new Map<string, number>()
    for (const id of partida.autores) gols.set(id, (gols.get(id) ?? 0) + 1)
    for (const nome of LADOS) {
      const clubeId = nome === 'casa' ? partida.casaId : partida.foraId
      for (const j of partida[nome].jogaram) {
        const chave = `${competicao}:${clubeId}:${j.id}`
        let agregado = agregados.get(chave)
        if (!agregado) {
          agregado = { jogadorId: j.id, nome: j.nome, competicao, clubeId, gols: 0, partidas: 0 }
          carreira.artilharia.push(agregado)
          agregados.set(chave, agregado)
        }
        agregado.partidas++
        agregado.gols += gols.get(j.id) ?? 0
      }
    }
    aplicarDisciplina(carreira, partida)
    aplicarMoral(partida)
  })
  if (data.tipo === 'copa') encerrarDataCopa(carreira, rodada.data)
  carreira.proximaData++
  atualizarPropostas(carreira)
  transferenciasDaIA(carreira)
}

export function simularRodada(carreira: Carreira): void {
  const rodada = iniciarRodada(carreira)
  while (rodada.minuto < MINUTO_FINAL) avancarMinuto(carreira, rodada)
  finalizarRodada(carreira, rodada)
}
