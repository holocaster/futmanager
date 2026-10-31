import { describe, expect, it } from 'vitest'
import { novaCarreira } from './carreira'
import { renovarContrato } from './contratos'
import { elencoDe } from './elenco'
import { ELENCO_ALVO, ELENCO_MAXIMO } from './evolucao'
import { FORCA_MEDIA_POR_PORTE, salarioPedido, salarioReferencia, valorDeMercado } from './jogadores'
import { validarEscalacao } from './tatica'
import { fimDeTemporada } from './temporada'
import type { Carreira } from './tipos'

function carreiraNoFim(seed: number, clubeId = 'flamengo'): Carreira {
  const carreira = novaCarreira(seed, clubeId)
  carreira.proximaData = carreira.calendario.length
  return carreira
}

function estender(carreira: Carreira): void {
  for (const j of Object.values(carreira.jogadores)) j.contratoAte = carreira.ano + 5
}

describe('renovarContrato', () => {
  it('o Contrato termina N anos depois da Temporada atual e o salario passa a ser o pedido', () => {
    const carreira = novaCarreira(1, 'flamengo')
    const j = elencoDe(carreira, 'flamengo')[0]
    j.contratoAte = carreira.ano
    j.moral = 30
    j.salario = 5_000
    expect(renovarContrato(carreira, j.id, 3)).toBeNull()
    expect(j.contratoAte).toBe(carreira.ano + 3)
    expect(j.salario).toBe(salarioPedido(j.forca, j.idade, 30))
  })

  it('renovar de novo nao alonga alem de 5 anos e nunca encurta o Contrato', () => {
    const carreira = novaCarreira(1, 'flamengo')
    const j = elencoDe(carreira, 'flamengo')[0]
    j.contratoAte = carreira.ano
    for (let i = 0; i < 3; i++) expect(renovarContrato(carreira, j.id, 3)).toBeNull()
    expect(j.contratoAte).toBe(carreira.ano + 3)
    expect(renovarContrato(carreira, j.id, 5)).toBeNull()
    expect(renovarContrato(carreira, j.id, 5)).toBeNull()
    expect(j.contratoAte).toBe(carreira.ano + 5)
    expect(renovarContrato(carreira, j.id, 1)).toBeNull()
    expect(j.contratoAte).toBe(carreira.ano + 5)
  })

  it('o salario renovado nunca fica abaixo do atual, mesmo com moral alta', () => {
    const carreira = novaCarreira(1, 'flamengo')
    const j = elencoDe(carreira, 'flamengo')[0]
    j.moral = 100
    const antes = j.salario
    expect(salarioPedido(j.forca, j.idade, 100)).toBeLessThan(antes)
    expect(renovarContrato(carreira, j.id, 2)).toBeNull()
    expect(j.salario).toBe(antes)
  })

  it('duracao menor preserva vinculo com moral baixa e renovacoes repetidas preservam o piso salarial', () => {
    const c = novaCarreira(1, 'flamengo')
    const j = elencoDe(c, c.clubeId)[0]
    j.contratoAte = c.ano + 4
    j.moral = 0
    const pedido = salarioPedido(j.forca, j.idade, j.moral)
    expect(renovarContrato(c, j.id, 1)).toBeNull()
    expect(j.contratoAte).toBe(c.ano + 4)
    expect(j.salario).toBe(pedido)
    j.moral = 100
    for (const anos of [5, 5, 1, 3, 5]) expect(renovarContrato(c, j.id, anos)).toBeNull()
    expect(j.salario).toBe(pedido)
    expect(j.contratoAte).toBe(c.ano + 5)
  })

  it('recusa duracao fora de 1 a 5 e Jogador de outro Clube', () => {
    const carreira = novaCarreira(1, 'flamengo')
    const meu = elencoDe(carreira, 'flamengo')[0]
    const termino = meu.contratoAte
    for (const anos of [0, 6, 1.5, NaN]) expect(renovarContrato(carreira, meu.id, anos)).toMatch(/1 a 5/)
    expect(meu.contratoAte).toBe(termino)
    const alheio = elencoDe(carreira, 'santos')[0]
    expect(renovarContrato(carreira, alheio.id, 2)).toMatch(/Elenco/)
    expect(renovarContrato(carreira, 'nao-existe', 2)).toMatch(/Elenco/)
  })

  it('moral baixa pede salario maior', () => {
    const referencia = salarioReferencia(valorDeMercado(70, 26))
    expect(salarioPedido(70, 26, 70)).toBe(referencia)
    expect(salarioPedido(70, 26, 20)).toBeGreaterThan(referencia)
    expect(salarioPedido(70, 26, 100)).toBeLessThan(referencia)
  })
})

