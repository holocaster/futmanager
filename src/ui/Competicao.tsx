import { useState } from 'react'
import { artilheiros, artilheirosCopa, classificacao } from '../motor/classificacao'
import { rotuloDaData } from '../motor/copa'
import { premioDaPosicao } from '../motor/financas'
import type { Divisao, DivisaoJogavel, LinhaArtilharia, PartidaAgendada, Resultado } from '../motor/tipos'
import { useCarreira } from './contexto'
import { Escudo } from './Escudo'
import { dinheiro } from './formato'

const DIVISOES: DivisaoJogavel[] = ['A', 'B', 'C']

function useClubes() {
  const carreira = useCarreira()
  const porId = new Map(carreira.clubes.map((c) => [c.id, c]))
  return { carreira, clube: (id: string) => porId.get(id)! }
}

export function NomeClube({ clubeId, curto = false }: { clubeId: string; curto?: boolean }) {
  const { clube } = useClubes()
  const c = clube(clubeId)
  return (
    <span className="clube-nome">
      <Escudo clube={c} tamanho={16} />
      <span>{curto ? c.nomeCurto : c.nome}</span>
    </span>
  )
}

export function placar(r: Resultado): string {
  return `${r.golsCasa} x ${r.golsFora}${r.penaltis ? ` (${r.penaltis.casa} x ${r.penaltis.fora} pên.)` : ''}`
}

export function ListaPartidas({ partidas }: { partidas: PartidaAgendada[] }) {
  return (
    <ul className="lista-partidas">
      {partidas.map((j) => (
        <li key={j.casaId}>
          <NomeClube clubeId={j.casaId} curto />
          <strong className="placar">{j.resultado ? placar(j.resultado) : 'x'}</strong>
          <NomeClube clubeId={j.foraId} curto />
        </li>
      ))}
    </ul>
  )
}

export function ResultadosDaRodada({ data: indice }: { data: number }) {
  const { carreira } = useClubes()
  const data = carreira.calendario[indice]
  if (data.tipo === 'copa') return <ListaPartidas partidas={data.partidas} />
  return (
    <div className="colunas colunas-partidas">
      {DIVISOES.map((d) => (
        <div key={d}>
          <h3>Série {d}</h3>
          <ListaPartidas partidas={data.partidas.filter((j) => j.divisao === d)} />
        </div>
      ))}
    </div>
  )
}

export function zona(divisao: Divisao, posicao: number): string {
  if (posicao >= 17) return 'zona-rebaixamento'
  if (divisao !== 'A' && posicao <= 4) return 'zona-acesso'
  return ''
}

export function Classificacoes() {
  const { carreira, clube } = useClubes()
  const propria = clube(carreira.clubeId).divisao
  const [divisao, setDivisao] = useState<DivisaoJogavel>(propria === 'D' ? 'C' : propria)
  const tabela = classificacao(carreira, divisao)
  return (
    <>
      <h1>Classificação</h1>
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
              {['P', 'J', 'V', 'E', 'D', 'GP', 'GC', 'SG'].map((t) => (
                <th key={t} className="num">
                  {t}
                </th>
              ))}
              <th className="num">Prêmio</th>
            </tr>
          </thead>
          <tbody>
            {tabela.map((l, i) => (
              <tr key={l.clubeId} className={`${zona(divisao, i + 1)} ${l.clubeId === carreira.clubeId ? 'meu-clube' : ''}`}>
                <td className="num">{i + 1}</td>
                <td>
                  <NomeClube clubeId={l.clubeId} />
                </td>
                <td className="num">
                  <strong>{l.p}</strong>
                </td>
                <td className="num">{l.j}</td>
                <td className="num">{l.v}</td>
                <td className="num">{l.e}</td>
                <td className="num">{l.d}</td>
                <td className="num">{l.gp}</td>
                <td className="num">{l.gc}</td>
                <td className="num">{l.sg}</td>
                <td className="num">{dinheiro(premioDaPosicao(divisao, i + 1))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="legenda">
        {divisao !== 'A' && <span className="legenda-acesso">Acesso</span>}
        <span className="legenda-rebaixamento">{divisao === 'C' ? 'Rebaixamento (Pool da Série D)' : 'Rebaixamento'}</span>
      </p>
    </>
  )
}

export function Calendario() {
  const { carreira } = useClubes()
  const jogadas = carreira.proximaData
  const [escolhida, setEscolhida] = useState(Math.max(0, jogadas - 1))
  const meus = carreira.calendario.flatMap((d, indice) =>
    d.partidas.filter((j) => j.casaId === carreira.clubeId || j.foraId === carreira.clubeId).map((partida) => ({ indice, partida })),
  )
  return (
    <>
      <h1>Calendário</h1>
      <div className="rolagem">
        <table className="tabela">
          <thead>
            <tr>
              <th>Data</th>
              <th>Local</th>
              <th>Adversário</th>
              <th className="num">Resultado</th>
            </tr>
          </thead>
          <tbody>
            {meus.map(({ indice, partida }) => {
              const emCasa = partida.casaId === carreira.clubeId
              const r = partida.resultado
              return (
                <tr key={indice} className={indice === jogadas ? 'meu-clube' : ''}>
                  <td>{rotuloDaData(carreira, indice)}</td>
                  <td>{emCasa ? 'Casa' : 'Fora'}</td>
                  <td>
                    <NomeClube clubeId={emCasa ? partida.foraId : partida.casaId} />
                  </td>
                  <td className="num">
                    {r ? placar(emCasa ? r : { golsCasa: r.golsFora, golsFora: r.golsCasa, penaltis: r.penaltis && { casa: r.penaltis.fora, fora: r.penaltis.casa } }) : '-'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <h2>Resultados por data</h2>
      {jogadas === 0 ? (
        <p>Nenhuma data jogada ainda.</p>
      ) : (
        <>
          <label>
            Data{' '}
            <select value={escolhida} onChange={(e) => setEscolhida(Number(e.target.value))}>
              {Array.from({ length: jogadas }, (_, i) => (
                <option key={i} value={i}>
                  {rotuloDaData(carreira, i)}
                </option>
              ))}
            </select>
          </label>
          <ResultadosDaRodada data={escolhida} />
        </>
      )}
    </>
  )
}

function ListaArtilheiros({ lista }: { lista: LinhaArtilharia[] }) {
  const { carreira, clube } = useClubes()
  if (lista.length === 0) return <p>Sem gols ainda.</p>
  return (
    <div className="rolagem"><table className="tabela">
      <tbody>
        {lista.map((j, i) => (
          <tr key={j.jogadorId} className={j.origens.some((o) => o.clubeId === carreira.clubeId) ? 'meu-clube' : ''}>
            <td className="num">{i + 1}</td>
            <td>{j.nome}</td>
            <td>{j.origens.map((o) => `${clube(o.clubeId).nomeCurto}: ${o.gols}`).join(' + ')}</td>
            <td className="num">
              <strong>{j.gols}</strong>
            </td>
          </tr>
        ))}
      </tbody>
    </table></div>
  )
}

export function Artilheiros() {
  const { carreira } = useClubes()
  return (
    <>
      <h1>Artilheiros</h1>
      <div className="colunas">
        {DIVISOES.map((d) => (
          <div key={d}>
            <h3>Série {d}</h3>
            <ListaArtilheiros lista={artilheiros(carreira, d)} />
          </div>
        ))}
        <div>
          <h3>Copa do Brasil</h3>
          <ListaArtilheiros lista={artilheirosCopa(carreira)} />
        </div>
      </div>
    </>
  )
}
