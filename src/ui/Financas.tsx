import { CATEGORIAS, folhaMensal } from '../motor/financas'
import type { CategoriaFinanceira } from '../motor/tipos'
import { useCarreira } from './contexto'
import { dinheiro } from './formato'

const ROTULOS: Record<CategoriaFinanceira, string> = {
  salarios: 'Salários',
  patrocinio: 'Patrocínio',
  bilheteria: 'Bilheteria',
  premiacao: 'Premiação',
  transferencias: 'Transferências',
}

export function Financas() {
  const carreira = useCarreira()
  const clube = carreira.clubes.find((c) => c.id === carreira.clubeId)!
  const total = CATEGORIAS.reduce((s, k) => s + clube.extrato[k], 0)
  return (
    <>
      <h1>Finanças</h1>
      <p>
        Saldo: <strong className={clube.saldo < 0 ? 'erro' : ''}>{dinheiro(clube.saldo)}</strong>
      </p>
      <p>Folha mensal: {dinheiro(folhaMensal(carreira, clube.id))}</p>
      <h2>Extrato da Temporada {carreira.ano}</h2>
      <table className="tabela">
        <thead>
          <tr>
            <th>Categoria</th>
            <th className="num">Valor</th>
          </tr>
        </thead>
        <tbody>
          {CATEGORIAS.map((k) => (
            <tr key={k}>
              <td>{ROTULOS[k]}</td>
              <td className={clube.extrato[k] < 0 ? 'num erro' : 'num'}>{dinheiro(clube.extrato[k])}</td>
            </tr>
          ))}
          <tr>
            <td>
              <strong>Total</strong>
            </td>
            <td className="num">
              <strong>{dinheiro(total)}</strong>
            </td>
          </tr>
        </tbody>
      </table>
    </>
  )
}
