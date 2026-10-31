import { beforeAll, describe, expect, it } from 'vitest'
import { artilheirosCopa, classificacao } from './classificacao'
import { novaCarreira } from './carreira'
import { criarCopa, FASES, jogosDoConfronto, vencedorDoConfronto } from './copa'
import { disputarPenaltis, criarLado, criarPartida } from './partida'
import { criarRng } from './rng'
import { avancarMinuto, finalizarRodada, iniciarRodada, type Rodada } from './rodada'
import { aplicarEscalacaoAutomatica, setoresDaFormacao } from './tatica'
import { gerarJogador } from './jogadores'
import type { Carreira, Copa, PartidaAgendada } from './tipos'

function temporada(seed: number, clubeId: string) {
  const carreira = novaCarreira(seed, clubeId)
  const rodadas: Rodada[] = []
  while (carreira.proximaData < carreira.calendario.length) {
    aplicarEscalacaoAutomatica(carreira)
    const rodada = iniciarRodada(carreira)
    while (rodada.minuto < 90) avancarMinuto(carreira, rodada)
    rodadas.push(rodada)
    finalizarRodada(carreira, rodada)
  }
  return { carreira, rodadas }
}

const resultado = (casaId: string, foraId: string, golsCasa: number, golsFora: number, penaltis?: { casa: number; fora: number }): PartidaAgendada => ({
  divisao: 'A',
  casaId,
  foraId,
  resultado: { golsCasa, golsFora, ...(penaltis && { penaltis }) },
})

describe('participantes da Copa', () => {
  const clubes = novaCarreira(1, 'flamengo').clubes

  it('64 participantes sem repeticao: os 60 de A, B e C e 4 do Pool', () => {
    const { copa } = novaCarreira(3, 'flamengo')
    expect(copa.participantes).toHaveLength(64)
    expect(new Set(copa.participantes).size).toBe(64)
    const divisaoDe = new Map(clubes.map((c) => [c.id, c.divisao]))
    expect(copa.participantes.filter((id) => divisaoDe.get(id) !== 'D')).toHaveLength(60)
    expect(copa.participantes.filter((id) => divisaoDe.get(id) === 'D')).toHaveLength(4)
  })

  it('o Pool sorteado muda com o seed', () => {
    const pool = (seed: number) => novaCarreira(seed, 'flamengo').copa.participantes.filter((id) => clubes.find((c) => c.id === id)!.divisao === 'D').sort().join()
    expect(new Set([1, 2, 3, 4, 5, 6].map(pool)).size).toBeGreaterThan(1)
  })

  it('o Clube do Tecnico, se estiver no Pool, e sempre um dos 4', () => {
    for (let seed = 1; seed <= 30; seed++) {
      const copa = criarCopa(criarRng(seed), clubes, 'abc')
      expect(copa.participantes).toHaveLength(64)
      expect(new Set(copa.participantes).size).toBe(64)
      expect(copa.participantes).toContain('abc')
    }
  })

  it('a 1a fase e sorteada na criacao: 32 confrontos de jogo unico na primeira data da Copa', () => {
    const carreira = novaCarreira(3, 'flamengo')
    expect(carreira.copa.fases).toHaveLength(1)
    expect(carreira.copa.fases[0]).toHaveLength(32)
    const data = carreira.calendario[3]
    expect(data.partidas).toHaveLength(32)
    expect(data.partidas.every((p) => p.copa?.perna === 'unica' && p.resultado === null)).toBe(true)
    expect(new Set(data.partidas.flatMap((p) => [p.casaId, p.foraId])).size).toBe(64)
    expect(carreira.calendario[7].partidas).toHaveLength(0)
  })
})

describe('vencedorDoConfronto', () => {
  it('jogo unico: quem fez mais gols; no empate, quem ganha os penaltis', () => {
    expect(vencedorDoConfronto('a', 'b', [resultado('a', 'b', 2, 1)])).toBe('a')
    expect(vencedorDoConfronto('a', 'b', [resultado('a', 'b', 0, 1)])).toBe('b')
    expect(vencedorDoConfronto('a', 'b', [resultado('a', 'b', 1, 1, { casa: 3, fora: 4 })])).toBe('b')
    expect(vencedorDoConfronto('a', 'b', [resultado('a', 'b', 1, 1, { casa: 5, fora: 4 })])).toBe('a')
  })

  it('ida e volta: placar agregado, sem gol fora; empate no agregado vai aos penaltis da volta', () => {
    expect(vencedorDoConfronto('a', 'b', [resultado('a', 'b', 3, 0), resultado('b', 'a', 2, 0)])).toBe('a')
    expect(vencedorDoConfronto('a', 'b', [resultado('a', 'b', 1, 1), resultado('b', 'a', 2, 2, { casa: 4, fora: 3 })])).toBe('b')
    expect(vencedorDoConfronto('a', 'b', [resultado('a', 'b', 1, 0), resultado('b', 'a', 2, 2)])).toBe('a')
    expect(vencedorDoConfronto('a', 'b', [resultado('a', 'b', 1, 0), resultado('b', 'a', 1, 0, { casa: 4, fora: 5 })])).toBe('a')
    expect(vencedorDoConfronto('a', 'b', [resultado('a', 'b', 2, 1), resultado('b', 'a', 1, 0, { casa: 5, fora: 3 })])).toBe('b')
  })
})

