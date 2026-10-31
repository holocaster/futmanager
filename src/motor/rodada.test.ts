import { beforeAll, describe, expect, it } from 'vitest'
import { artilheiros, classificacao } from './classificacao'
import { novaCarreira } from './carreira'
import { aplicarEscalacaoAutomatica, validarEscalacao } from './tatica'
import { elencoDe } from './elenco'
import { avancarMinuto, finalizarRodada, iniciarRodada, mudarFormacaoNaPartida, mudarPosturaNaPartida, partidaDoTecnico, simularRodada, substituir, type EventoPartida, type Rodada } from './rodada'
import type { Carreira, Divisao } from './tipos'

const DIVISOES: Divisao[] = ['A', 'B', 'C']

function temporada(seed: number, clubeId = 'flamengo'): Carreira {
  const carreira = novaCarreira(seed, clubeId)
  for (let i = 0; i < 48; i++) jogar(carreira)
  return carreira
}

function jogar(carreira: Carreira): void {
  aplicarEscalacaoAutomatica(carreira)
  simularRodada(carreira)
}

describe('simularRodada', () => {
  it('Copa sem elegiveis dos dois lados termina e narra o desempate sem inventar cobradores', () => {
    const c = novaCarreira(2, 'flamengo')
    c.proximaData = 3
    for (const j of Object.values(c.jogadores)) j.lesao = 1
    aplicarEscalacaoAutomatica(c)
    const rodada = iniciarRodada(c)
    while (rodada.minuto < 90) avancarMinuto(c, rodada)
    finalizarRodada(c, rodada)
    expect(c.proximaData).toBe(4)
    expect(c.calendario[3].partidas.every((p) => p.resultado?.penaltis && p.resultado.penaltis.casa !== p.resultado.penaltis.fora)).toBe(true)
    expect(partidaDoTecnico(c, rodada)!.eventos.some((e) => e.texto.includes('sorteio'))).toBe(true)
    expect(c.copa.fases[1]).toHaveLength(16)
  })
  it('conclui uma data mesmo sem nenhum elegivel, sem lances de jogadores inexistentes', () => {
    const c = novaCarreira(2, 'flamengo')
    for (const j of elencoDe(c, c.clubeId)) j.lesao = 1
    aplicarEscalacaoAutomatica(c)
    expect(validarEscalacao(c, c.escalacao)).toEqual([])
    const rodada = iniciarRodada(c)
    while (rodada.minuto < 90) avancarMinuto(c, rodada)
    finalizarRodada(c, rodada)
    expect(c.proximaData).toBe(1)
    expect(partidaDoTecnico(c, rodada)!.eventos.every((e) => e.clubeId !== c.clubeId)).toBe(true)
    expect(elencoDe(c, c.clubeId).every((j) => j.lesao === 0)).toBe(true)
  })
  it('simula todas as Partidas da proxima data e avanca o calendario', () => {
    const carreira = novaCarreira(1, 'flamengo')
    simularRodada(carreira)
    expect(carreira.proximaData).toBe(1)
    expect(carreira.calendario[0].partidas).toHaveLength(30)
    expect(carreira.calendario[0].partidas.every((j) => j.resultado !== null)).toBe(true)
    expect(carreira.calendario[1].partidas.every((j) => j.resultado === null)).toBe(true)
  })

  it('o Clube do Tecnico tambem joga', () => {
    const carreira = novaCarreira(1, 'flamengo')
    simularRodada(carreira)
    const doTecnico = carreira.calendario[0].partidas.find((j) => j.casaId === 'flamengo' || j.foraId === 'flamengo')!
    expect(doTecnico.resultado).not.toBeNull()
  })

  it('gols dos resultados viram gols dos Jogadores e partidas de quem jogou', () => {
    const carreira = novaCarreira(2, 'santos')
    for (let i = 0; i < 5; i++) jogar(carreira)
    const golsDosResultados = carreira.calendario.flatMap((d) => d.partidas).reduce((s, j) => s + (j.resultado ? j.resultado.golsCasa + j.resultado.golsFora : 0), 0)
    const jogadores = Object.values(carreira.jogadores)
    expect(golsDosResultados).toBeGreaterThan(0)
    expect(jogadores.reduce((s, j) => s + j.stats.golsDivisao + j.stats.golsCopa, 0)).toBe(golsDosResultados)
    expect(jogadores.reduce((s, j) => s + j.stats.golsCopa, 0)).toBe(carreira.calendario[3].partidas.reduce((s, p) => s + p.resultado!.golsCasa + p.resultado!.golsFora, 0))
    expect(jogadores.reduce((s, j) => s + j.stats.partidas, 0)).toBeGreaterThanOrEqual(22 * (4 * 30 + 32))
  })

  it('so permite simular enquanto houver Rodadas', () => {
    const carreira = temporada(3)
    expect(carreira.proximaData).toBe(48)
    expect(() => simularRodada(carreira)).toThrow()
  }, 30000)

  it('a Temporada simulada e deterministica por seed', () => {
    const a = JSON.stringify(temporada(42))
    expect(a).toBe(JSON.stringify(temporada(42)))
    expect(a).not.toBe(JSON.stringify(temporada(43)))
  }, 20000)
})

