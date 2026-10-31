import { useState } from 'react'
import { CLUBES } from '../motor/clubes'
import { armazenamentoLocal, ERRO_ARMAZENAMENTO, excluir, listarSlots, type InfoSlot } from '../save'

export function Slots({ aoNovo, aoCarregar }: { aoNovo: (slot: number) => void; aoCarregar: (slot: number) => void }) {
  const [, atualizar] = useState(0)
  const [erro, setErro] = useState<string | null>(null)
  const slots = listarSlots(armazenamentoLocal)
  const indisponivel = slots.some((s) => s.estado === 'indisponivel')

  function novo(info: InfoSlot) {
    if (info.estado === 'vazio' || window.confirm(`O slot ${info.slot} já tem um Save. Sobrescrever?`)) aoNovo(info.slot)
  }

  function remover(info: InfoSlot) {
    if (!window.confirm(`Excluir o Save do slot ${info.slot}?`)) return
    setErro(excluir(armazenamentoLocal, info.slot))
    atualizar((v) => v + 1)
  }

  return (
    <div className="slots">
      {(indisponivel || erro) && <p className="erro" role="alert">{erro ?? ERRO_ARMAZENAMENTO}</p>}
      {indisponivel && <button className="botao" onClick={() => atualizar((v) => v + 1)}>Tentar novamente</button>}
      {slots.map((info) => (
        <div key={info.slot} className="slot">
          <div className="slot-texto">
            <strong>Slot {info.slot}</strong>
            {info.estado === 'vazio' && <span>vazio</span>}
            {info.estado === 'incompativel' && <span className="erro">Save incompatível com esta versão</span>}
            {info.estado === 'indisponivel' && <span className="erro">Armazenamento indisponível</span>}
            {info.estado === 'ok' && (
              <span>
                {CLUBES.find((c) => c.id === info.clubeId)?.nome} - {info.ano} - Data {Math.min(info.proximaData + 1, info.totalDatas)}/{info.totalDatas} -{' '}
                {new Date(info.salvoEm).toLocaleString('pt-BR')}
              </span>
            )}
          </div>
          <div className="slot-acoes">
            {info.estado === 'ok' && (
              <button className="botao" onClick={() => aoCarregar(info.slot)}>
                Carregar
              </button>
            )}
            <button className="aba" disabled={info.estado === 'indisponivel'} onClick={() => novo(info)}>
              Nova carreira
            </button>
            {info.estado !== 'vazio' && info.estado !== 'indisponivel' && (
              <button className="aba" onClick={() => remover(info)}>
                Excluir
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