describe('disputarPenaltis', () => {
  const lado = (prefixo: string) =>
    criarLado(setoresDaFormacao('4-4-2').map((p, i) => gerarJogador(criarRng(1), `${prefixo}${i}`, prefixo, p, 60, 2026)), '4-4-2', 'equilibrada')

  it.each(['casa', 'fora'] as const)('sem cobradores na %s, o adversario vence sem jogador inexistente', (nome) => {
    const p = criarPartida(lado('c'), lado('f'))
    p[nome] = criarLado([], '4-4-2', 'equilibrada')
    const r = disputarPenaltis(criarRng(9), p)
    expect(r[nome]).toBe(0)
    expect(r[nome === 'casa' ? 'fora' : 'casa']).toBe(1)
    expect(r.cobrancas).toEqual([])
  })

  it('sem cobradores dos dois lados, desempata por sorteio deterministico', () => {
    const p = criarPartida(criarLado([], '4-4-2', 'equilibrada'), criarLado([], '4-4-2', 'equilibrada'))
    const r = disputarPenaltis(criarRng(9), p)
    expect(r).toEqual(disputarPenaltis(criarRng(9), p))
    expect(r.casa).not.toBe(r.fora)
    expect(r.cobrancas).toEqual([])
  })

  it('nunca termina empatado e as cobrancas alternam, 5 de cada e depois ate desempatar', () => {
    const rng = criarRng(5)
    let alternadas = 0
    let mortesSubitas = 0
    for (let i = 0; i < 2000; i++) {
      const r = disputarPenaltis(rng, criarPartida(lado('c'), lado('f')))
      expect(r.casa).not.toBe(r.fora)
      expect(r.cobrancas.filter((c) => c.lado === 'casa' && c.convertida)).toHaveLength(r.casa)
      expect(r.cobrancas.filter((c) => c.lado === 'fora' && c.convertida)).toHaveLength(r.fora)
      r.cobrancas.forEach((c, k) => expect(c.lado).toBe(k % 2 === 0 ? 'casa' : 'fora'))
      alternadas++
      const porLado = (l: string) => r.cobrancas.filter((c) => c.lado === l).length
      if (porLado('casa') > 5) {
        mortesSubitas++
        expect(porLado('casa')).toBe(porLado('fora'))
        const aposCinco = (l: string) => r.cobrancas.filter((c) => c.lado === l).slice(0, 5).filter((c) => c.convertida).length
        expect(aposCinco('casa')).toBe(aposCinco('fora'))
      } else expect(Math.abs(porLado('casa') - porLado('fora'))).toBeLessThanOrEqual(1)
    }
    expect(alternadas).toBe(2000)
    expect(mortesSubitas).toBeGreaterThan(0)
  })

  it('e deterministico por seed', () => {
    const a = disputarPenaltis(criarRng(9), criarPartida(lado('c'), lado('f')))
    const b = disputarPenaltis(criarRng(9), criarPartida(lado('c'), lado('f')))
    expect(a.cobrancas.map((c) => [c.jogador.id, c.convertida])).toEqual(b.cobrancas.map((c) => [c.jogador.id, c.convertida]))
  })
})

