import { useState } from 'react'
import { FASES, jogosDoConfronto } from '../motor/copa'
import { PREMIO_COPA } from '../motor/financas'
import { placar } from './Competicao'
import { useCarreira } from './contexto'
import { Escudo } from './Escudo'
import { dinheiro } from './formato'

export function Copa() {
  const carreira = useCarreira()
  const { copa } = carreira
  const [fase, setFase] = useState(copa.fases.length - 1)
  const clube = (id: string) => carreira.clubes.find((c) => c.id === id)!
  const nome = (id: string) => (
    <span className="clube-nome">
      <Escudo clube={clube(id)} tamanho={16} />
      {clube(id).nome}
    </span>
  )
  const confrontos = copa.fases[fase] ?? []
  return (
    <>
      <h1>Copa do Brasil</h1>
      {copa.campeaoId && <p className="encerrada">Campeão: {clube(copa.campeaoId).nome}</p>}
      <div className="abas">
        {FASES.map((f, i) => (
          <button key={f.nome} className={i === fase ? 'aba ativa' : 'aba'} disabled={!copa.fases[i]} onClick={() => setFase(i)}>
            {f.nome}
          </button>
        ))}
      </div>
      <p>
        Prêmio por vencer esta fase: {dinheiro(PREMIO_COPA[fase])}. Somando todas as fases, o campeão ganha {dinheiro(PREMIO_COPA.reduce((a, b) => a + b, 0))}.
      </p>
      <div className="rolagem">
        <table className="tabela">
          <thead>
            <tr>
              <th>Confronto</th>
              {FASES[fase].idaEVolta ? (
                <>
                  <th className="num">Ida</th>
                  <th className="num">Volta</th>
                  <th className="num">Agregado</th>
                </>
              ) : (
                <th className="num">Resultado</th>
              )}
              <th>Classificado</th>
            </tr>
          </thead>
          <tbody>
            {confrontos.map((c) => {
              const jogos = jogosDoConfronto(carreira, fase, c)
              const placarDe = (j: (typeof jogos)[number]) => (j.resultado ? placar(j.resultado) : '-')
              const feito = jogos.every((j) => j.resultado)
              const agregado = [c.primeiroId, c.segundoId].map((id) => jogos.reduce((s, j) => s + (j.resultado ? (j.casaId === id ? j.resultado.golsCasa : j.resultado.golsFora) : 0), 0))
              return (
                <tr key={c.primeiroId} className={c.primeiroId === carreira.clubeId || c.segundoId === carreira.clubeId ? 'meu-clube' : ''}>
                  <td>
                    {nome(c.primeiroId)} x {nome(c.segundoId)}
                  </td>
                  {jogos.map((j) => (
                    <td key={j.casaId} className="num">
                      {FASES[fase].idaEVolta ? `${clube(j.casaId).nomeCurto} ${placarDe(j)}` : placarDe(j)}
                    </td>
                  ))}
                  {FASES[fase].idaEVolta && <td className="num">{feito ? `${agregado[0]} x ${agregado[1]}` : '-'}</td>}
                  <td>{c.vencedorId ? nome(c.vencedorId) : '-'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