describe('fim de Contrato', () => {
  it('o Contrato vencido sai do jogo e o renovado fica, no Clube do Tecnico', () => {
    const carreira = carreiraNoFim(2)
    estender(carreira)
    const [vence, renovado, ...resto] = elencoDe(carreira, 'flamengo')
    vence.contratoAte = carreira.ano
    renovado.contratoAte = carreira.ano
    expect(renovarContrato(carreira, renovado.id, 2)).toBeNull()
    const resumo = fimDeTemporada(carreira)
    expect(carreira.jogadores[vence.id]).toBeUndefined()
    expect(carreira.jogadores[renovado.id]).toBeDefined()
    expect(carreira.jogadores[renovado.id].contratoAte).toBe(2028)
    expect(resto.every((j) => carreira.jogadores[j.id] || j.idade >= 33)).toBe(true)
    expect(resumo.elencoDoTecnico.saidas.map((s) => s.nome)).toContain(vence.nome)
  })

  it('a IA renova quem tem forca acima da mediana e menos de 33 anos e deixa sair os demais', () => {
    const carreira = carreiraNoFim(3)
    estender(carreira)
    const elenco = elencoDe(carreira, 'palmeiras')
    elenco.forEach((j, i) => {
      j.contratoAte = carreira.ano
      j.idade = 20 + (i % 10)
      j.forca = 40 + i
    })
    const forcas = elenco.map((j) => j.forca).sort((a, b) => a - b)
    const mediana = forcas[12]
    const ficam = elenco.filter((j) => j.forca > mediana && j.idade < 33)
    const saem = elenco.filter((j) => !(j.forca > mediana && j.idade < 33))
    expect(ficam.length).toBeGreaterThan(0)
    expect(saem.length).toBeGreaterThan(0)
    fimDeTemporada(carreira)
    for (const j of ficam) {
      expect(carreira.jogadores[j.id], j.id).toBeDefined()
      expect(carreira.jogadores[j.id].contratoAte).toBeGreaterThan(2026)
    }
    for (const j of saem) expect(carreira.jogadores[j.id], j.id).toBeUndefined()
  })

  it('o Clube do Tecnico perde tudo o que nao renovou, mesmo os melhores', () => {
    const carreira = carreiraNoFim(4)
    estender(carreira)
    const elenco = elencoDe(carreira, 'flamengo')
    for (const j of elenco) j.contratoAte = carreira.ano
    fimDeTemporada(carreira)
    expect(elenco.every((j) => carreira.jogadores[j.id] === undefined)).toBe(true)
  })
})

describe('evolucao', () => {
  function variacao(filtro: (idade: number, folga: number) => boolean) {
    const carreira = carreiraNoFim(5)
    estender(carreira)
    const antes = Object.values(carreira.jogadores)
      .filter((j) => filtro(j.idade, j.potencial - j.forca))
      .map((j) => ({ id: j.id, forca: j.forca }))
    fimDeTemporada(carreira)
    const sobreviventes = antes.filter((a) => carreira.jogadores[a.id])
    return { n: sobreviventes.length, media: sobreviventes.reduce((s, a) => s + carreira.jogadores[a.id].forca - a.forca, 0) / sobreviventes.length }
  }

  it('jovens com potencial alto melhoram em media', () => {
    const { n, media } = variacao((idade, folga) => idade <= 21 && folga >= 8)
    expect(n).toBeGreaterThan(100)
    expect(media).toBeGreaterThan(1)
  })

  it('veteranos pioram em media e quanto mais velhos, mais caem', () => {
    const meia = variacao((idade) => idade >= 28 && idade <= 30)
    const veteranos = variacao((idade) => idade >= 31 && idade <= 33)
    const velhos = variacao((idade) => idade >= 34)
    expect(veteranos.n).toBeGreaterThan(100)
    expect(veteranos.media).toBeLessThan(-0.5)
    expect(meia.media).toBeLessThan(0.5)
    expect(velhos.media).toBeLessThan(veteranos.media)
  })

  it('forca e potencial ficam em 1 a 99 e a idade sobe um ano', () => {
    const carreira = carreiraNoFim(6)
    estender(carreira)
    const idades = new Map(Object.values(carreira.jogadores).map((j) => [j.id, j.idade]))
    fimDeTemporada(carreira)
    for (const j of Object.values(carreira.jogadores)) {
      expect(j.forca).toBeGreaterThanOrEqual(1)
      expect(j.potencial).toBeLessThanOrEqual(99)
      expect(j.potencial).toBeGreaterThanOrEqual(j.forca)
      if (idades.has(j.id)) expect(j.idade).toBe(idades.get(j.id)! + 1)
    }
  })
})

