import { describe, expect, it } from 'vitest'
import { gerarJogador } from './jogadores'
import {
  agirIA,
  avancarMinutoPartida,
  criarLado,
  criarPartida,
  forcasDoLado,
  mudarFormacaoDoLado,
  mudarPosturaDoLado,
  recalcularRazoes,
  removerDoCampo,
  simularPartida,
  substituirNoLado,
  type LadoPartida,
} from './partida'
import { criarRng } from './rng'
import { FORMACOES, setoresDaFormacao } from './tatica'
import type { Formacao, Jogador, Posicao, Postura } from './tipos'

const POSICOES_442: Posicao[] = ['G', 'D', 'D', 'D', 'D', 'M', 'M', 'M', 'M', 'A', 'A']

function titulares(forca: number, prefixo: string): Jogador[] {
  const rng = criarRng(1)
  return POSICOES_442.map((p, i) => ({ ...gerarJogador(rng, `${prefixo}${i}`, prefixo, p, 60, 2026), forca }))
}

const lado = (js: Jogador[], formacao: Formacao = '4-4-2', postura: Postura = 'equilibrada'): LadoPartida => criarLado(js, formacao, postura)

function serie(casa: LadoPartida, fora: LadoPartida, n: number, seed = 2026) {
  const rng = criarRng(seed)
  let gols = 0
  let golsCasa = 0
  let golsFora = 0
  let vitoriasCasa = 0
  let empates = 0
  let derrotasCasa = 0
  for (let i = 0; i < n; i++) {
    const r = simularPartida(rng, casa, fora)
    gols += r.golsCasa + r.golsFora
    golsCasa += r.golsCasa
    golsFora += r.golsFora
    if (r.golsCasa > r.golsFora) vitoriasCasa++
    else if (r.golsCasa === r.golsFora) empates++
    else derrotasCasa++
  }
  return { golsPorPartida: gols / n, golsCasa: golsCasa / n, golsFora: golsFora / n, vitoriasCasa: vitoriasCasa / n, empates: empates / n, derrotasCasa: derrotasCasa / n }
}

const N = 20000
const clonar = (js: Jogador[]) => js.map((j) => ({ ...j }))

describe('simularPartida', () => {
  it('e deterministica por seed', () => {
    const a = simularPartida(criarRng(9), lado(titulares(60, 'c')), lado(titulares(60, 'f')))
    const b = simularPartida(criarRng(9), lado(titulares(60, 'c')), lado(titulares(60, 'f')))
    expect(a).toEqual(b)
  })

  it('entre iguais: 2,2 a 2,9 gols, mandante vence 40-52%, empate 22-32%', () => {
    for (const forca of [52, 60, 75]) {
      const r = serie(lado(titulares(forca, 'c')), lado(titulares(forca, 'f')), N)
      expect(r.golsPorPartida).toBeGreaterThanOrEqual(2.2)
      expect(r.golsPorPartida).toBeLessThanOrEqual(2.9)
      expect(r.vitoriasCasa).toBeGreaterThanOrEqual(0.4)
      expect(r.vitoriasCasa).toBeLessThanOrEqual(0.52)
      expect(r.empates).toBeGreaterThanOrEqual(0.22)
      expect(r.empates).toBeLessThanOrEqual(0.32)
    }
  }, 30000)

  it('+10 de forca vence pelo menos 60% e perde no maximo 20%, em casa e fora', () => {
    for (const base of [52, 60, 75]) {
      const emCasa = serie(lado(titulares(base + 10, 'c')), lado(titulares(base, 'f')), N)
      expect(emCasa.vitoriasCasa).toBeGreaterThanOrEqual(0.6)
      expect(emCasa.derrotasCasa).toBeLessThanOrEqual(0.2)
      const fora = serie(lado(titulares(base, 'c')), lado(titulares(base + 10, 'f')), N)
      expect(fora.derrotasCasa).toBeGreaterThanOrEqual(0.6)
      expect(fora.vitoriasCasa).toBeLessThanOrEqual(0.2)
    }
  }, 30000)

  it('autores sao titulares do lado que marcou, com atacantes marcando mais que meias, defensores e goleiros', () => {
    const casa = titulares(60, 'c')
    const fora = titulares(60, 'f')
    const posicaoDe = new Map([...casa, ...fora].map((j) => [j.id, j.posicao]))
    const rng = criarRng(77)
    const porPosicao = { G: 0, D: 0, M: 0, A: 0 }
    let total = 0
    for (let i = 0; i < 4000; i++) {
      const r = simularPartida(rng, lado(casa), lado(fora))
      expect(r.autores).toHaveLength(r.golsCasa + r.golsFora)
      for (const id of r.autores) {
        porPosicao[posicaoDe.get(id)!]++
        total++
      }
    }
    expect(porPosicao.A).toBeGreaterThan(porPosicao.M)
    expect(porPosicao.M).toBeGreaterThan(porPosicao.D)
    expect(porPosicao.D).toBeGreaterThan(porPosicao.G)
    expect(porPosicao.G / total).toBeLessThan(0.02)
  }, 30000)

  it('Jogador mais forte do mesmo setor marca mais', () => {
    const casa = titulares(60, 'c')
    casa[9].forca = 90
    const rng = criarRng(5)
    const porId: Record<string, number> = {}
    for (let i = 0; i < 4000; i++) for (const id of simularPartida(rng, lado(casa), lado(titulares(60, 'f'))).autores) porId[id] = (porId[id] ?? 0) + 1
    expect(porId['c9']).toBeGreaterThan(porId['c10'])
  }, 30000)
})