describe('Rodada ao vivo', () => {
  function aoVivo(carreira: Carreira) {
    const rodada = iniciarRodada(carreira)
    const eventos: EventoPartida[] = []
    for (let m = 0; m < 90; m++) eventos.push(...avancarMinuto(carreira, rodada))
    return { rodada, eventos }
  }

  it('rodar minuto a minuto da o mesmo resultado que simularRodada com o mesmo seed', () => {
    const a = novaCarreira(21, 'flamengo')
    const b = novaCarreira(21, 'flamengo')
    for (let i = 0; i < 4; i++) {
      aplicarEscalacaoAutomatica(a)
      const { rodada } = aoVivo(a)
      finalizarRodada(a, rodada)
      jogar(b)
    }
    expect(JSON.stringify(a)).toBe(JSON.stringify(b))
  })

  it('os eventos de gol batem com o placar de cada Partida', () => {
    const carreira = novaCarreira(22, 'santos')
    const { rodada, eventos } = aoVivo(carreira)
    expect(eventos.filter((e) => e.tipo === 'gol').length).toBeGreaterThan(0)
    rodada.partidas.forEach((p, i) => {
      const gols = eventos.filter((e) => e.partida === i && e.tipo === 'gol')
      expect(gols.filter((e) => e.clubeId === p.casaId)).toHaveLength(p.golsCasa)
      expect(gols.filter((e) => e.clubeId === p.foraId)).toHaveLength(p.golsFora)
      expect(p.eventos.filter((e) => e.tipo === 'gol')).toHaveLength(p.golsCasa + p.golsFora)
    })
  })

  it('eventos tem minuto e texto em portugues; gol cita o autor; intervalo aos 45 pede pausa', () => {
    const carreira = novaCarreira(23, 'santos')
    const { rodada, eventos } = aoVivo(carreira)
    for (const e of eventos) {
      expect(e.minuto).toBeGreaterThanOrEqual(1)
      expect(e.minuto).toBeLessThanOrEqual(90)
      expect(e.texto.length).toBeGreaterThan(0)
    }
    const meu = partidaDoTecnico(carreira, rodada)!
    const gol = meu.eventos.find((e) => e.tipo === 'gol') ?? eventos.find((e) => e.tipo === 'gol')!
    const autor = Object.values(carreira.jogadores).find((j) => gol.texto.includes(j.nome))
    expect(gol.texto).toMatch(/^Gol!/)
    expect(autor).toBeDefined()
    expect(eventos.some((e) => e.tipo === 'chance')).toBe(true)
    const intervalos = eventos.filter((e) => e.tipo === 'intervalo')
    expect(intervalos).toHaveLength(30)
    expect(intervalos.every((e) => e.minuto === 45 && e.pausa)).toBe(true)
    expect(eventos.filter((e) => e.pausa).every((e) => e.tipo === 'intervalo')).toBe(true)
    expect(eventos.filter((e) => e.tipo === 'fim').every((e) => e.minuto === 90)).toBe(true)
  })

  it('avancarMinuto devolve so os eventos do minuto e a Rodada nao passa de 90', () => {
    const carreira = novaCarreira(24, 'santos')
    const rodada = iniciarRodada(carreira)
    const primeiro = avancarMinuto(carreira, rodada)
    expect(primeiro.every((e) => e.minuto === 1)).toBe(true)
    expect(rodada.minuto).toBe(1)
    for (let m = 1; m < 90; m++) avancarMinuto(carreira, rodada)
    expect(() => avancarMinuto(carreira, rodada)).toThrow()
  })

  it('finalizarRodada exige os 90 minutos, grava os resultados e ativa a proxima data', () => {
    const carreira = novaCarreira(25, 'santos')
    const rodada = iniciarRodada(carreira)
    avancarMinuto(carreira, rodada)
    expect(() => finalizarRodada(carreira, rodada)).toThrow()
    for (let m = 1; m < 90; m++) avancarMinuto(carreira, rodada)
    expect(carreira.calendario[0].partidas.every((p) => p.resultado === null)).toBe(true)
    finalizarRodada(carreira, rodada)
    expect(carreira.proximaData).toBe(1)
    expect(carreira.calendario[0].partidas.every((p) => p.resultado !== null)).toBe(true)
    rodada.partidas.forEach((p, i) => expect(carreira.calendario[0].partidas[i].resultado).toEqual({ golsCasa: p.golsCasa, golsFora: p.golsFora }))
    expect(() => finalizarRodada(carreira, rodada)).toThrow()
    expect(iniciarRodada(carreira).data).toBe(1)
  })

  it('datas em que o Clube do Tecnico nao joga tambem rodam, sem Partida do Tecnico e sem pausa', () => {
    const carreira = novaCarreira(27, 'santos')
    carreira.clubeId = 'abc'
    const { rodada, eventos } = aoVivo(carreira)
    expect(partidaDoTecnico(carreira, rodada)).toBeUndefined()
    finalizarRodada(carreira, rodada)
    expect(carreira.proximaData).toBe(1)
    expect(eventos.some((e) => e.tipo === 'gol')).toBe(true)
  })

  it('iniciarRodada recusa Escalacao invalida do Tecnico', () => {
    const carreira = novaCarreira(26, 'santos')
    carreira.escalacao.titulares = carreira.escalacao.titulares.slice(0, 9)
    expect(() => iniciarRodada(carreira)).toThrow(/11 titulares/)
  })
})

