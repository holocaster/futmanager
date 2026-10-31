import { describe, expect, it } from 'vitest'
import { novaCarreira } from './carreira'
import { elencoDe } from './elenco'
import { escalarAutomatico, aplicarEscalacaoAutomatica, FORMACOES, mudarFormacao, mudarPostura, setoresDaFormacao, trocarJogadores, validarEscalacao } from './tatica'
import { iniciarRodada, mudarFormacaoNaPartida, partidaDoTecnico, simularRodada } from './rodada'
import { criarLado, criarPartida, mudarFormacaoDoLado, removerDoCampo, substituirNoLado } from './partida'
import type { Carreira, Formacao, Posicao } from './tipos'

const FORMACOES_LISTA = Object.keys(FORMACOES) as Formacao[]
const contar = (carreira: Carreira, ids: string[]) => {
  const por = { G: 0, D: 0, M: 0, A: 0 }
  for (const id of ids) por[carreira.jogadores[id].posicao]++
  return por
}

describe('formacoes', () => {
  it('as 7 Formacoes somam 11 com 1 goleiro', () => {
    expect(FORMACOES_LISTA).toHaveLength(7)
    for (const f of FORMACOES_LISTA) {
      expect(setoresDaFormacao(f)).toHaveLength(11)
      expect(FORMACOES[f].G).toBe(1)
    }
  })
})

describe('escalarAutomatico', () => {
  const carreira = novaCarreira(11, 'flamengo')
  const elenco = elencoDe(carreira, 'flamengo')

  it('respeita a Formacao, escolhe os mais fortes de cada posicao e monta banco de 7 com goleiro', () => {
    for (const f of FORMACOES_LISTA) {
      const { titulares, reservas } = escalarAutomatico(elenco, f)
      expect(contar(carreira, titulares)).toEqual(FORMACOES[f])
      expect(titulares.map((id) => carreira.jogadores[id].posicao)).toEqual(setoresDaFormacao(f))
      expect(reservas).toHaveLength(7)
      expect(new Set([...titulares, ...reservas]).size).toBe(18)
      expect(reservas.some((id) => carreira.jogadores[id].posicao === 'G')).toBe(true)
      for (const p of ['G', 'D', 'M', 'A'] as Posicao[]) {
        const menorTitular = Math.min(...titulares.map((id) => carreira.jogadores[id]).filter((j) => j.posicao === p).map((j) => j.forca))
        const melhorReserva = Math.max(0, ...reservas.map((id) => carreira.jogadores[id]).filter((j) => j.posicao === p).map((j) => j.forca))
        expect(menorTitular).toBeGreaterThanOrEqual(melhorReserva)
      }
    }
  })

  it('exclui lesionados e suspensos', () => {
    const melhor = elenco.filter((j) => j.posicao === 'A').sort((a, b) => b.forca - a.forca)
    melhor[0].lesao = 2
    melhor[1].suspensao = 1
    const { titulares, reservas } = escalarAutomatico(elenco, '4-4-2')
    for (const j of melhor.slice(0, 2)) {
      expect(titulares).not.toContain(j.id)
      expect(reservas).not.toContain(j.id)
    }
    melhor[0].lesao = 0
    melhor[1].suspensao = 0
  })

  it('sem Jogador da posicao, usa o de posicao mais proxima', () => {
    const atacantes = elenco.filter((j) => j.posicao === 'A')
    atacantes.forEach((j) => (j.lesao = 3))
    const { titulares } = escalarAutomatico(elenco, '4-3-3')
    expect(titulares).toHaveLength(11)
    const [, ...linha] = titulares.map((id) => carreira.jogadores[id])
    expect(linha.slice(7).every((j) => j.posicao === 'M')).toBe(true)
    atacantes.forEach((j) => (j.lesao = 0))
  })
})