describe('Copa de uma Temporada', () => {
  let carreira: Carreira
  let rodadas: Rodada[]
  let copa: Copa
  let datasCopa: number[]
  beforeAll(() => {
    const simulada = temporada(9, 'flamengo')
    carreira = simulada.carreira
    rodadas = simulada.rodadas
    copa = carreira.copa
    datasCopa = carreira.calendario.flatMap((d, i) => d.tipo === 'copa' ? [i] : [])
  }, 30000)

  it('tem 32, 16, 8, 4, 2 e 1 confrontos por fase, cada fase com os vencedores da anterior', () => {
    expect(copa.fases.map((f) => f.length)).toEqual([32, 16, 8, 4, 2, 1])
    for (let f = 1; f < FASES.length; f++) {
      const participantes = copa.fases[f].flatMap((c) => [c.primeiroId, c.segundoId]).sort()
      expect(participantes).toEqual(copa.fases[f - 1].map((c) => c.vencedorId!).sort())
    }
  })

  it('cada confronto tem 1 jogo (fases 1 e 2) ou 2 jogos com mando invertido', () => {
    copa.fases.forEach((confrontos, f) => {
      for (const c of confrontos) {
        const jogos = jogosDoConfronto(carreira, f, c)
        expect(jogos).toHaveLength(FASES[f].idaEVolta ? 2 : 1)
        expect(jogos[0].casaId).toBe(c.primeiroId)
        if (jogos[1]) expect(jogos[1].casaId).toBe(c.segundoId)
        expect(jogos.every((j) => j.resultado !== null)).toBe(true)
        expect(c.vencedorId).toBe(vencedorDoConfronto(c.primeiroId, c.segundoId, jogos))
      }
    })
  })

  it('so empata em jogo unico ou no agregado aciona penaltis, e eles ficam gravados', () => {
    let comPenaltis = 0
    for (const rodada of rodadas) {
      for (const p of rodada.partidas) {
        const empate = p.golsCasa + p.anteriorCasa === p.golsFora + p.anteriorFora
        expect(p.penaltis !== null).toBe(p.precisaVencedor && empate)
        if (p.penaltis) {
          comPenaltis++
          const grav = carreira.calendario[rodada.data].partidas[rodada.partidas.indexOf(p)].resultado!
          expect(grav.penaltis).toEqual(p.penaltis)
        }
      }
    }
    expect(comPenaltis).toBeGreaterThan(0)
  })

  it('os penaltis sao narrados: abertura, uma linha por cobranca e o placar', () => {
    const p = rodadas.flatMap((r) => r.partidas).find((x) => x.penaltis)!
    const linhas = p.eventos.filter((e) => e.tipo === 'penalti')
    expect(linhas[0].texto).toMatch(/pênaltis/)
    expect(linhas[linhas.length - 1].texto).toBe(`Pênaltis: ${nome(p.casaId)} ${p.penaltis!.casa} x ${p.penaltis!.fora} ${nome(p.foraId)}.`)
    expect(linhas.filter((e) => /converte/.test(e.texto))).toHaveLength(p.penaltis!.casa + p.penaltis!.fora)
    function nome(id: string) {
      return carreira.clubes.find((c) => c.id === id)!.nomeCurto
    }
  })

  it('clubes eliminados nao jogam as datas seguintes da Copa; ha um unico campeao', () => {
    const ultimaFase = new Map<string, number>()
    copa.fases.forEach((confrontos, f) => confrontos.forEach((c) => [c.primeiroId, c.segundoId].forEach((id) => ultimaFase.set(id, f))))
    expect(ultimaFase.size).toBe(64)
    for (const [id, fase] of ultimaFase) {
      const perdeu = copa.fases[fase].some((c) => c.vencedorId !== id && (c.primeiroId === id || c.segundoId === id))
      expect(perdeu).toBe(id !== copa.campeaoId)
    }
    const campeoes = [...ultimaFase].filter(([, f]) => f === 5).map(([id]) => id)
    expect(campeoes).toHaveLength(2)
    expect(copa.campeaoId).toBe(copa.fases[5][0].vencedorId)
    datasCopa.forEach((i, k) => {
      const jogam = carreira.calendario[i].partidas.flatMap((p) => [p.casaId, p.foraId])
      expect(new Set(jogam).size).toBe(jogam.length)
      expect(jogam.length).toBe([64, 32, 16, 16, 8, 8, 4, 4, 2, 2][k])
    })
  })

  it('artilheiros da Copa somam os gols das datas da Copa', () => {
    const golsCopa = datasCopa.flatMap((i) => carreira.calendario[i].partidas).reduce((s, p) => s + p.resultado!.golsCasa + p.resultado!.golsFora, 0)
    const todos = Object.values(carreira.jogadores).reduce((s, j) => s + j.stats.golsCopa, 0)
    expect(todos).toBe(golsCopa)
    const lista = artilheirosCopa(carreira)
    expect(lista).toHaveLength(10)
    expect(artilheirosCopa(carreira, Infinity).reduce((s, a) => s + a.gols, 0)).toBe(golsCopa)
    for (let i = 1; i < lista.length; i++) expect(lista[i - 1].gols).toBeGreaterThanOrEqual(lista[i].gols)
  })

  it('a Copa nao entra na classificacao das Divisoes', () => {
    for (const d of ['A', 'B', 'C'] as const) expect(classificacao(carreira, d).every((l) => l.j === 38)).toBe(true)
  })
})

describe('Tecnico eliminado da Copa', () => {
  it('assiste so aos placares: a data nao exige Escalacao valida', () => {
    const carreira = novaCarreira(12, 'maringa')
    let verificado = false
    while (carreira.proximaData < carreira.calendario.length) {
      const data = carreira.calendario[carreira.proximaData]
      const joga = data.partidas.some((p) => p.casaId === carreira.clubeId || p.foraId === carreira.clubeId)
      if (data.tipo === 'copa' && !joga) {
        carreira.escalacao.titulares = []
        const rodada = iniciarRodada(carreira)
        expect(rodada.partidas.length).toBeGreaterThan(0)
        while (rodada.minuto < 90) avancarMinuto(carreira, rodada)
        finalizarRodada(carreira, rodada)
        verificado = true
        continue
      }
      aplicarEscalacaoAutomatica(carreira)
      const rodada = iniciarRodada(carreira)
      while (rodada.minuto < 90) avancarMinuto(carreira, rodada)
      finalizarRodada(carreira, rodada)
    }
    expect(verificado).toBe(true)
  }, 30000)
})