describe('Cartoes, lesoes, condicao e moral', () => {
  function rodadaSemAcasos(carreira: Carreira) {
    const rodada = iniciarRodada(carreira)
    while (rodada.minuto < 90) avancarMinuto(carreira, rodada)
    for (const p of rodada.partidas) {
      p.cartoes = []
      p.lesoes = []
    }
    return rodada
  }
  const doAdversario = (carreira: Carreira, rodada: Rodada) => {
    const p = rodada.partidas.find((x) => x.casaId !== carreira.clubeId && x.foraId !== carreira.clubeId)!
    return { partida: p, jogador: carreira.jogadores[p.casa.jogaram[5].id] }
  }

  it('vermelho suspende por 1 jogo, e a suspensao e cumprida na proxima Partida do Clube', () => {
    const carreira = novaCarreira(31, 'santos')
    const rodada = rodadaSemAcasos(carreira)
    const { partida, jogador } = doAdversario(carreira, rodada)
    partida.cartoes.push({ jogadorId: jogador.id, tipo: 'vermelho' })
    finalizarRodada(carreira, rodada)
    expect(jogador.suspensao).toBe(1)
    const proxima = iniciarRodada(carreira)
    const lado = proxima.partidas.find((p) => p.casaId === jogador.clubeId || p.foraId === jogador.clubeId)!
    const titulares = [...lado.casa.titulares, ...lado.fora.titulares]
    expect(titulares).not.toContain(jogador)
    while (proxima.minuto < 90) avancarMinuto(carreira, proxima)
    for (const p of proxima.partidas) p.cartoes = []
    finalizarRodada(carreira, proxima)
    expect(jogador.suspensao).toBe(0)
  })

  it('3 amarelos acumulados suspendem por 1 jogo e zeram o acumulado', () => {
    const carreira = novaCarreira(32, 'santos')
    const rodada = rodadaSemAcasos(carreira)
    const { partida, jogador } = doAdversario(carreira, rodada)
    jogador.amarelos = 1
    partida.cartoes.push({ jogadorId: jogador.id, tipo: 'amarelo' })
    finalizarRodada(carreira, rodada)
    expect(jogador).toMatchObject({ amarelos: 2, suspensao: 0 })
    const segunda = rodadaSemAcasos(carreira)
    const mesmo = segunda.partidas.find((p) => p.casaId === jogador.clubeId || p.foraId === jogador.clubeId)!
    mesmo.cartoes.push({ jogadorId: jogador.id, tipo: 'amarelo' })
    finalizarRodada(carreira, segunda)
    expect(jogador).toMatchObject({ amarelos: 0, suspensao: 1 })
  })

  it('segundo amarelo na mesma Partida suspende por 1 jogo sem somar ao acumulado', () => {
    const carreira = novaCarreira(33, 'santos')
    const rodada = rodadaSemAcasos(carreira)
    const { partida, jogador } = doAdversario(carreira, rodada)
    partida.cartoes.push({ jogadorId: jogador.id, tipo: 'amarelo' }, { jogadorId: jogador.id, tipo: 'amarelo' }, { jogadorId: jogador.id, tipo: 'vermelho' })
    finalizarRodada(carreira, rodada)
    expect(jogador).toMatchObject({ amarelos: 0, suspensao: 1 })
  })

  it('lesao de N datas some depois de N datas', () => {
    const carreira = novaCarreira(34, 'santos')
    const rodada = rodadaSemAcasos(carreira)
    const { partida, jogador } = doAdversario(carreira, rodada)
    partida.lesoes.push({ jogadorId: jogador.id, datas: 3 })
    finalizarRodada(carreira, rodada)
    expect(jogador.lesao).toBe(3)
    for (const esperado of [2, 1, 0]) {
      finalizarRodada(carreira, rodadaSemAcasos(carreira))
      expect(jogador.lesao).toBe(esperado)
    }
  })

  it('a Escalacao do Tecnico recusa o suspenso ate ser corrigida; a IA nunca escala indisponiveis', () => {
    const carreira = novaCarreira(35, 'santos')
    let indisponiveis = 0
    for (let i = 0; i < 12; i++) {
      aplicarEscalacaoAutomatica(carreira)
      const rodada = iniciarRodada(carreira)
      for (const p of rodada.partidas) for (const j of [...p.casa.titulares, ...p.fora.titulares, ...p.casa.banco, ...p.fora.banco]) expect(j.lesao === 0 && j.suspensao === 0).toBe(true)
      while (rodada.minuto < 90) avancarMinuto(carreira, rodada)
      finalizarRodada(carreira, rodada)
      indisponiveis += Object.values(carreira.jogadores).filter((j) => j.lesao > 0 || j.suspensao > 0).length
      const meus = elencoDe(carreira, 'santos').filter((j) => carreira.escalacao.titulares.includes(j.id) && (j.lesao > 0 || j.suspensao > 0))
      if (meus.length) expect(validarEscalacao(carreira, carreira.escalacao).length).toBeGreaterThan(0)
    }
    expect(indisponiveis).toBeGreaterThan(0)
  }, 30000)

  it('a condicao cai ao jogar (mais na ofensiva) e recupera 15 por data para quem nao joga', () => {
    const carreira = novaCarreira(36, 'santos')
    carreira.escalacao.postura = 'ofensiva'
    const meus = carreira.escalacao.titulares.map((id) => carreira.jogadores[id])
    const reserva = carreira.jogadores[carreira.escalacao.reservas[0]]
    const fora = elencoDe(carreira, 'santos').find((j) => !carreira.escalacao.titulares.includes(j.id) && !carreira.escalacao.reservas.includes(j.id))!
    fora.condicao = 50
    finalizarRodada(carreira, rodadaSemAcasos(carreira))
    expect(Math.max(...meus.map((j) => j.condicao))).toBeLessThan(96)
    expect(reserva.condicao).toBe(100)
    expect(fora.condicao).toBe(65)
    finalizarRodada(carreira, rodadaSemAcasos(carreira))
    expect(fora.condicao).toBe(80)
  })

  it('moral sobe com vitoria, cai com derrota, fica igual no empate; reservas que nao jogam perdem um pouco', () => {
    const carreira = novaCarreira(37, 'santos')
    const rodada = rodadaSemAcasos(carreira)
    finalizarRodada(carreira, rodada)
    let vitorias = 0
    let derrotas = 0
    let empates = 0
    for (const p of rodada.partidas) {
      const saldo = p.golsCasa - p.golsFora
      for (const [lado, s] of [[p.casa, saldo], [p.fora, -saldo]] as const) {
        const esperado = 70 + Math.sign(s) * 3
        for (const j of lado.jogaram) expect(j.moral).toBe(esperado)
        for (const r of lado.banco) expect(r.moral).toBe(69)
        if (s > 0) vitorias++
        else if (s < 0) derrotas++
        else empates++
      }
    }
    expect(vitorias).toBe(derrotas)
    expect(vitorias + empates).toBeGreaterThan(0)
  })
})

