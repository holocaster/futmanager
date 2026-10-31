import { useState } from 'react'
import { DURACAO_MAXIMA, DURACAO_MINIMA, renovarContrato } from '../motor/contratos'
import { elencoDe } from '../motor/elenco'
import { salarioPedido, valorDeMercado } from '../motor/jogadores'
import { definirAVenda } from '../motor/propostas'
import type { Jogador, Posicao } from '../motor/tipos'
import { useCarreira } from './contexto'
import { dinheiro, situacao } from './formato'

const ORDEM: Record<Posicao, number> = { G: 0, D: 1, M: 2, A: 3 }

function Renovar({ jogador, aoMudar }: { jogador: Jogador; aoMudar: () => void }) {
  const carreira = useCarreira()
  const [anos, setAnos] = useState(DURACAO_MINIMA)
  const [erro, setErro] = useState<string | null>(null)
  const termino = Math.max(jogador.contratoAte, carreira.ano + anos)
  const salario = Math.max(jogador.salario, salarioPedido(jogador.forca, jogador.idade, jogador.moral))
  return (
    <div className="formulario-jogador">
      <h3>Renovar contrato</h3>
      <label>
        Duração
        <select aria-label={`Duração da renovação de ${jogador.nome}`} value={anos} onChange={(e) => setAnos(Number(e.target.value))}>
          {Array.from({ length: DURACAO_MAXIMA - DURACAO_MINIMA + 1 }, (_, i) => DURACAO_MINIMA + i).map((n) => (
            <option key={n} value={n}>
              {n} {n === 1 ? 'ano' : 'anos'}
            </option>
          ))}
        </select>
      </label>
      <span>Término: {termino}; {dinheiro(salario)}/mês</span>
      {carreira.ano + anos < jogador.contratoAte && <span className="aviso-renovacao">O vínculo não será encurtado nem estendido. O salário ainda pode subir.</span>}
      <button
        className="aba"
        onClick={() => {
          setErro(renovarContrato(carreira, jogador.id, anos))
          aoMudar()
        }}
      >
        Renovar
      </button>
      {erro && <span className="erro">{erro}</span>}
    </div>
  )
}

function Venda({ jogador, aoMudar }: { jogador: Jogador; aoMudar: () => void }) {
  const carreira = useCarreira()
  const [preco, setPreco] = useState(String(valorDeMercado(jogador.forca, jogador.idade)))
  const [erro, setErro] = useState<string | null>(null)
  const definir = (valor: number | null) => {
    setErro(definirAVenda(carreira, jogador.id, valor))
    aoMudar()
  }
  return jogador.aVenda !== null ? (
    <div className="formulario-jogador">
      <h3>Venda</h3>
      <span>À venda por {dinheiro(jogador.aVenda)}</span>
      <button className="aba" onClick={() => definir(null)}>
        Retirar da venda
      </button>
    </div>
  ) : (
    <div className="formulario-jogador">
      <h3>Venda</h3>
      <label>
        Preço pedido (R$)
        <input aria-label={`Preço de venda de ${jogador.nome}`} type="number" step={10000} value={preco} onChange={(e) => setPreco(e.target.value)} />
      </label>
      <button className="aba" onClick={() => definir(Number(preco))}>
        Colocar à venda
      </button>
      {erro && <span className="erro">{erro}</span>}
    </div>
  )
}

export function TabelaElenco({ clubeId, aoMudar }: { clubeId: string; aoMudar?: () => void }) {
  const carreira = useCarreira()
  const renovavel = !!aoMudar && clubeId === carreira.clubeId
  const elenco = elencoDe(carreira, clubeId).sort((a, b) => ORDEM[a.posicao] - ORDEM[b.posicao] || b.forca - a.forca)
  return (
    <div className="rolagem elenco-responsivo">
      <table className="tabela tabela-elenco" role="table" aria-label="Elenco">
        <thead>
          <tr>
            <th>Pos</th>
            <th>Nome</th>
            <th className="num">Idade</th>
            <th className="num">Força</th>
            <th className="num">Cond.</th>
            <th className="num">Moral</th>
            <th className="num">Salário/mês</th>
            <th className="num">Contrato</th>
            <th className="num">Valor</th>
            <th>Situação</th>
            {renovavel && <th>Ações</th>}
          </tr>
        </thead>
        <tbody>
          {elenco.map((j) => (
            <tr key={j.id}>
              <td data-label="Posição" className="posicao-jogador">{j.posicao}</td>
              <td data-label="Nome" className="nome-jogador">{j.nome}</td>
              <td data-label="Idade" className="num">{j.idade}</td>
              <td data-label="Força" className="num">{j.forca}</td>
              <td data-label="Condição" className="num">{Math.round(j.condicao)}</td>
              <td data-label="Moral" className="num">{j.moral}</td>
              <td data-label="Salário/mês" className="num">{dinheiro(j.salario)}</td>
              <td data-label="Contrato" className="num">{j.contratoAte}</td>
              <td data-label="Valor" className="num">{dinheiro(valorDeMercado(j.forca, j.idade))}</td>
              <td data-label="Situação" className={`situacao-jogador ${j.lesao > 0 || j.suspensao > 0 ? 'erro' : ''}`}>{situacao(j)}</td>
              {renovavel && (
                <td className="acoes-elenco">
                  <details className="gestao-jogador" name="gestao-elenco">
                    <summary aria-label={`Gerenciar ${j.nome}`}>Gerenciar</summary>
                    <Renovar jogador={j} aoMudar={aoMudar} />
                    <Venda jogador={j} aoMudar={aoMudar} />
                  </details>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