describe('tatica na simulacao', () => {
  const doisLados = (formacao: Formacao, postura: Postura, forca: number, prefixo: string) =>
    lado(
      setoresDaFormacao(formacao).map((p, i) => ({ ...gerarJogador(criarRng(1), `${prefixo}${i}`, prefixo, p, 60, 2026), forca })),
      formacao,
      postura,
    )

  it('ofensiva x ofensiva tem mais gols que equilibrada x equilibrada, e defensiva x defensiva menos, em qualquer forca', () => {
    for (const forca of [52, 60, 75]) {
      const gols = (p: Postura) => serie(doisLados('4-4-2', p, forca, 'c'), doisLados('4-4-2', p, forca, 'f'), N / 2).golsPorPartida
      const base = gols('equilibrada')
      expect(gols('ofensiva')).toBeGreaterThan(base * 1.05)
      expect(gols('defensiva')).toBeLessThan(base * 0.95)
    }
  }, 30000)

  it('Formacao mais ofensiva marca mais e sofre mais', () => {
    for (const forca of [52, 60, 75]) {
      const oponente = doisLados('4-4-2', 'equilibrada', forca, 'f')
      const ofensiva = serie(doisLados('3-4-3', 'equilibrada', forca, 'c'), oponente, N / 2)
      const defensiva = serie(doisLados('5-4-1', 'equilibrada', forca, 'c'), oponente, N / 2)
      expect(ofensiva.golsCasa).toBeGreaterThan(defensiva.golsCasa * 1.1)
      expect(ofensiva.golsFora).toBeGreaterThan(defensiva.golsFora * 1.1)
    }
  }, 30000)

  it('o numero de Jogadores por setor pesa: mais atacantes elevam o ataque e baixam a defesa', () => {
    const f = (formacao: Formacao) => forcasDoLado(doisLados(formacao, 'equilibrada', 60, 'c'))
    expect(f('3-4-3').ataque).toBeGreaterThan(f('4-4-2').ataque)
    expect(f('4-4-2').ataque).toBeGreaterThan(f('5-4-1').ataque)
    expect(f('3-4-3').defesa).toBeLessThan(f('4-4-2').defesa)
    expect(f('4-4-2').defesa).toBeLessThan(f('5-4-1').defesa)
  })

  it('Jogador fora de posicao reduz a forca do setor', () => {
    const natural = titulares(60, 'c')
    const improvisado = natural.map((j, i) => (i === 9 ? { ...j, posicao: 'D' as Posicao } : j))
    expect(forcasDoLado(lado(improvisado)).ataque).toBeLessThan(forcasDoLado(lado(natural)).ataque)
    const meioNaDefesa = natural.map((j, i) => (i === 1 ? { ...j, posicao: 'M' as Posicao } : j))
    expect(forcasDoLado(lado(meioNaDefesa)).defesa).toBeLessThan(forcasDoLado(lado(natural)).defesa)
  })

  it('as posturas multiplicam ataque e defesa', () => {
    const times = titulares(60, 'c')
    const p = (postura: Postura) => forcasDoLado(lado(times, '4-4-2', postura))
    expect(p('ofensiva').ataque).toBeGreaterThan(p('equilibrada').ataque)
    expect(p('ofensiva').defesa).toBeLessThan(p('equilibrada').defesa)
    expect(p('defensiva').ataque).toBeLessThan(p('equilibrada').ataque)
    expect(p('defensiva').defesa).toBeGreaterThan(p('equilibrada').defesa)
  })
})