describe('Mudancas durante a Rodada', () => {
  function ate(carreira: Carreira, rodada: Rodada, minuto: number) {
    while (rodada.minuto < minuto) avancarMinuto(carreira, rodada)
  }

  function comAcoes(seed: number) {
    const carreira = novaCarreira(seed, 'santos')
    const rodada = iniciarRodada(carreira)
    ate(carreira, rodada, 30)
    const [, entrada] = carreira.escalacao.reservas
    const saida = carreira.escalacao.titulares.find((id) => carreira.jogadores[id].posicao === carreira.jogadores[entrada].posicao)!
    const erro = substituir(carreira, rodada, saida, entrada)
    mudarPosturaNaPartida(carreira, rodada, 'ofensiva')
    ate(carreira, rodada, 60)
    mudarFormacaoNaPartida(carreira, rodada, '3-4-3')
    ate(carreira, rodada, 90)
    finalizarRodada(carreira, rodada)
    return { carreira, erro }
  }

  it('a mesma sequencia de acoes gera a mesma Carreira', () => {
    const a = comAcoes(41)
    expect(a.erro).toBeNull()
    expect(JSON.stringify(a.carreira)).toBe(JSON.stringify(comAcoes(41).carreira))
  })

  it('as acoes do Tecnico mudam o jogo em relacao a nao fazer nada', () => {
    const semAcoes = novaCarreira(41, 'santos')
    simularRodada(semAcoes)
    expect(JSON.stringify(comAcoes(41).carreira)).not.toBe(JSON.stringify(semAcoes))
  })

  it('substituir narra o evento na Partida do Tecnico e a IA nao mexe no time dele', () => {
    const carreira = novaCarreira(42, 'santos')
    const rodada = iniciarRodada(carreira)
    ate(carreira, rodada, 20)
    const meu = partidaDoTecnico(carreira, rodada)!
    const lado = meu.casaId === 'santos' ? meu.casa : meu.fora
    const entrada = lado.banco.find((j) => j.posicao === 'M')!
    const saida = lado.titulares.find((j) => j.posicao === 'M')!
    expect(substituir(carreira, rodada, saida.id, entrada.id)).toBeNull()
    const evento = meu.eventos.find((e) => e.tipo === 'substituicao')!
    expect(evento).toMatchObject({ minuto: 20, clubeId: 'santos', pausa: false })
    expect(evento.texto).toContain(saida.nome)
    expect(evento.texto).toContain(entrada.nome)
    expect(substituir(carreira, rodada, saida.id, entrada.id)).toMatch(/banco/)
    ate(carreira, rodada, 90)
    expect(lado.substituicoes).toBe(1)
  })

  it('a IA faz Substituicoes narradas, sem passar de 5 nem de 3 paradas', () => {
    const carreira = novaCarreira(43, 'santos')
    let narradas = 0
    for (let i = 0; i < 6; i++) {
      aplicarEscalacaoAutomatica(carreira)
      const rodada = iniciarRodada(carreira)
      ate(carreira, rodada, 90)
      for (const p of rodada.partidas) {
        for (const lado of [p.casa, p.fora]) {
          expect(lado.substituicoes).toBeLessThanOrEqual(5)
          expect(lado.paradas).toBeLessThanOrEqual(3)
          expect(lado.titulares.length + lado.setores.length).toBe(2 * lado.setores.length)
        }
        narradas += p.eventos.filter((e) => e.tipo === 'substituicao').length
      }
      finalizarRodada(carreira, rodada)
    }
    expect(narradas).toBeGreaterThan(0)
  }, 30000)

  it('quem entrou na Partida conta jogo e ganha a moral do resultado', () => {
    const carreira = novaCarreira(44, 'santos')
    const rodada = iniciarRodada(carreira)
    ate(carreira, rodada, 20)
    const meu = partidaDoTecnico(carreira, rodada)!
    const lado = meu.casaId === 'santos' ? meu.casa : meu.fora
    const entrada = lado.banco.find((j) => j.posicao === 'D')!
    const saida = lado.titulares.find((j) => j.posicao === 'D')!
    substituir(carreira, rodada, saida.id, entrada.id)
    ate(carreira, rodada, 90)
    for (const p of rodada.partidas) p.cartoes = []
    finalizarRodada(carreira, rodada)
    expect(entrada.stats.partidas).toBe(1)
    expect(saida.stats.partidas).toBe(1)
    expect(entrada.moral).toBe(saida.moral)
  })
})

