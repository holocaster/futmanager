import { describe, expect, it } from 'vitest'
import { CLUBES } from './clubes'
import { novaCarreira, SALDO_INICIAL } from './carreira'
import { elencoDe } from './elenco'
import { valorDeMercado } from './jogadores'
import type { Porte } from './tipos'

const motorRaw = import.meta.glob('./*.ts', { query: '?raw', import: 'default', eager: true }) as Record<string, string>

describe('dados dos clubes', () => {
  it('tem 20 clubes em cada Serie e 8 no Pool, com ids unicos', () => {
    const contagem = { A: 0, B: 0, C: 0, D: 0 }
    for (const c of CLUBES) contagem[c.divisao]++
    expect(contagem).toEqual({ A: 20, B: 20, C: 20, D: 8 })
    expect(new Set(CLUBES.map((c) => c.id)).size).toBe(68)
  })

  it('tem dados completos em todos os clubes', () => {
    for (const c of CLUBES) {
      expect(c.nome && c.nomeCurto && c.cidade).toBeTruthy()
      expect(c.uf).toMatch(/^[A-Z]{2}$/)
      expect(c.cores[0]).toMatch(/^#[0-9a-f]{6}$/)
      expect(c.cores[1]).toMatch(/^#[0-9a-f]{6}$/)
      expect([1, 2, 3, 4, 5]).toContain(c.porte)
    }
  })

  it('o Pool so tem clubes de Porte 1', () => {
    expect(CLUBES.filter((c) => c.divisao === 'D').every((c) => c.porte === 1)).toBe(true)
  })
})

describe('novaCarreira', () => {
  it('mesmo seed gera Carreira identica', () => {
    expect(JSON.stringify(novaCarreira(42, 'flamengo'))).toBe(JSON.stringify(novaCarreira(42, 'flamengo')))
  })

  it('seeds diferentes geram Carreiras diferentes', () => {
    expect(JSON.stringify(novaCarreira(1, 'flamengo'))).not.toBe(JSON.stringify(novaCarreira(2, 'flamengo')))
  })

  it('comeca em 2026 com o Clube escolhido', () => {
    const c = novaCarreira(1, 'santos')
    expect(c.ano).toBe(2026)
    expect(c.clubeId).toBe('santos')
  })

  it('recusa Clube inexistente ou do Pool', () => {
    expect(() => novaCarreira(1, 'nao-existe')).toThrow()
    expect(() => novaCarreira(1, 'abc')).toThrow()
  })

  it('cada Elenco tem 25 jogadores: 3 G, 8 D, 8 M, 6 A, idade 17-35, contrato 1-4 anos', () => {
    const c = novaCarreira(7, 'palmeiras')
    for (const clube of c.clubes) {
      const elenco = elencoDe(c, clube.id)
      expect(elenco).toHaveLength(25)
      const por = (p: string) => elenco.filter((j) => j.posicao === p).length
      expect([por('G'), por('D'), por('M'), por('A')]).toEqual([3, 8, 8, 6])
      for (const j of elenco) {
        expect(j.idade).toBeGreaterThanOrEqual(17)
        expect(j.idade).toBeLessThanOrEqual(35)
        expect(j.contratoAte).toBeGreaterThanOrEqual(2026)
        expect(j.contratoAte).toBeLessThanOrEqual(2029)
        expect(j.forca).toBeGreaterThanOrEqual(1)
        expect(j.forca).toBeLessThanOrEqual(99)
        expect(j.salario).toBeGreaterThanOrEqual(5000)
      }
    }
  })

  it('ids de Jogador sao unicos e batem com o registro', () => {
    const c = novaCarreira(7, 'palmeiras')
    const ids = Object.values(c.jogadores).map((j) => j.id)
    expect(ids).toHaveLength(68 * 25)
    expect(new Set(ids).size).toBe(ids.length)
    for (const [chave, j] of Object.entries(c.jogadores)) expect(j.id).toBe(chave)
  })

  it('a forca media do Elenco cresce com o Porte', () => {
    const c = novaCarreira(3, 'flamengo')
    const media = (porte: Porte) => {
      const clubes = c.clubes.filter((x) => x.porte === porte)
      const forcas = clubes.flatMap((x) => elencoDe(c, x.id).map((j) => j.forca))
      return forcas.reduce((a, b) => a + b, 0) / forcas.length
    }
    const medias = ([1, 2, 3, 4, 5] as Porte[]).map(media)
    for (let i = 1; i < medias.length; i++) expect(medias[i]).toBeGreaterThan(medias[i - 1])
    expect(medias[0]).toBeGreaterThan(48)
    expect(medias[4]).toBeLessThan(80)
  })

  it('saldo inicial segue o Porte', () => {
    const c = novaCarreira(3, 'flamengo')
    for (const clube of c.clubes) expect(clube.saldo).toBe(SALDO_INICIAL[clube.porte])
    expect(SALDO_INICIAL[5]).toBeGreaterThan(SALDO_INICIAL[4])
    expect(SALDO_INICIAL[1]).toBeGreaterThan(0)
  })

  it('o salario cresce com o valor do Jogador', () => {
    const c = novaCarreira(3, 'flamengo')
    const jogadores = Object.values(c.jogadores).sort((a, b) => valorDeMercado(a.forca, a.idade) - valorDeMercado(b.forca, b.idade))
    expect(jogadores[0].salario).toBeLessThan(jogadores[jogadores.length - 1].salario)
  })
})

describe('valorDeMercado', () => {
  it('cresce com a forca', () => {
    expect(valorDeMercado(70, 25)).toBeGreaterThan(valorDeMercado(60, 25))
  })

  it('cai com a idade', () => {
    const v = [20, 25, 29, 32, 35].map((idade) => valorDeMercado(70, idade))
    expect(v[0]).toBeGreaterThan(v[1])
    expect(v[1]).toBeGreaterThan(v[2])
    expect(v[2]).toBeGreaterThan(v[3])
    expect(v[3]).toBeGreaterThan(v[4])
  })
})

describe('motor puro', () => {
  it('nao usa Math.random nem APIs do navegador', () => {
    const fontes = Object.entries(motorRaw).filter(([nome]) => !nome.endsWith('.test.ts'))
    expect(fontes.length).toBeGreaterThan(3)
    for (const [nome, texto] of fontes) {
      expect(texto, nome).not.toMatch(/Math\.random|localStorage|\bwindow\b|\bdocument\b/)
    }
  })
})
