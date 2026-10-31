import { useState } from 'react'
import { valorDe } from '../motor/mercado'
import { aceitarProposta, contrapropor, recusarProposta } from '../motor/propostas'
import type { PropostaDaIA } from '../motor/tipos'
import { useCarreira } from './contexto'
import { dinheiro } from './formato'

function Linha({ proposta, aoMudar, aoAvisar }: { proposta: PropostaDaIA; aoMudar: () => void; aoAvisar: (texto: string | null) => void }) {
  const carreira = useCarreira()
  const j = carreira.jogadores[proposta.jogadorId]
  const comprador = carreira.clubes.find((c) => c.id === proposta.compradorId)!
  const [contra, setContra] = useState(String(Math.round(valorDe(j) * 1.1)))
  const agir = (texto: string | null) => {
    aoAvisar(texto)
    aoMudar()
  }
  return (
    <li className="caixa-item caixa-proposta">
      <span className="ponto ponto-destaque" />
      <span className="caixa-texto">
        {comprador.nome} oferece <strong>{dinheiro(proposta.valor)}</strong> por {j.nome} ({j.posicao}, {j.idade} anos, força {j.forca}). Valor: {dinheiro(valorDe(j))}.
      </span>
      <span className="caixa-acoes">
        <button className="botao" onClick={() => agir(aceitarProposta(carreira, proposta) ?? `${j.nome} foi vendido para o ${comprador.nome}.`)}>
          Aceitar
        </button>
        <button
          className="aba"
          onClick={() => {
            recusarProposta(carreira, proposta)
            agir('Proposta recusada.')
          }}
        >
          Recusar
        </button>
        <input aria-label={`Contraproposta por ${j.nome} ao ${comprador.nome}`} type="number" step={10000} value={contra} onChange={(e) => setContra(e.target.value)} />
        <button className="aba" onClick={() => agir(contrapropor(carreira, proposta, Number(contra)).mensagem)}>
          Contrapropor
        </button>
      </span>
    </li>
  )
}

export function Propostas({ aoMudar }: { aoMudar: () => void }) {
  const carreira = useCarreira()
  const [aviso, setAviso] = useState<string | null>(null)
  return (
    <>
      {aviso && (
        <li className="caixa-item">
          <span className="ponto ponto-destaque" />
          <span className="caixa-texto encerrada">{aviso}</span>
        </li>
      )}
      {carreira.propostas.map((p) => (
        <Linha key={`${p.compradorId}-${p.jogadorId}`} proposta={p} aoMudar={aoMudar} aoAvisar={setAviso} />
      ))}
    </>
  )
}