describe('cartoes, lesoes e cansaco', () => {
  it('calibracao: 3 a 5 amarelos por Partida, vermelho em 5% a 15% das Partidas, lesao em 10% a 30%', () => {
    const rng = criarRng(31)
    const casa = titulares(60, 'c')
    const fora = titulares(60, 'f')
    let amarelos = 0
    let comVermelho = 0
    let comLesao = 0
    for (let i = 0; i < N; i++) {
      const r = simularPartida(rng, lado(casa), lado(fora))
      amarelos += r.amarelos
      if (r.vermelhos > 0) comVermelho++
      if (r.lesoes > 0) comLesao++
    }
    expect(amarelos / N).toBeGreaterThanOrEqual(3)
    expect(amarelos / N).toBeLessThanOrEqual(5)
    expect(comVermelho / N).toBeGreaterThanOrEqual(0.05)
    expect(comVermelho / N).toBeLessThanOrEqual(0.15)
    expect(comLesao / N).toBeGreaterThanOrEqual(0.1)
    expect(comLesao / N).toBeLessThanOrEqual(0.3)
  }, 30000)

  it('simularPartida nao altera os Jogadores recebidos', () => {
    const casa = titulares(60, 'c')
    const antes = JSON.stringify(casa)
    simularPartida(criarRng(3), lado(casa), lado(titulares(60, 'f')))
    expect(JSON.stringify(casa)).toBe(antes)
  })

  it('expulso e lesionado saem de campo e o time fica com um a menos', () => {
    const rng = criarRng(8)
    let saiu = 0
    for (let i = 0; i < 400; i++) {
      const partida = criarPartida(lado(clonar(titulares(60, 'c'))), lado(clonar(titulares(60, 'f'))))
      for (let m = 1; m <= 90; m++) avancarMinutoPartida(rng, partida, m)
      const fora = partida.cartoes.filter((c) => c.tipo === 'vermelho').length + partida.lesoes.length
      const emCampo = (l: LadoPartida) => l.titulares.length
      expect(emCampo(partida.casa) + emCampo(partida.fora)).toBe(22 - fora)
      expect(partida.casa.titulares).toHaveLength(partida.casa.setores.length)
      saiu += fora
    }
    expect(saiu).toBeGreaterThan(0)
  })

  it('segundo amarelo vira expulsao', () => {
    const rng = criarRng(12)
    let vistos = 0
    for (let i = 0; i < 3000; i++) {
      const partida = criarPartida(lado(clonar(titulares(60, 'c'))), lado(clonar(titulares(60, 'f'))))
      for (let m = 1; m <= 90; m++) avancarMinutoPartida(rng, partida, m)
      const amarelosPor: Record<string, number> = {}
      for (const c of partida.cartoes) if (c.tipo === 'amarelo') amarelosPor[c.jogadorId] = (amarelosPor[c.jogadorId] ?? 0) + 1
      for (const [id, n] of Object.entries(amarelosPor)) {
        expect(n).toBeLessThanOrEqual(2)
        if (n === 2) {
          vistos++
          expect(partida.cartoes.filter((c) => c.jogadorId === id && c.tipo === 'vermelho')).toHaveLength(1)
        }
      }
    }
    expect(vistos).toBeGreaterThan(0)
  }, 30000)

  it('time cansado rende menos que o mesmo time descansado', () => {
    const descansado = titulares(60, 'c')
    const cansado = titulares(60, 'c').map((j) => ({ ...j, condicao: 40 }))
    expect(forcasDoLado(lado(cansado)).ataque).toBeLessThan(forcasDoLado(lado(descansado)).ataque)
    expect(forcasDoLado(lado(cansado)).defesa).toBeLessThan(forcasDoLado(lado(descansado)).defesa)
    const r = serie(lado(cansado), lado(titulares(60, 'f')), N)
    const base = serie(lado(descansado), lado(titulares(60, 'f')), N)
    expect(r.golsCasa).toBeLessThan(base.golsCasa)
    expect(r.vitoriasCasa).toBeLessThan(base.vitoriasCasa)
  }, 30000)

  it('moral alta rende mais que moral baixa', () => {
    const alta = titulares(60, 'c').map((j) => ({ ...j, moral: 100 }))
    const baixa = titulares(60, 'c').map((j) => ({ ...j, moral: 20 }))
    expect(forcasDoLado(lado(alta)).ataque).toBeGreaterThan(forcasDoLado(lado(baixa)).ataque)
  })

  it('a condicao cai por minuto jogado, mais na Postura ofensiva', () => {
    const perda = (postura: Postura) => {
      const js = titulares(60, 'c')
      const partida = criarPartida(lado(js, '4-4-2', postura), lado(titulares(60, 'f')))
      const rng = criarRng(4)
      for (let m = 1; m <= 90; m++) avancarMinutoPartida(rng, partida, m)
      return 100 - Math.min(...partida.casa.titulares.map((j) => j.condicao))
    }
    expect(perda('equilibrada')).toBeGreaterThan(5)
    expect(perda('ofensiva')).toBeGreaterThan(perda('equilibrada'))
    expect(perda('defensiva')).toBeLessThan(perda('equilibrada'))
  })
})

