import { describe, expect, it } from 'vitest'
import { novaCarreira, VERSAO_CARREIRA } from './motor/carreira'
import { simularRodada } from './motor/rodada'
import { aplicarEscalacaoAutomatica } from './motor/tatica'
import { carregar, excluir, listarSlots, salvar, type ArmazenamentoSave } from './save'
import { memoria } from './save.test-helpers'
import { CATEGORIAS } from './motor/financas'
import { fimDeTemporada } from './motor/temporada'

describe('save', () => {
  it.each(['calendario', 'escalacao', 'rng', 'copa', 'propostas', 'transferencias', 'artilharia'])('recusa estrutura sem %s sem bloquear outros slots', (campo) => {
    const armazenamento = memoria()
    const c = novaCarreira(1, 'flamengo')
    salvar(armazenamento, 2, c)
    const carreira = JSON.parse(JSON.stringify(c))
    delete carreira[campo]
    armazenamento.setItem('futmanager:save:1', JSON.stringify({ versao: VERSAO_CARREIRA, salvoEm: 0, carreira }))
    expect(carregar(armazenamento, 1) === null).toBe(true)
    expect(listarSlots(armazenamento).map((s) => s.estado)).toEqual(['incompativel', 'ok', 'vazio'])
    expect(salvar(armazenamento, 2, carreira)).toMatch(/inválido/)
    expect(carregar(armazenamento, 2)).toEqual(c)
  })

  it('recusa campos internos e referencias invalidas', () => {
    const c = novaCarreira(1, 'flamengo')
    const corrupcoes = [
      (c: any) => { c.clubeId = 'inexistente' },
      (c: any) => { c.calendario[0].partidas = null },
      (c: any) => { c.calendario[0].partidas[0].casaId = 'inexistente' },
      (c: any) => { c.escalacao.formacao = 'invalida' },
      (c: any) => { c.escalacao.titulares[0] = 'inexistente' },
      (c: any) => { c.jogadores.j1.stats = null },
      (c: any) => { c.rng.estado = null },
      (c: any) => { c.proximaData = 999 },
      (c: any) => { c.copa.fases = [null] },
      (c: any) => { c.propostas = [{ jogadorId: 'inexistente', compradorId: 'flamengo', valor: 1 }] },
      (c: any) => { c.historico = [{ ano: 2025, premiacaoDoTecnico: 0 }] },
    ]
    for (const corromper of corrupcoes) {
      const invalida = structuredClone(c)
      corromper(invalida)
      const armazenamento = memoria()
      armazenamento.setItem('futmanager:save:1', JSON.stringify({ versao: VERSAO_CARREIRA, salvoEm: 0, carreira: invalida }))
      expect(listarSlots(armazenamento)[0].estado).toBe('incompativel')
      expect(carregar(armazenamento, 1)).toBeNull()
    }
  })

  it('trata leitura e exclusao bloqueadas sem apresentar slots vazios', () => {
    const indisponivel: ArmazenamentoSave = {
      getItem: () => { throw new DOMException('bloqueado', 'SecurityError') },
      setItem: () => { throw new DOMException('bloqueado', 'SecurityError') },
      removeItem: () => { throw new DOMException('bloqueado', 'SecurityError') },
    }
    expect(listarSlots(indisponivel).map((s) => s.estado)).toEqual(['indisponivel', 'indisponivel', 'indisponivel'])
    expect(carregar(indisponivel, 1)).toBeNull()
    expect(excluir(indisponivel, 1)).toMatch(/armazenamento/)
    expect(salvar(indisponivel, 1, novaCarreira(1, 'flamengo'))).toMatch(/armazenamento/)
  })

  it.each([NaN, Infinity, -Infinity])('recusa numeros nao finitos (%s) em qualquer nivel sem sobrescrever o Save anterior', (valor) => {
    const c = novaCarreira(1, 'flamengo')
    c.proximaData = c.calendario.length
    fimDeTemporada(c)
    const armazenamento = memoria()
    expect(salvar(armazenamento, 1, c)).toBeNull()
    const anterior = armazenamento.getItem('futmanager:save:1')
    const jogadorId = Object.keys(c.jogadores)[0]
    const corrupcoes: Array<(invalida: typeof c) => void> = [
      (invalida) => { invalida.clubes[0].saldo = valor },
      ...CATEGORIAS.map((categoria) => (invalida: typeof c) => { invalida.clubes[0].extrato[categoria] = valor }),
      (invalida) => { invalida.jogadores[jogadorId].salario = valor },
      (invalida) => { invalida.historico[0].premiacaoDoTecnico = valor },
      (invalida) => { invalida.rng.estado = valor },
      (invalida) => { invalida.jogadores[jogadorId].stats.golsCopa = valor },
    ]
    for (const corromper of corrupcoes) {
      const invalida = structuredClone(c)
      corromper(invalida)
      const antes = structuredClone(invalida)
      expect(salvar(armazenamento, 1, invalida)).toMatch(/inválido/)
      expect(invalida).toEqual(antes)
      expect(armazenamento.getItem('futmanager:save:1')).toBe(anterior)
      expect(carregar(armazenamento, 1)).toEqual(c)
    }
  })

  it('finanças null ou ausentes de um JSON antigo com perda nao carregam nem podem ser salvas como validas', () => {
    const c = novaCarreira(1, 'flamengo')
    c.proximaData = c.calendario.length
    fimDeTemporada(c)
    const armazenamento = memoria()
    expect(salvar(armazenamento, 1, c)).toBeNull()
    const anterior = armazenamento.getItem('futmanager:save:1')!
    for (const valor of [null, undefined]) {
      const corrupcoes = [
        (bruto: typeof c) => { bruto.clubes[0].saldo = valor as unknown as number },
        ...CATEGORIAS.map((categoria) => (bruto: typeof c) => { bruto.clubes[0].extrato[categoria] = valor as unknown as number }),
        (bruto: typeof c) => { bruto.jogadores[Object.keys(bruto.jogadores)[0]].salario = valor as unknown as number },
        (bruto: typeof c) => { bruto.historico[0].premiacaoDoTecnico = valor as unknown as number },
      ]
      for (const corromper of corrupcoes) {
        const registro = JSON.parse(anterior)
        corromper(registro.carreira)
        armazenamento.setItem('futmanager:save:2', JSON.stringify(registro))
        expect(listarSlots(armazenamento)[1].estado).toBe('incompativel')
        expect(carregar(armazenamento, 2)).toBeNull()
        expect(salvar(armazenamento, 1, registro.carreira)).toMatch(/inválido/)
        expect(armazenamento.getItem('futmanager:save:1')).toBe(anterior)
      }
    }
  })

  it('slots comecam vazios', () => {
    expect(listarSlots(memoria()).map((s) => s.estado)).toEqual(['vazio', 'vazio', 'vazio'])
  })

  it('round-trip: carregar devolve a mesma Carreira e simular a mesma Rodada da o mesmo resultado', () => {
    const original = novaCarreira(5, 'santos')
    simularRodada(original)
    const armazenamento = memoria()
    expect(salvar(armazenamento, 2, original)).toBeNull()
    const carregada = carregar(armazenamento, 2)!
    expect(JSON.stringify(carregada)).toBe(JSON.stringify(original))
    aplicarEscalacaoAutomatica(original)
    aplicarEscalacaoAutomatica(carregada)
    simularRodada(original)
    simularRodada(carregada)
    expect(JSON.stringify(carregada)).toBe(JSON.stringify(original))
  })

  it('usa as chaves futmanager:save:1..3 e lista Clube, ano e Rodada', () => {
    const armazenamento = memoria()
    const carreira = novaCarreira(1, 'flamengo')
    simularRodada(carreira)
    salvar(armazenamento, 3, carreira)
    expect([...armazenamento.itens.keys()]).toEqual(['futmanager:save:3'])
    const slots = listarSlots(armazenamento)
    expect(slots[2]).toMatchObject({ slot: 3, estado: 'ok', clubeId: 'flamengo', ano: 2026, proximaData: 1 })
    expect(slots[0].estado).toBe('vazio')
  })

  it('excluir esvazia o slot', () => {
    const armazenamento = memoria()
    salvar(armazenamento, 1, novaCarreira(1, 'flamengo'))
    excluir(armazenamento, 1)
    expect(listarSlots(armazenamento)[0].estado).toBe('vazio')
    expect(carregar(armazenamento, 1)).toBeNull()
  })

  it('versao diferente aparece como incompativel e nao carrega', () => {
    const armazenamento = memoria()
    salvar(armazenamento, 1, novaCarreira(1, 'flamengo'))
    const bruto = JSON.parse(armazenamento.getItem('futmanager:save:1')!)
    bruto.versao = VERSAO_CARREIRA + 1
    armazenamento.setItem('futmanager:save:1', JSON.stringify(bruto))
    expect(listarSlots(armazenamento)[0].estado).toBe('incompativel')
    expect(carregar(armazenamento, 1)).toBeNull()
  })

  it('Save da versao 1, anterior a Copa do Brasil, aparece como incompativel', () => {
    const armazenamento = memoria()
    salvar(armazenamento, 1, novaCarreira(1, 'flamengo'))
    const bruto = JSON.parse(armazenamento.getItem('futmanager:save:1')!)
    bruto.versao = 1
    delete bruto.carreira.copa
    armazenamento.setItem('futmanager:save:1', JSON.stringify(bruto))
    expect(VERSAO_CARREIRA).toBeGreaterThan(1)
    expect(listarSlots(armazenamento)[0].estado).toBe('incompativel')
    expect(carregar(armazenamento, 1)).toBeNull()
  })

  it('Save da versao 2, anterior ao extrato financeiro, aparece como incompativel', () => {
    const armazenamento = memoria()
    salvar(armazenamento, 1, novaCarreira(1, 'flamengo'))
    const bruto = JSON.parse(armazenamento.getItem('futmanager:save:1')!)
    bruto.versao = 2
    for (const c of bruto.carreira.clubes) delete c.extrato
    armazenamento.setItem('futmanager:save:1', JSON.stringify(bruto))
    expect(VERSAO_CARREIRA).toBeGreaterThan(2)
    expect(listarSlots(armazenamento)[0].estado).toBe('incompativel')
    expect(carregar(armazenamento, 1)).toBeNull()
  })

  it('Save da versao 3, anterior ao Historico, aparece como incompativel', () => {
    const armazenamento = memoria()
    salvar(armazenamento, 1, novaCarreira(1, 'flamengo'))
    const bruto = JSON.parse(armazenamento.getItem('futmanager:save:1')!)
    bruto.versao = 3
    delete bruto.carreira.historico
    armazenamento.setItem('futmanager:save:1', JSON.stringify(bruto))
    expect(VERSAO_CARREIRA).toBeGreaterThan(3)
    expect(listarSlots(armazenamento)[0].estado).toBe('incompativel')
    expect(carregar(armazenamento, 1)).toBeNull()
  })

  it('Save da versao 4, anterior as mudancas do Elenco no resumo, aparece como incompativel', () => {
    const armazenamento = memoria()
    salvar(armazenamento, 1, novaCarreira(1, 'flamengo'))
    const bruto = JSON.parse(armazenamento.getItem('futmanager:save:1')!)
    bruto.versao = 4
    armazenamento.setItem('futmanager:save:1', JSON.stringify(bruto))
    expect(VERSAO_CARREIRA).toBeGreaterThan(4)
    expect(listarSlots(armazenamento)[0].estado).toBe('incompativel')
    expect(carregar(armazenamento, 1)).toBeNull()
  })

  it('Save da versao 5, anterior as Propostas da IA, aparece como incompativel', () => {
    const armazenamento = memoria()
    salvar(armazenamento, 1, novaCarreira(1, 'flamengo'))
    const bruto = JSON.parse(armazenamento.getItem('futmanager:save:1')!)
    bruto.versao = 5
    delete bruto.carreira.propostas
    armazenamento.setItem('futmanager:save:1', JSON.stringify(bruto))
    expect(VERSAO_CARREIRA).toBeGreaterThan(5)
    expect(listarSlots(armazenamento)[0].estado).toBe('incompativel')
    expect(carregar(armazenamento, 1)).toBeNull()
  })

  it('Save da versao 6, anterior ao registro de transferencias, aparece como incompativel', () => {
    const armazenamento = memoria()
    salvar(armazenamento, 1, novaCarreira(1, 'flamengo'))
    const bruto = JSON.parse(armazenamento.getItem('futmanager:save:1')!)
    bruto.versao = 6
    delete bruto.carreira.transferencias
    armazenamento.setItem('futmanager:save:1', JSON.stringify(bruto))
    expect(VERSAO_CARREIRA).toBeGreaterThan(6)
    expect(listarSlots(armazenamento)[0].estado).toBe('incompativel')
    expect(carregar(armazenamento, 1)).toBeNull()
  })

  it('Save da versao 7, sem artilharia por origem, permanece incompativel', () => {
    const armazenamento = memoria()
    salvar(armazenamento, 1, novaCarreira(1, 'flamengo'))
    const bruto = JSON.parse(armazenamento.getItem('futmanager:save:1')!)
    bruto.versao = 7
    delete bruto.carreira.artilharia
    armazenamento.setItem('futmanager:save:1', JSON.stringify(bruto))
    expect(VERSAO_CARREIRA).toBe(8)
    expect(listarSlots(armazenamento)[0].estado).toBe('incompativel')
    expect(carregar(armazenamento, 1)).toBeNull()
  })

  it('conteudo corrompido aparece como incompativel', () => {
    const armazenamento = memoria()
    armazenamento.setItem('futmanager:save:2', '{nao e json')
    expect(listarSlots(armazenamento)[1].estado).toBe('incompativel')
    expect(carregar(armazenamento, 2)).toBeNull()
  })

  it('erro de cota devolve mensagem e preserva o Save anterior', () => {
    const carreira = novaCarreira(1, 'flamengo')
    const armazenamento = memoria()
    expect(salvar(armazenamento, 1, carreira)).toBeNull()
    const anterior = armazenamento.getItem('futmanager:save:1')
    const cheio: ArmazenamentoSave = { ...armazenamento, setItem: memoria(10).setItem }
    expect(salvar(cheio, 1, carreira)).toMatch(/espaço/)
    expect(armazenamento.getItem('futmanager:save:1')).toBe(anterior)
  })
})
