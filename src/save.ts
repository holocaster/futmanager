import { VERSAO_CARREIRA } from './motor/carreira'
import type { Carreira } from './motor/tipos'
import { carreiraValida } from './save.validacao'

export type ArmazenamentoSave = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

export const armazenamentoLocal: ArmazenamentoSave = {
  getItem: (chave) => window.localStorage.getItem(chave),
  setItem: (chave, valor) => window.localStorage.setItem(chave, valor),
  removeItem: (chave) => window.localStorage.removeItem(chave),
}

export const ERRO_ARMAZENAMENTO = 'Não foi possível acessar o armazenamento do navegador. Verifique as permissões e tente novamente.'

export const SLOTS = [1, 2, 3]

export type InfoSlot =
  | { slot: number; estado: 'vazio' }
  | { slot: number; estado: 'incompativel' }
  | { slot: number; estado: 'indisponivel' }
  | { slot: number; estado: 'ok'; clubeId: string; ano: number; proximaData: number; totalDatas: number; salvoEm: number }

interface Registro {
  versao: number
  salvoEm: number
  carreira: Carreira
}

const chave = (slot: number) => `futmanager:save:${slot}`
const ERRO_DADOS = 'Não foi possível salvar: há dado inválido na Carreira.'

function ler(armazenamento: ArmazenamentoSave, slot: number): Registro | null | 'incompativel' | 'indisponivel' {
  let bruto: string | null
  try {
    bruto = armazenamento.getItem(chave(slot))
  } catch {
    return 'indisponivel'
  }
  if (bruto === null) return null
  try {
    const registro = JSON.parse(bruto) as Registro
    return registro?.versao === VERSAO_CARREIRA && Number.isFinite(registro.salvoEm) && carreiraValida(registro.carreira) ? registro : 'incompativel'
  } catch {
    return 'incompativel'
  }
}

export function listarSlots(armazenamento: ArmazenamentoSave): InfoSlot[] {
  return SLOTS.map((slot): InfoSlot => {
    const registro = ler(armazenamento, slot)
    if (registro === null) return { slot, estado: 'vazio' }
    if (typeof registro === 'string') return { slot, estado: registro }
    const { carreira, salvoEm } = registro
    return { slot, estado: 'ok', clubeId: carreira.clubeId, ano: carreira.ano, proximaData: carreira.proximaData, totalDatas: carreira.calendario.length, salvoEm }
  })
}

export function carregar(armazenamento: ArmazenamentoSave, slot: number): Carreira | null {
  const registro = ler(armazenamento, slot)
  return registro && typeof registro !== 'string' ? registro.carreira : null
}

export function salvar(armazenamento: ArmazenamentoSave, slot: number, carreira: Carreira): string | null {
  const registro: Registro = { versao: VERSAO_CARREIRA, salvoEm: Date.now(), carreira }
  let json: string
  try {
    if (!carreiraValida(carreira)) return ERRO_DADOS
    let invalido = false
    json = JSON.stringify(registro, (_chave, valor: unknown) => {
      if (typeof valor === 'number' && !Number.isFinite(valor)) invalido = true
      return valor
    })
    if (invalido) return ERRO_DADOS
  } catch {
    return ERRO_DADOS
  }
  try {
    armazenamento.setItem(chave(slot), json)
    return null
  } catch (erro) {
    return erro instanceof DOMException && erro.name === 'QuotaExceededError'
      ? 'Não foi possível salvar: sem espaço no navegador. Exclua outro Save e tente de novo.'
      : ERRO_ARMAZENAMENTO
  }
}

export function excluir(armazenamento: ArmazenamentoSave, slot: number): string | null {
  try {
    armazenamento.removeItem(chave(slot))
    return null
  } catch {
    return ERRO_ARMAZENAMENTO
  }
}