describe('validarEscalacao', () => {
  it('a Escalacao inicial da Carreira e valida', () => {
    const carreira = novaCarreira(1, 'santos')
    expect(carreira.escalacao.titulares).toHaveLength(11)
    expect(validarEscalacao(carreira, carreira.escalacao)).toEqual([])
  })

  it('recusa titulares a menos, sem goleiro, repetidos, banco grande e Jogador de outro Clube', () => {
    const carreira = novaCarreira(1, 'santos')
    const base = carreira.escalacao
    const erros = (parcial: Partial<typeof base>) => validarEscalacao(carreira, { ...base, ...parcial }).join(' ')
    expect(erros({ titulares: base.titulares.slice(0, 10) })).toMatch(/11 titulares/)
    expect(erros({ titulares: [...base.titulares.slice(1), base.reservas[0]] })).toMatch(/goleiro/)
    const doisGoleiros = elencoDe(carreira, 'santos').filter((j) => j.posicao === 'G').map((j) => j.id)
    expect(erros({ titulares: [...base.titulares.slice(0, 10), ...doisGoleiros.filter((id) => !base.titulares.includes(id)).slice(0, 1)] })).toMatch(/goleiro/)
    expect(erros({ titulares: [...base.titulares.slice(0, 10), base.titulares[3]] })).toMatch(/repetido/)
    const extras = elencoDe(carreira, 'santos').map((j) => j.id).filter((id) => !base.titulares.includes(id))
    expect(erros({ reservas: extras.slice(0, 8) })).toMatch(/no máximo 7/)
    const outro = elencoDe(carreira, 'palmeiras')[0].id
    expect(erros({ reservas: [outro] })).toMatch(/Elenco/)
  })

  it('recusa lesionados e suspensos, nos titulares e no banco', () => {
    const carreira = novaCarreira(1, 'santos')
    const { titulares, reservas } = carreira.escalacao
    carreira.jogadores[titulares[3]].lesao = 2
    carreira.jogadores[reservas[0]].suspensao = 1
    const erros = validarEscalacao(carreira, carreira.escalacao)
    expect(erros).toContain(`${carreira.jogadores[titulares[3]].nome} está lesionado.`)
    expect(erros).toContain(`${carreira.jogadores[reservas[0]].nome} está suspenso.`)
    aplicarEscalacaoAutomatica(carreira)
    expect(validarEscalacao(carreira, carreira.escalacao)).toEqual([])
    expect(carreira.escalacao.titulares).not.toContain(titulares[3])
    expect(carreira.escalacao.reservas).not.toContain(reservas[0])
  })

  it('a escalacao automatica prefere o Jogador descansado ao cansado quando a forca e igual', () => {
    const carreira = novaCarreira(1, 'santos')
    const elenco = elencoDe(carreira, 'santos')
    const goleiros = elenco.filter((j) => j.posicao === 'G')
    goleiros.forEach((j) => (j.forca = 70))
    goleiros[0].condicao = 20
    const { titulares } = escalarAutomatico(elenco, '4-4-2')
    expect(titulares[0]).not.toBe(goleiros[0].id)
  })

  it('a Rodada nao comeca com Escalacao invalida, mas comeca depois de corrigida', () => {
    const carreira = novaCarreira(1, 'santos')
    carreira.escalacao.titulares = carreira.escalacao.titulares.slice(0, 10)
    expect(() => simularRodada(carreira)).toThrow(/11 titulares/)
    expect(carreira.proximaData).toBe(0)
    aplicarEscalacaoAutomatica(carreira)
    simularRodada(carreira)
    expect(carreira.proximaData).toBe(1)
  })
})

describe('acoes do Tecnico', () => {
  it('mudar Formacao mantem os 11 Jogadores e a Escalacao valida', () => {
    const carreira = novaCarreira(3, 'santos')
    const antes = [...carreira.escalacao.titulares].sort()
    for (const f of FORMACOES_LISTA) {
      mudarFormacao(carreira, f)
      expect(carreira.escalacao.formacao).toBe(f)
      expect([...carreira.escalacao.titulares].sort()).toEqual(antes)
      expect(validarEscalacao(carreira, carreira.escalacao)).toEqual([])
    }
  })

  it('a Escalacao e a Postura persistem entre datas', () => {
    const carreira = novaCarreira(3, 'santos')
    mudarFormacao(carreira, '3-5-2')
    mudarPostura(carreira, 'ofensiva')
    aplicarEscalacaoAutomatica(carreira)
    const antes = JSON.stringify(carreira.escalacao)
    simularRodada(carreira)
    simularRodada(carreira)
    expect(JSON.stringify(carreira.escalacao)).toBe(antes)
  })

  it('trocar Jogadores permuta titular com reserva, titular com titular e titular com fora do banco', () => {
    const carreira = novaCarreira(3, 'santos')
    const e = carreira.escalacao
    const [t0, t1] = e.titulares
    const r0 = e.reservas[0]
    trocarJogadores(carreira, t1, r0)
    expect(e.titulares[1]).toBe(r0)
    expect(e.reservas[0]).toBe(t1)
    trocarJogadores(carreira, e.titulares[5], e.titulares[6])
    const fora = elencoDe(carreira, 'santos').find((j) => !e.titulares.includes(j.id) && !e.reservas.includes(j.id))!
    trocarJogadores(carreira, e.reservas[1], fora.id)
    expect(e.reservas[1]).toBe(fora.id)
    expect(e.titulares[0]).toBe(t0)
    expect(new Set([...e.titulares, ...e.reservas]).size).toBe(18)
  })
})