describe('equilibrio das Posturas e Formacoes', () => {
  const doisLados = (formacao: Formacao, postura: Postura, forca: number, prefixo: string) =>
    lado(
      setoresDaFormacao(formacao).map((p, i) => ({ ...gerarJogador(criarRng(1), `${prefixo}${i}`, prefixo, p, 60, 2026), forca })),
      formacao,
      postura,
    )
  const pontos = (casa: LadoPartida, fora: LadoPartida, n = N) => {
    const rng = criarRng(7)
    let total = 0
    for (let i = 0; i < n; i++) {
      const r = simularPartida(rng, casa, fora)
      total += r.golsCasa > r.golsFora ? 3 : r.golsCasa === r.golsFora ? 1 : 0
    }
    return total / n
  }
  const restoDoJogo = (postura: Postura, golsCasa: number, golsFora: number) => {
    const rng = criarRng(9)
    let total = 0
    for (let i = 0; i < N; i++) {
      const partida = criarPartida(lado(clonar60('c'), '4-4-2', postura), lado(clonar60('f')))
      partida.golsCasa = golsCasa
      partida.golsFora = golsFora
      for (let m = 71; m <= 90; m++) avancarMinutoPartida(rng, partida, m)
      total += partida.golsCasa > partida.golsFora ? 3 : partida.golsCasa === partida.golsFora ? 1 : 0
    }
    return total / N
  }
  const clonar60 = (prefixo: string) => titulares(60, prefixo).map((j) => ({ ...j }))

  it('ofensiva compensa para o favorito e quando se esta atras; defensiva compensa para o azarao e quando se esta a frente', () => {
    const fav = (p: Postura) => pontos(doisLados('4-4-2', p, 70, 'c'), doisLados('4-4-2', 'equilibrada', 60, 'f'))
    const azarao = (p: Postura) => pontos(doisLados('4-4-2', p, 60, 'c'), doisLados('4-4-2', 'equilibrada', 80, 'f'))
    expect(fav('ofensiva')).toBeGreaterThan(fav('equilibrada'))
    expect(azarao('defensiva')).toBeGreaterThan(azarao('equilibrada'))
    expect(restoDoJogo('ofensiva', 0, 1)).toBeGreaterThan(restoDoJogo('defensiva', 0, 1))
    expect(restoDoJogo('defensiva', 1, 0)).toBeGreaterThan(restoDoJogo('ofensiva', 1, 0))
  }, 60000)

  it('3-4-3 compensa para o favorito e 5-4-1 para o azarao, contra um 4-4-2', () => {
    const fav = (f: Formacao) => pontos(doisLados(f, 'equilibrada', 70, 'c'), doisLados('4-4-2', 'equilibrada', 60, 'f'))
    const azarao = (f: Formacao) => pontos(doisLados(f, 'equilibrada', 60, 'c'), doisLados('4-4-2', 'equilibrada', 80, 'f'))
    expect(fav('3-4-3')).toBeGreaterThan(fav('4-4-2'))
    expect(azarao('5-4-1')).toBeGreaterThan(azarao('4-4-2'))
  }, 60000)

  it('a Postura ofensiva cobra cansaco: depois de varias datas seguidas rende menos que a equilibrada', () => {
    const aposDatas = (postura: Postura, datas: number) => {
      const js = titulares(60, 'c')
      const rng = criarRng(5)
      for (let d = 0; d < datas; d++) {
        const partida = criarPartida(lado(js, '4-4-2', postura), lado(clonar60('f')))
        for (let m = 1; m <= 90; m++) avancarMinutoPartida(rng, partida, m)
        for (const j of js) j.condicao = Math.min(100, j.condicao + 15)
      }
      return js
    }
    const ofensivaCansada = aposDatas('ofensiva', 4)
    const equilibradaCansada = aposDatas('equilibrada', 4)
    expect(Math.min(...ofensivaCansada.map((j) => j.condicao))).toBeLessThan(Math.min(...equilibradaCansada.map((j) => j.condicao)) - 15)
    const adversario = doisLados('4-4-2', 'equilibrada', 60, 'f')
    expect(pontos(lado(ofensivaCansada, '4-4-2', 'ofensiva'), adversario)).toBeLessThan(pontos(lado(equilibradaCansada, '4-4-2', 'equilibrada'), adversario))
  }, 60000)
})

