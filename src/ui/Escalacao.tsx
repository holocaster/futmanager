import { useState } from 'react'
import { elencoDe } from '../motor/elenco'
import { aplicarEscalacaoAutomatica, atribuirSetores, FORMACOES, forcaNoSetor, mudarFormacao, mudarPostura, POSTURAS, trocarJogadores, validarEscalacao } from '../motor/tatica'
import type { Formacao, Jogador, Posicao, Postura } from '../motor/tipos'
import { useCarreira } from './contexto'
import { situacao } from './formato'

const ORDEM: Record<Posicao, number> = { G: 0, D: 1, M: 2, A: 3 }

interface Linha {
  jogador: Jogador
  setor?: Posicao
}

function Tabela({ titulo, linhas, selecionado, aoClicar }: { titulo: string; linhas: Linha[]; selecionado: string | null; aoClicar: (id: string) => void }) {
  return (
    <>
      <h2>{titulo}</h2>
      <div className="rolagem">
        <table className="tabela">
          <thead>
            <tr>
              <th>Setor</th>
              <th>Pos</th>
              <th>Nome</th>
              <th className="num">Idade</th>
              <th className="num">Força</th>
              <th className="num">No setor</th>
              <th className="num">Cond.</th>
              <th className="num">Moral</th>
              <th>Situação</th>
            </tr>
          </thead>
          <tbody>
            {linhas.map(({ jogador: j, setor }) => (
              <tr key={j.id} className={j.id === selecionado ? 'clicavel selecionado' : 'clicavel'} onClick={() => aoClicar(j.id)}>
                <td>{setor ?? ''}</td>
                <td>{j.posicao}</td>
                <td><button className="jogador-escalacao" aria-pressed={j.id === selecionado}>{j.nome}</button></td>
                <td className="num">{j.idade}</td>
                <td className="num">{j.forca}</td>
                <td className={`num ${setor && setor !== j.posicao ? 'erro' : ''}`}>{setor ? Math.round(forcaNoSetor(j, setor)) : ''}</td>
                <td className="num">{Math.round(j.condicao)}</td>
                <td className="num">{j.moral}</td>
                <td className={j.lesao > 0 || j.suspensao > 0 ? 'erro' : ''}>{situacao(j)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export function Escalacao({ aoMudar }: { aoMudar: () => void }) {
  const carreira = useCarreira()
  const [selecionado, setSelecionado] = useState<string | null>(null)
  const e = carreira.escalacao
  const erros = validarEscalacao(carreira, e)

  function agir(acao: () => void) {
    acao()
    setSelecionado(null)
    aoMudar()
  }

  function clicar(id: string) {
    if (!selecionado) setSelecionado(id)
    else if (selecionado === id) setSelecionado(null)
    else agir(() => trocarJogadores(carreira, selecionado, id))
  }

  const elenco = elencoDe(carreira, carreira.clubeId)
  const porId = (id: string) => carreira.jogadores[id]
  const setores = atribuirSetores(e.titulares.map(porId), e.formacao)
  const titulares = e.titulares.map((id, i): Linha => ({ jogador: porId(id), setor: setores[i] }))
  const reservas = e.reservas.map((id): Linha => ({ jogador: porId(id) }))
  const escalados = new Set([...e.titulares, ...e.reservas])
  const demais = elenco
    .filter((j) => !escalados.has(j.id))
    .sort((a, b) => ORDEM[a.posicao] - ORDEM[b.posicao] || b.forca - a.forca)
    .map((jogador): Linha => ({ jogador }))

  return (
    <>
      <h1>Escalação</h1>
      <div className="controles">
        <label>
          Formação{' '}
          <select value={e.formacao} onChange={(ev) => agir(() => mudarFormacao(carreira, ev.target.value as Formacao))}>
            {Object.keys(FORMACOES).map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
        </label>
        <label>
          Postura{' '}
          <select value={e.postura} onChange={(ev) => agir(() => mudarPostura(carreira, ev.target.value as Postura))}>
            {POSTURAS.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </label>
        <button className="botao" onClick={() => agir(() => aplicarEscalacaoAutomatica(carreira))}>
          Escalação automática
        </button>
      </div>
      <p>Clique em dois Jogadores para trocá-los de lugar. Jogador fora de posição rende menos (valor em vermelho).</p>
      {erros.map((erro) => (
        <p key={erro} className="erro">
          {erro}
        </p>
      ))}
      <Tabela titulo="Titulares" linhas={titulares} selecionado={selecionado} aoClicar={clicar} />
      <Tabela titulo="Banco" linhas={reservas} selecionado={selecionado} aoClicar={clicar} />
      <Tabela titulo="Demais" linhas={demais} selecionado={selecionado} aoClicar={clicar} />
    </>
  )
}