describe('Elenco desfalcado', () => {
  it.each([
    ['4-4-2', [95, 90, 85, 80]],
    ['3-5-2', [95, 90, 85, 80, 75]],
    ['5-3-2', [95, 90, 85]],
  ] as const)('a automatica preserva os melhores M naturais com excedentes em %s (Tecnico e IA)', (formacao, naturais) => {
    const c = novaCarreira(4, 'santos')
    for (const clubeId of ['santos', 'palmeiras']) {
      const contagem = { G: 0, D: 0, M: 0, A: 0 }
      for (const j of elencoDe(c, clubeId)) {
        const indice = contagem[j.posicao]++
        j.lesao = indice < ({ G: 1, D: 2, M: 6, A: 1 })[j.posicao] ? 0 : 5
        j.condicao = 100
        j.moral = 70
        if (j.posicao === 'M' && indice < 6) j.forca = [95, 90, 85, 80, 75, 70][indice]
      }
    }
    mudarFormacao(c, formacao)
    aplicarEscalacaoAutomatica(c)
    const rodada = iniciarRodada(c)
    const humano = partidaDoTecnico(c, rodada)!
    const ladoHumano = humano.casaId === c.clubeId ? humano.casa : humano.fora
    const ia = rodada.partidas.find((p) => p.casaId === 'palmeiras' || p.foraId === 'palmeiras')!
    const ladoIA = ia.casaId === 'palmeiras' ? ia.casa : ia.fora
    expect(ladoHumano.titulares).toHaveLength(10)
    expect(ladoHumano.titulares.filter((_j, i) => ladoHumano.setores[i] === 'M').map((j) => j.forca)).toEqual(naturais)
    expect(ladoIA.titulares).toHaveLength(10)
    expect(ladoIA.titulares.filter((_j, i) => ladoIA.setores[i] === 'M').map((j) => j.forca)).toEqual([95, 90, 85, 80])
    const meias = c.escalacao.titulares.filter((id) => c.jogadores[id].posicao === 'M')
    trocarJogadores(c, meias[0], meias[meias.length - 1])
    const ordemManual = [...c.escalacao.titulares]
    const manual = partidaDoTecnico(c, iniciarRodada(c))!
    const ladoManual = manual.casaId === c.clubeId ? manual.casa : manual.fora
    expect(ladoManual.titulares.map((j) => j.id)).toEqual(ordemManual)
    expect(ladoManual.titulares.filter((_j, i) => ladoManual.setores[i] === 'M').map((j) => j.forca)).toEqual([70, ...naturais.slice(1)])
  })

  it('valida o goleiro pelo setor efetivo apos permuta curta e inicia a Rodada sem alterar a ordem manual', () => {
    const c = novaCarreira(4, 'santos')
    const contagem = { G: 0, D: 0, M: 0, A: 0 }
    for (const j of elencoDe(c, c.clubeId)) if (++contagem[j.posicao] > ({ G: 1, D: 2, M: 4, A: 2 })[j.posicao]) j.lesao = 5
    aplicarEscalacaoAutomatica(c)
    const [goleiro, defensor] = c.escalacao.titulares
    trocarJogadores(c, goleiro, defensor)
    const ordem = [...c.escalacao.titulares]
    expect(validarEscalacao(c, c.escalacao)).toEqual([])
    const rodada = iniciarRodada(c)
    const p = partidaDoTecnico(c, rodada)!
    const lado = p.casaId === c.clubeId ? p.casa : p.fora
    expect(lado.titulares.map((j) => j.id)).toEqual(ordem)
    expect(lado.setores).toEqual(['D', 'G', 'D', 'M', 'M', 'M', 'M', 'A', 'A'])
    expect(c.escalacao.titulares).toEqual(ordem)
    const completa = novaCarreira(4, 'santos')
    trocarJogadores(completa, completa.escalacao.titulares[0], completa.escalacao.titulares[1])
    expect(validarEscalacao(completa, completa.escalacao)).toContain('Os titulares precisam de um goleiro no gol.')
    expect(() => iniciarRodada(completa)).toThrow(/goleiro no gol/)
    completa.escalacao.titulares[1] = 'nao-existe'
    expect(validarEscalacao(completa, completa.escalacao).join(' ')).toMatch(/não é do Elenco/)
  })

  it('preserva setores naturais com falta de D antes e durante a Partida, para Tecnico e IA', () => {
    const c = novaCarreira(4, 'santos')
    for (const clubeId of ['santos', 'palmeiras']) {
      const contagem = { G: 0, D: 0, M: 0, A: 0 }
      for (const j of elencoDe(c, clubeId)) if (++contagem[j.posicao] > ({ G: 1, D: 2, M: 4, A: 2 })[j.posicao]) j.lesao = 5
    }
    aplicarEscalacaoAutomatica(c)
    const rodada = iniciarRodada(c)
    const p = partidaDoTecnico(c, rodada)!
    const nome = p.casaId === c.clubeId ? 'casa' : 'fora'
    const ia = rodada.partidas.find((p) => p.casaId === 'palmeiras' || p.foraId === 'palmeiras')!
    const iaNome = ia.casaId === 'palmeiras' ? 'casa' : 'fora'
    for (const lado of [p[nome], ia[iaNome]]) {
      expect(lado.titulares).toHaveLength(9)
      expect(lado.setores).toEqual(lado.titulares.map((j) => j.posicao))
    }
    rodada.minuto = 45
    mudarFormacaoNaPartida(c, rodada, '3-5-2')
    mudarFormacaoDoLado(ia, iaNome, '3-5-2')
    for (const lado of [p[nome], ia[iaNome]]) expect(lado.setores).toEqual(lado.titulares.map((j) => j.posicao))
  })

  it('somente excedentes improvisam; ausencia de G nao desloca os demais; permutas completas permanecem', () => {
    const c = novaCarreira(4, 'santos')
    const elenco = elencoDe(c, c.clubeId)
    const curtos = ['D', 'D', 'M', 'M', 'M', 'M', 'A', 'A'].map((posicao) => {
      const j = elenco.find((j) => j.posicao === posicao)!
      elenco.splice(elenco.indexOf(j), 1)
      return j
    })
    const lado = criarLado(curtos, '4-4-2', 'equilibrada')
    expect(lado.setores).toEqual(curtos.map((j) => j.posicao))
    const partida = criarPartida(lado, criarLado([], '4-4-2', 'equilibrada'))
    mudarFormacaoDoLado(partida, 'casa', '5-4-1')
    expect(lado.setores).toEqual(['D', 'D', 'M', 'M', 'M', 'M', 'A', 'D'])
    expect(lado.titulares).toHaveLength(8)
    const completo = c.escalacao.titulares.map((id) => c.jogadores[id])
    ;[completo[1], completo[9]] = [completo[9], completo[1]]
    expect(criarLado(completo, '4-4-2', 'equilibrada').setores).toEqual(setoresDaFormacao('4-4-2'))
    const expulso = lado.titulares[0]
    removerDoCampo(lado, expulso)
    partida.cartoes.push({ jogadorId: expulso.id, tipo: 'vermelho' })
    lado.banco = [elenco[0]]
    mudarFormacaoDoLado(partida, 'casa', '3-4-3')
    expect(lado.titulares).toHaveLength(7)
    expect(substituirNoLado(partida, 'casa', 45, expulso.id, elenco[0].id)).toHaveProperty('erro')
    expect(substituirNoLado(partida, 'casa', 45, null, elenco[0].id)).toHaveProperty('erro')
  })

  it('a escalacao automatica nao poe 2o goleiro na linha enquanto houver Jogador de linha', () => {
    const carreira = novaCarreira(3, 'santos')
    const elenco = elencoDe(carreira, 'santos')
    for (const j of elenco.filter((x) => x.posicao === 'G')) j.forca = 95
    for (const j of elenco.filter((x) => x.posicao === 'D').slice(2)) j.lesao = 4
    const { titulares } = escalarAutomatico(elenco, '4-4-2')
    expect(titulares).toHaveLength(11)
    expect(titulares.filter((id) => carreira.jogadores[id].posicao === 'G')).toHaveLength(1)
    aplicarEscalacaoAutomatica(carreira)
    expect(validarEscalacao(carreira, carreira.escalacao)).toEqual([])
  })

  it('com menos de 11 elegiveis o Clube joga desfalcado e a Rodada acontece (Tecnico e IA)', () => {
    const carreira = novaCarreira(4, 'santos')
    for (const clubeId of ['santos', 'palmeiras']) {
      elencoDe(carreira, clubeId).forEach((j, i) => {
        if (i % 3 !== 0) j.lesao = 5
      })
    }
    const elegiveis = elencoDe(carreira, 'santos').filter((j) => j.lesao === 0).length
    expect(elegiveis).toBeLessThan(11)
    aplicarEscalacaoAutomatica(carreira)
    expect(carreira.escalacao.titulares).toHaveLength(elegiveis)
    expect(validarEscalacao(carreira, carreira.escalacao)).toEqual([])
    simularRodada(carreira)
    expect(carreira.proximaData).toBe(1)
    expect(carreira.calendario[0].partidas.every((p) => p.resultado !== null)).toBe(true)
  })
})
