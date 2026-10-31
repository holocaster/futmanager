import { describe, expect, it } from 'vitest'
import { novaCarreira } from './carreira'
import { artilheiros, artilheirosCopa } from './classificacao'
import { elencoDe } from './elenco'
import { precoPedido, proporTroca, transferir, valorDe } from './mercado'
import { finalizarRodada, iniciarRodada } from './rodada'
import { aplicarEscalacaoAutomatica } from './tatica'
import { fimDeTemporada } from './temporada'
import type { Carreira, CompeticaoHistorico, Jogador } from './tipos'
import { carregar, salvar } from '../save'
import { memoria } from '../save.test-helpers'

function marcar(carreira: Carreira, jogador: Jogador, gols: number, competicao: CompeticaoHistorico) {
  aplicarEscalacaoAutomatica(carreira)
  const data = carreira.calendario[carreira.proximaData]
  data.tipo = competicao === 'copa' ? 'copa' : 'divisao'
  if (competicao === 'copa') data.rodada = 3
  const agendada = data.partidas.find((p) => p.casaId === jogador.clubeId || p.foraId === jogador.clubeId)!
  agendada.divisao = competicao === 'copa' ? 'D' : competicao
  const rodada = iniciarRodada(carreira)
  const partida = rodada.partidas[data.partidas.indexOf(agendada)]
  const lado = partida.casaId === jogador.clubeId ? 'casa' : 'fora'
  if (!partida[lado].jogaram.includes(jogador)) partida[lado].jogaram.push(jogador)
  partida.autores = Array<string>(gols).fill(jogador.id)
  if (lado === 'casa') partida.golsCasa = gols
  else partida.golsFora = gols
  partida.penaltis = { casa: 5, fora: 4 }
  rodada.minuto = 90
  finalizarRodada(carreira, rodada)
}

describe('artilharia por competicao e origem', () => {
  it('Transferencias entre Divisoes e ao Pool nao movem gols antigos; gols de Copa e penaltis ficam separados', () => {
    const c = novaCarreira(1, 'flamengo')
    const j = elencoDe(c, 'flamengo').find((j) => j.posicao === 'A')!
    marcar(c, j, 2, 'A')
    marcar(c, j, 2, 'copa')
    transferir(c, j, 'ceara', 1)
    marcar(c, j, 3, 'B')
    marcar(c, j, 1, 'copa')
    transferir(c, j, 'abc', 1)
    expect(artilheiros(c, 'A')[0]).toMatchObject({ jogadorId: j.id, gols: 2, origens: [{ clubeId: 'flamengo', gols: 2 }] })
    expect(artilheiros(c, 'B')[0]).toMatchObject({ jogadorId: j.id, gols: 3, origens: [{ clubeId: 'ceara', gols: 3 }] })
    expect(artilheirosCopa(c)[0]).toMatchObject({ jogadorId: j.id, gols: 3, origens: [{ clubeId: 'flamengo', gols: 2 }, { clubeId: 'ceara', gols: 1 }] })
    expect(artilheiros(c, 'D')).toEqual([])
    const storage = memoria()
    expect(salvar(storage, 1, c)).toBeNull()
    const carregada = carregar(storage, 1)!
    expect(carregada.artilharia).toEqual(c.artilharia)
    aplicarEscalacaoAutomatica(c)
    aplicarEscalacaoAutomatica(carregada)
    const original = iniciarRodada(c)
    const copia = iniciarRodada(carregada)
    original.minuto = copia.minuto = 90
    finalizarRodada(c, original)
    finalizarRodada(carregada, copia)
    expect(JSON.stringify(carregada)).toBe(JSON.stringify(c))
  })

  it('soma origens na mesma competicao, ordena pelo total e guarda copia no Historico mesmo se o autor sai', () => {
    const c = novaCarreira(2, 'flamengo')
    const j = elencoDe(c, 'flamengo').find((j) => j.posicao === 'A')!
    const rival = elencoDe(c, 'santos').find((j) => j.posicao === 'A')!
    marcar(c, j, 2, 'A')
    transferir(c, j, 'santos', 1)
    marcar(c, j, 3, 'A')
    marcar(c, rival, 4, 'A')
    const esperado = { jogadorId: j.id, nome: j.nome, gols: 5, origens: [{ clubeId: 'flamengo', gols: 2 }, { clubeId: 'santos', gols: 3 }] }
    expect(artilheiros(c, 'A')[0]).toMatchObject(esperado)
    delete c.jogadores[j.id]
    expect(artilheiros(c, 'A')[0]).toMatchObject(esperado)
    c.proximaData = c.calendario.length
    const resumo = fimDeTemporada(c)
    expect(resumo.artilheiros.A).toMatchObject(esperado)
    expect(artilheiros(c, 'A')).toEqual([])
    fimDeTemporada({ ...c, proximaData: c.calendario.length })
    expect(resumo.artilheiros.A).toMatchObject(esperado)
  })

  it.each(['ceara', 'santos', 'abc'])('Troca com %s preserva ambas as origens e novos gols no destino', (destino) => {
    const c = novaCarreira(3, 'flamengo')
    const meu = elencoDe(c, 'flamengo').find((j) => j.posicao === 'A')!
    const alvo = elencoDe(c, destino).find((j) => j.posicao === 'A')!
    marcar(c, meu, 2, 'A')
    if (destino !== 'abc') marcar(c, alvo, 1, destino === 'santos' ? 'A' : 'B')
    expect(proporTroca(c, meu.id, alvo.id, Math.max(0, precoPedido(c, alvo) - valorDe(meu))).resultado).toBe('aceita')
    marcar(c, alvo, 3, 'A')
    expect(artilheiros(c, 'A').find((a) => a.jogadorId === meu.id)?.origens).toEqual([{ clubeId: 'flamengo', gols: 2 }])
    expect(artilheiros(c, 'A').find((a) => a.jogadorId === alvo.id)?.gols).toBe(destino === 'santos' ? 4 : 3)
    if (destino === 'ceara') expect(artilheiros(c, 'B')[0].origens).toEqual([{ clubeId: 'ceara', gols: 1 }])
  })
})