describe('aposentadoria', () => {
  it('ninguem com 38 anos ou mais continua', () => {
    const carreira = carreiraNoFim(7)
    estender(carreira)
    const veteranos = Object.values(carreira.jogadores).slice(0, 200)
    veteranos.forEach((j, i) => (j.idade = 37 + (i % 4)))
    fimDeTemporada(carreira)
    expect(veteranos.every((j) => carreira.jogadores[j.id] === undefined)).toBe(true)
    expect(Object.values(carreira.jogadores).every((j) => j.idade < 38)).toBe(true)
  })

  it('a partir dos 34 anos ha chance e abaixo disso nao ha', () => {
    const carreira = carreiraNoFim(8)
    estender(carreira)
    const todos = Object.values(carreira.jogadores)
    const de35 = todos.slice(0, 300)
    const de32 = todos.slice(300, 600)
    de35.forEach((j) => (j.idade = 35))
    de32.forEach((j) => (j.idade = 32))
    fimDeTemporada(carreira)
    const ficaram = de35.filter((j) => carreira.jogadores[j.id]).length
    expect(ficaram).toBeGreaterThan(0)
    expect(ficaram).toBeLessThan(de35.length)
    expect(de32.every((j) => carreira.jogadores[j.id])).toBe(true)
  })
})

describe('Base e reposicao', () => {
  it('cada Clube recebe 2 ou 3 Jogadores de 17 a 18 anos, mais fracos que a media do Porte', () => {
    const carreira = carreiraNoFim(9)
    estender(carreira)
    const ultimoId = carreira.proximoJogadorId
    const antes = new Set(Object.keys(carreira.jogadores))
    fimDeTemporada(carreira)
    const novos = Object.values(carreira.jogadores).filter((j) => !antes.has(j.id))
    for (const clube of carreira.clubes) {
      const doClube = novos.filter((j) => j.clubeId === clube.id)
      expect(doClube.length).toBeGreaterThanOrEqual(2)
      expect(doClube.length).toBeLessThanOrEqual(3)
      for (const j of doClube) {
        expect(j.idade).toBeGreaterThanOrEqual(17)
        expect(j.idade).toBeLessThanOrEqual(18)
        expect(j.contratoAte).toBeGreaterThanOrEqual(carreira.ano)
      }
    }
    const mediaPorPorte = (porte: 1 | 2 | 3 | 4 | 5) => {
      const ids = new Set(carreira.clubes.filter((c) => c.porte === porte).map((c) => c.id))
      const forcas = novos.filter((j) => ids.has(j.clubeId)).map((j) => j.forca)
      return forcas.reduce((a, b) => a + b, 0) / forcas.length
    }
    for (const porte of [1, 2, 3, 4, 5] as const) expect(mediaPorPorte(porte)).toBeLessThan(FORCA_MEDIA_POR_PORTE[porte])
    expect(carreira.proximoJogadorId).toBe(ultimoId + novos.length)
  })

  it('o Clube do Tecnico recebe a Base e ela aparece no resumo', () => {
    const carreira = carreiraNoFim(10)
    estender(carreira)
    const resumo = fimDeTemporada(carreira).elencoDoTecnico
    expect(resumo.base.length).toBeGreaterThanOrEqual(2)
    expect(resumo.base.length).toBeLessThanOrEqual(3)
    expect(resumo.base.every((b) => b.idade >= 17 && b.idade <= 18)).toBe(true)
  })

  it('a Base nao passa o maximo de 32 Jogadores', () => {
    const carreira = carreiraNoFim(11)
    estender(carreira)
    const doutro = elencoDe(carreira, 'santos').slice(0, 7)
    for (const j of doutro) j.clubeId = 'palmeiras'
    expect(elencoDe(carreira, 'palmeiras')).toHaveLength(32)
    fimDeTemporada(carreira)
    expect(elencoDe(carreira, 'palmeiras').length).toBeLessThanOrEqual(ELENCO_MAXIMO)
  })

  it('todos os Elencos ficam entre 22 e 32 com pelo menos 2 goleiros, mesmo quando quase todos saem', () => {
    const carreira = carreiraNoFim(12)
    for (const j of Object.values(carreira.jogadores)) j.contratoAte = carreira.ano
    const resumo = fimDeTemporada(carreira)
    for (const clube of carreira.clubes) {
      const elenco = elencoDe(carreira, clube.id)
      expect(elenco.length, clube.id).toBeGreaterThanOrEqual(ELENCO_ALVO)
      expect(elenco.length, clube.id).toBeLessThanOrEqual(ELENCO_MAXIMO)
      expect(elenco.filter((j) => j.posicao === 'G').length, clube.id).toBeGreaterThanOrEqual(2)
    }
    expect(resumo.elencoDoTecnico.saidas.length).toBeGreaterThan(0)
    expect(resumo.elencoDoTecnico.repostos.length).toBeGreaterThan(0)
    expect(validarEscalacao(carreira, carreira.escalacao)).toEqual([])
  })

  it('a Escalacao do Tecnico continua valida depois de saidas e aposentadorias', () => {
    const carreira = carreiraNoFim(13)
    for (const j of elencoDe(carreira, 'flamengo')) j.contratoAte = carreira.ano
    fimDeTemporada(carreira)
    expect(validarEscalacao(carreira, carreira.escalacao)).toEqual([])
  })
})