describe('Substituicoes e mudancas na Partida', () => {
  const POSICOES_BANCO: Posicao[] = ['G', 'D', 'D', 'M', 'M', 'A', 'A']
  const banco = (prefixo: string) => POSICOES_BANCO.map((p, i) => gerarJogador(criarRng(2), `${prefixo}b${i}`, prefixo, p, 60, 2026))
  const novaPartida = () => criarPartida(criarLado(titulares(60, 'c'), '4-4-2', 'equilibrada', banco('c')), criarLado(titulares(60, 'f'), '4-4-2', 'equilibrada', banco('f')))
  const sub = (p: ReturnType<typeof novaPartida>, minuto: number, sai: string | null, entra: string) => substituirNoLado(p, 'casa', minuto, sai, entra)
  const ok = (r: ReturnType<typeof sub>) => expect('troca' in r).toBe(true)
  const erro = (r: ReturnType<typeof sub>) => ('erro' in r ? r.erro : '')

  it('ate 5 Substituicoes, mesmo todas na mesma parada', () => {
    const p = novaPartida()
    for (let i = 0; i < 5; i++) ok(sub(p, 50, `c${i + 1}`, `cb${i + 1}`))
    expect(p.casa.substituicoes).toBe(5)
    expect(p.casa.paradas).toBe(1)
    expect(erro(sub(p, 50, 'c6', 'cb0'))).toMatch(/Limite de 5/)
    expect(p.casa.substituicoes).toBe(5)
  })

  it('ate 3 paradas; varias Substituicoes na mesma pausa contam uma parada', () => {
    const p = novaPartida()
    ok(sub(p, 50, 'c1', 'cb1'))
    ok(sub(p, 50, 'c2', 'cb2'))
    expect(p.casa.paradas).toBe(1)
    ok(sub(p, 60, 'c3', 'cb3'))
    ok(sub(p, 70, 'c4', 'cb4'))
    expect(p.casa.paradas).toBe(3)
    const antes = JSON.stringify(p.casa)
    expect(erro(sub(p, 80, 'c5', 'cb5'))).toMatch(/Limite de 3 paradas/)
    expect(JSON.stringify(p.casa)).toBe(antes)
    ok(sub(p, 70, 'c5', 'cb5'))
  })

  it('a pausa do intervalo nao conta como parada', () => {
    const p = novaPartida()
    ok(sub(p, 45, 'c1', 'cb1'))
    ok(sub(p, 45, 'c2', 'cb2'))
    expect(p.casa.paradas).toBe(0)
    ok(sub(p, 50, 'c3', 'cb3'))
    ok(sub(p, 60, 'c4', 'cb4'))
    ok(sub(p, 70, 'c5', 'cb5'))
    expect(p.casa.paradas).toBe(3)
    expect(p.casa.substituicoes).toBe(5)
  })

  it('so entram reservas do banco, quem sai precisa estar em campo e o substituido nao volta', () => {
    const p = novaPartida()
    expect(erro(sub(p, 50, 'c1', 'c2'))).toMatch(/banco/)
    expect(erro(sub(p, 50, 'c1', 'inexistente'))).toMatch(/banco/)
    expect(erro(sub(p, 50, 'cb1', 'cb2'))).toMatch(/em campo/)
    ok(sub(p, 50, 'c1', 'cb1'))
    expect(erro(sub(p, 60, 'cb1', 'c1'))).toMatch(/não volta/)
    expect(p.casa.titulares.map((j) => j.id)).toContain('cb1')
    expect(p.casa.titulares.map((j) => j.id)).not.toContain('c1')
  })

  it('o Jogador que entra assume o setor de quem saiu', () => {
    const p = novaPartida()
    ok(sub(p, 50, 'c9', 'cb1'))
    expect(p.casa.setores[p.casa.titulares.findIndex((j) => j.id === 'cb1')]).toBe('A')
  })

  it('expulso nao pode ser substituido nem reposto', () => {
    const p = novaPartida()
    const expulso = p.casa.titulares[3]
    removerDoCampo(p.casa, expulso)
    p.cartoes.push({ jogadorId: expulso.id, tipo: 'vermelho' })
    expect(erro(sub(p, 50, expulso.id, 'cb1'))).toMatch(/expulso/)
    expect(erro(sub(p, 50, null, 'cb1'))).toMatch(/vaga/)
    expect(p.casa.titulares).toHaveLength(10)
  })

  it('lesionado deixa vaga que o banco pode preencher sem escolher quem sai', () => {
    const p = novaPartida()
    const lesionado = p.casa.titulares[2]
    p.casa.vagas.push(removerDoCampo(p.casa, lesionado))
    ok(sub(p, 30, null, 'cb1'))
    expect(p.casa.titulares).toHaveLength(11)
    expect(p.casa.vagas).toHaveLength(0)
    expect(p.casa.setores.filter((s) => s === 'D')).toHaveLength(4)
  })

  it.each(['casa', 'fora'] as const)('vagas acompanham mudancas repetidas de Formacao e a reposicao do %s', (nome) => {
    const p = novaPartida()
    const l = p[nome]
    l.vagas.push(removerDoCampo(l, l.titulares[4]))
    for (const formacao of ['3-4-3', '5-3-2', '3-4-3'] as const) {
      mudarFormacaoDoLado(p, nome, formacao)
      expect(l.titulares).toHaveLength(10)
      expect(l.vagas).toHaveLength(1)
      for (const setor of ['G', 'D', 'M', 'A'] as const) {
        expect([...l.setores, ...l.vagas].filter((s) => s === setor).length).toBe(setoresDaFormacao(formacao).filter((s) => s === setor).length)
      }
    }
    if (nome === 'fora') expect(agirIA(p, nome, 45)).toHaveLength(1)
    else expect(substituirNoLado(p, nome, 45, null, l.banco.find((j) => j.posicao === 'D')!.id)).toHaveProperty('troca')
    expect(l.titulares).toHaveLength(11)
    expect(l.vagas).toEqual([])
    expect(l.substituicoes).toBe(1)
    expect(l.paradas).toBe(0)
    expect([...l.setores].sort()).toEqual(setoresDaFormacao('3-4-3').sort())
    const razoes = [p.razaoCasa, p.razaoFora]
    recalcularRazoes(p)
    expect([p.razaoCasa, p.razaoFora]).toEqual(razoes)
  })

  it('reconcilia varias vagas sem repor expulsos nem inventar titulares', () => {
    const p = novaPartida()
    const l = p.casa
    removerDoCampo(l, l.titulares[1])
    l.vagas.push(removerDoCampo(l, l.titulares.find((j) => j.posicao === 'M')!))
    l.vagas.push(removerDoCampo(l, l.titulares.find((j) => j.posicao === 'M')!))
    for (const f of ['4-3-3', '3-5-2', '4-5-1', '3-4-3'] as const) {
      mudarFormacaoDoLado(p, 'casa', f)
      expect(l.titulares).toHaveLength(8)
      expect(l.vagas).toHaveLength(2)
      for (const s of ['G', 'D', 'M', 'A'] as const) expect([...l.setores, ...l.vagas].filter((p) => p === s).length).toBeLessThanOrEqual(FORMACOES[f][s])
    }
    ok(sub(p, 45, null, 'cb3'))
    ok(sub(p, 45, null, 'cb4'))
    expect(l.titulares).toHaveLength(10)
    expect(erro(sub(p, 45, null, 'cb1'))).toMatch(/vaga/)
  })

  it('a Substituicao tem efeito imediato na forca: trocar cansado por descansado sobe o ataque', () => {
    const p = novaPartida()
    for (const j of p.casa.titulares) j.condicao = 30
    recalcularRazoes(p)
    const antes = p.razaoCasa
    ok(sub(p, 50, 'c9', 'cb5'))
    expect(p.razaoCasa).toBeGreaterThan(antes)
  })

  it('mudar Formacao e Postura no meio da Partida recalcula as razoes na hora', () => {
    const p = novaPartida()
    const base = p.razaoCasa
    mudarFormacaoDoLado(p, 'casa', '3-4-3')
    expect(p.casa.setores).toHaveLength(11)
    expect(p.razaoCasa).toBeGreaterThan(base)
    const formacao = p.razaoCasa
    mudarPosturaDoLado(p, 'casa', 'ofensiva')
    expect(p.razaoCasa).toBeGreaterThan(formacao)
    expect(p.razaoFora).toBeGreaterThan(novaPartida().razaoFora)
  })

  it('Postura ofensiva no meio da Partida aumenta os gols esperados do resto do jogo', () => {
    const resto = (postura: Postura) => {
      const rng = criarRng(15)
      let gols = 0
      for (let i = 0; i < 8000; i++) {
        const p = criarPartida(lado(clonarTitulares('c')), lado(clonarTitulares('f')))
        if (postura !== 'equilibrada') mudarPosturaDoLado(p, 'casa', postura)
        for (let m = 46; m <= 90; m++) avancarMinutoPartida(rng, p, m)
        gols += p.golsCasa
      }
      return gols / 8000
    }
    const clonarTitulares = (prefixo: string) => titulares(60, prefixo).map((j) => ({ ...j }))
    expect(resto('ofensiva')).toBeGreaterThan(resto('equilibrada') * 1.03)
  }, 30000)

  it('IA: substitui o lesionado na hora, por reserva da mesma posicao', () => {
    const p = novaPartida()
    const lesionado = p.fora.titulares[10]
    p.fora.vagas.push(removerDoCampo(p.fora, lesionado))
    const trocas = agirIA(p, 'fora', 23)
    expect(trocas).toHaveLength(1)
    expect(trocas[0].entra.posicao).toBe('A')
    expect(p.fora.titulares).toHaveLength(11)
  })

  it('IA: a partir dos 60 minutos troca o titular cansado por reserva da mesma posicao, e nao antes', () => {
    const p = novaPartida()
    const cansado = p.fora.titulares[5]
    cansado.condicao = 40
    expect(agirIA(p, 'fora', 50)).toHaveLength(0)
    const trocas = agirIA(p, 'fora', 60)
    expect(trocas).toHaveLength(1)
    expect(trocas[0].sai).toBe(cansado)
    expect(trocas[0].entra.posicao).toBe(cansado.posicao)
  })

  it('IA: ajusta a Postura no fim conforme o placar', () => {
    const p = novaPartida()
    p.golsFora = 1
    agirIA(p, 'fora', 80)
    expect(p.fora.postura).toBe('defensiva')
    p.golsCasa = 3
    agirIA(p, 'fora', 85)
    expect(p.fora.postura).toBe('ofensiva')
    expect(agirIA(p, 'casa', 70)).toHaveLength(0)
    expect(p.casa.postura).toBe('equilibrada')
  })

  it('IA: nunca passa de 5 Substituicoes nem de 3 paradas, mesmo com muitas lesoes e cansaco', () => {
    const rng = criarRng(21)
    let trocou = 0
    for (let i = 0; i < 300; i++) {
      const p = criarPartida(lado(clonar(titulares(60, 'c'))), criarLado(clonar(titulares(60, 'f')), '4-4-2', 'equilibrada', clonar(banco('f'))))
      for (const j of p.fora.titulares) j.condicao = 60 + (i % 20)
      for (let m = 1; m <= 90; m++) {
        avancarMinutoPartida(rng, p, m)
        agirIA(p, 'fora', m)
      }
      expect(p.fora.substituicoes).toBeLessThanOrEqual(5)
      expect(p.fora.paradas).toBeLessThanOrEqual(3)
      trocou += p.fora.substituicoes
    }
    expect(trocou).toBeGreaterThan(300)
  })
})
