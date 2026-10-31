import { useState } from 'react'
import type { CompeticaoHistorico, Divisao, DivisaoJogavel, JogadorNoResumo, TemporadaPassada } from '../motor/tipos'
import { useCarreira } from './contexto'
import { dinheiro } from './formato'

const COMPETICOES: [CompeticaoHistorico, string][] = [
  ['A', 'Série A'],
  ['B', 'Série B'],
  ['C', 'Série C'],
  ['copa', 'Copa do Brasil'],
]

const DIVISOES: DivisaoJogavel[] = ['A', 'B', 'C']

function ListaDeJogadores({ titulo, jogadores }: { titulo: string; jogadores: JogadorNoResumo[] }) {
  return (
    <div>
      <h3>{titulo}</h3>
      {jogadores.length === 0 ? (
        <p>Ninguém.</p>
      ) : (
        <ul>
          {jogadores.map((j, i) => (
            <li key={i}>
              {j.posicao} {j.nome} ({j.idade} anos, força {j.forca})
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function ResumoTemporada({ temporada }: { temporada: TemporadaPassada }) {
  const carreira = useCarreira()
  const nome = (id: string) => carreira.clubes.find((c) => c.id === id)!.nome
  const [divisao, setDivisao] = useState<DivisaoJogavel>('A')
  const rotulo = (d: Divisao) => (d === 'D' ? 'Pool da Série D' : `Série ${d}`)
  const meus = temporada.movimentos.filter((m) => m.clubeId === carreira.clubeId)
  return (
    <>
      <h2>Campeões e artilheiros</h2>
      <div className="rolagem"><table className="tabela">
        <thead>
          <tr>
            <th>Competição</th>
            <th>Campeão</th>
            <th>Artilheiro</th>
          </tr>
        </thead>
        <tbody>
          {COMPETICOES.map(([chave, titulo]) => {
            const a = temporada.artilheiros[chave]
            const campeao = temporada.campeoes[chave]
            return (
              <tr key={chave}>
                <td>{titulo}</td>
                <td>{campeao ? nome(campeao) : '-'}</td>
                <td>{a ? `${a.nome} (${a.origens.map((o) => `${nome(o.clubeId)}: ${o.gols}`).join(' + ')}) - ${a.gols} gols` : '-'}</td>
              </tr>
            )
          })}
        </tbody>
      </table></div>
      <p>Premiação recebida pelo seu Clube: {dinheiro(temporada.premiacaoDoTecnico)}</p>
      {meus.map((m) => (
        <p key={m.para} className="encerrada">
          Seu Clube: {rotulo(m.de)} para {rotulo(m.para)}
        </p>
      ))}
      <h2>Elenco do seu Clube</h2>
      <div className="colunas">
        <ListaDeJogadores titulo="Saíram (Contrato não renovado)" jogadores={temporada.elencoDoTecnico.saidas} />
        <ListaDeJogadores titulo="Aposentados" jogadores={temporada.elencoDoTecnico.aposentados} />
        <ListaDeJogadores titulo="Chegaram da Base" jogadores={temporada.elencoDoTecnico.base} />
        {temporada.elencoDoTecnico.repostos.length > 0 && <ListaDeJogadores titulo="Contratados para completar o Elenco" jogadores={temporada.elencoDoTecnico.repostos} />}
      </div>
      <h2>Acessos e rebaixamentos</h2>
      <div className="colunas">
        <div>
          <h3>Acessos</h3>
          <ul>
            {temporada.movimentos
              .filter((m) => m.para < m.de)
              .map((m) => (
                <li key={m.clubeId} className={m.clubeId === carreira.clubeId ? 'meu-clube' : ''}>
                  {nome(m.clubeId)}: {rotulo(m.de)} para {rotulo(m.para)}
                </li>
              ))}
          </ul>
        </div>
        <div>
          <h3>Rebaixamentos</h3>
          <ul>
            {temporada.movimentos
              .filter((m) => m.para > m.de)
              .map((m) => (
                <li key={m.clubeId} className={m.clubeId === carreira.clubeId ? 'meu-clube' : ''}>
                  {nome(m.clubeId)}: {rotulo(m.de)} para {rotulo(m.para)}
                </li>
              ))}
          </ul>
        </div>
      </div>
      <h2>Tabela final</h2>
      <div className="abas">
        {DIVISOES.map((d) => (
          <button key={d} className={d === divisao ? 'aba ativa' : 'aba'} onClick={() => setDivisao(d)}>
            Série {d}
          </button>
        ))}
      </div>
      <div className="rolagem">
        <table className="tabela">
          <thead>
            <tr>
              <th className="num">#</th>
              <th>Clube</th>
              {['P', 'J', 'V', 'E', 'D', 'SG'].map((t) => (
                <th key={t} className="num">
                  {t}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {temporada.tabelas[divisao].map((l, i) => (
              <tr key={l.clubeId} className={l.clubeId === carreira.clubeId ? 'meu-clube' : ''}>
                <td className="num">{i + 1}</td>
                <td>{nome(l.clubeId)}</td>
                <td className="num">
                  <strong>{l.p}</strong>
                </td>
                <td className="num">{l.j}</td>
                <td className="num">{l.v}</td>
                <td className="num">{l.e}</td>
                <td className="num">{l.d}</td>
                <td className="num">{l.sg}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export function Historico() {
  const { historico } = useCarreira()
  const [indice, setIndice] = useState(historico.length - 1)
  return (
    <>
      <h1>Histórico</h1>
      {historico.length === 0 ? (
        <p>Nenhuma Temporada encerrada ainda.</p>
      ) : (
        <>
          <div className="abas">
            {historico.map((h, i) => (
              <button key={h.ano} className={i === indice ? 'aba ativa' : 'aba'} onClick={() => setIndice(i)}>
                {h.ano}
              </button>
            ))}
          </div>
          <ResumoTemporada key={indice} temporada={historico[indice]} />
        </>
      )}
    </>
  )
}