describe('Temporada completa', () => {
  let carreira: Carreira
  beforeAll(() => { carreira = temporada(7) }, 30000)

  it('cada Divisao fecha com 20 clubes, 38 partidas cada, e totais consistentes', () => {
    for (const divisao of DIVISOES) {
      const tabela = classificacao(carreira, divisao)
      expect(tabela).toHaveLength(20)
      for (const l of tabela) {
        expect(l.j).toBe(38)
        expect(l.v + l.e + l.d).toBe(38)
        expect(l.p).toBe(3 * l.v + l.e)
        expect(l.sg).toBe(l.gp - l.gc)
      }
      expect(tabela.reduce((s, l) => s + l.gp, 0)).toBe(tabela.reduce((s, l) => s + l.gc, 0))
      expect(tabela.reduce((s, l) => s + l.v, 0)).toBe(tabela.reduce((s, l) => s + l.d, 0))
      for (let i = 1; i < 20; i++) expect(tabela[i - 1].p).toBeGreaterThanOrEqual(tabela[i].p)
    }
  })

  it('clubes de Porte maior fazem mais pontos em media na Serie A', () => {
    const tabela = classificacao(carreira, 'A')
    const media = (porte: number) => {
      const linhas = tabela.filter((l) => carreira.clubes.find((c) => c.id === l.clubeId)!.porte === porte)
      return linhas.reduce((s, l) => s + l.p, 0) / linhas.length
    }
    expect(media(5)).toBeGreaterThan(media(4))
    expect(media(4)).toBeGreaterThan(media(3))
  })

  it('artilheiros ordenados por gols, da propria Divisao', () => {
    for (const divisao of DIVISOES) {
      const lista = artilheiros(carreira, divisao)
      expect(lista).toHaveLength(10)
      const ids = new Set(carreira.clubes.filter((c) => c.divisao === divisao).map((c) => c.id))
      for (const j of lista) expect(j.origens.every((o) => ids.has(o.clubeId))).toBe(true)
      for (let i = 1; i < lista.length; i++) expect(lista[i - 1].gols).toBeGreaterThanOrEqual(lista[i].gols)
    }
  })
})
