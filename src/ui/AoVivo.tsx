import { useEffect, useState } from 'react'
import { rotuloDaData } from '../motor/copa'
import { MAX_PARADAS, MAX_SUBSTITUICOES } from '../motor/partida'
import { avancarMinuto, mudarFormacaoNaPartida, mudarPosturaNaPartida, partidaDoTecnico, substituir, type PartidaDaRodada, type Rodada } from '../motor/rodada'
import { FORMACOES, POSTURAS } from '../motor/tatica'
import type { Carreira, Divisao, Formacao, PartidaAgendada } from '../motor/tipos'
import { ListaPartidas } from './Competicao'
import { useCarreira } from './contexto'
import { Escudo } from './Escudo'
import { CONDICAO_BAIXA } from './formato'

const VELOCIDADES = [
  { id: 'lenta', nome: 'Lenta', ms: 1500 },
  { id: 'normal', nome: 'Normal', ms: 500 },
  { id: 'rapida', nome: 'Rápida', ms: 120 },
  { id: 'instantanea', nome: 'Instantânea', ms: 0 },
] as const

const DIVISOES: Divisao[] = ['A', 'B', 'C']

function Mudancas({ carreira, rodada, partida, aoMudar }: { carreira: Carreira; rodada: Rodada; partida: PartidaDaRodada; aoMudar: () => void }) {
  const lado = partida.casaId === carreira.clubeId ? partida.casa : partida.fora
  const [sai, setSai] = useState('')
  const [entra, setEntra] = useState('')
  const [erro, setErro] = useState<string | null>(null)

  function trocar() {
    const resultado = substituir(carreira, rodada, sai === 'vaga' ? null : sai, entra)
    setErro(resultado)
    if (!resultado) {
      setSai('')
      setEntra('')
    }
    aoMudar()
  }

  const amarelado = (id: string) => partida.cartoes.some((c) => c.jogadorId === id && c.tipo === 'amarelo')
  const atencao = lado.titulares.filter((j) => j.condicao < CONDICAO_BAIXA || amarelado(j.id)).sort((a, b) => a.condicao - b.condicao)

  return (
    <section className="bloco mudancas" aria-label="Mudanças">
      <div className="bloco-titulo">
        <h2>Mudanças</h2>
        <span className="suave">
          {MAX_SUBSTITUICOES - lado.substituicoes} de {MAX_SUBSTITUICOES} substituições, {MAX_PARADAS - lado.paradas} de {MAX_PARADAS} paradas
        </span>
      </div>
      <div className="taticas">
        <label>
          Formação
          <select
            value={lado.formacao}
            onChange={(e) => {
              mudarFormacaoNaPartida(carreira, rodada, e.target.value as Formacao)
              aoMudar()
            }}
          >
            {Object.keys(FORMACOES).map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
        </label>
        <div className="taticas-postura">
          <span>Postura</span>
          <div className="segmentado" role="group" aria-label="Postura">
            {POSTURAS.map((p) => (
              <button
                key={p}
                aria-pressed={p === lado.postura}
                onClick={() => {
                  mudarPosturaNaPartida(carreira, rodada, p)
                  aoMudar()
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
      {atencao.length > 0 && (
        <>
          <h3>Atenção no time</h3>
          <ul className="atencao">
            {atencao.map((j) => (
              <li key={j.id}>
                <span className="atencao-pos">{j.posicao}</span>
                <span className="atencao-jogador">
                  <span>
                    {j.nome} <small className={amarelado(j.id) ? 'texto-alerta' : 'texto-destaque'}>{amarelado(j.id) ? 'amarelo no jogo' : 'cansado'}</small>
                  </span>
                  <span className="barra-condicao" aria-label={`Condição ${Math.round(j.condicao)}`}>
                    <span style={{ width: `${j.condicao}%` }} />
                  </span>
                </span>
                <button className="aba" onClick={() => setSai(j.id)}>
                  Trocar
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
      <div className="controles substituicao">
        <label>
          Sai
          <select value={sai} onChange={(e) => setSai(e.target.value)}>
            <option value="">escolha</option>
            {lado.vagas.length > 0 && <option value="vaga">Vaga (lesionado)</option>}
            {lado.titulares.map((j) => (
              <option key={j.id} value={j.id}>
                {j.posicao} {j.nome} ({Math.round(j.condicao)})
              </option>
            ))}
          </select>
        </label>
        <label>
          Entra
          <select value={entra} onChange={(e) => setEntra(e.target.value)}>
            <option value="">escolha</option>
            {lado.banco.map((j) => (
              <option key={j.id} value={j.id}>
                {j.posicao} {j.nome} ({Math.round(j.condicao)})
              </option>
            ))}
          </select>
        </label>
        <button className="botao" disabled={!sai || !entra} onClick={trocar}>
          Substituir
        </button>
      </div>
      <p className="nota">Vários Jogadores trocados na mesma pausa contam como uma parada. O intervalo não conta.</p>
      {erro && <p className="erro">{erro}</p>}
    </section>
  )
}

export function AoVivo({ rodada, aoFinalizar, aoVoltar }: { rodada: Rodada; aoFinalizar: () => void; aoVoltar: () => void }) {
  const carreira = useCarreira()
  const [velocidade, setVelocidade] = useState<(typeof VELOCIDADES)[number]['id']>('normal')
  const [pausado, setPausado] = useState(false)
  const [, setTick] = useState(0)
  const terminou = rodada.minuto >= 90
  const meu = partidaDoTecnico(carreira, rodada)
  const indiceMeu = meu ? rodada.partidas.indexOf(meu) : -1
  const nomeCurto = (id: string) => carreira.clubes.find((c) => c.id === id)!.nomeCurto

  useEffect(() => {
    if (pausado || terminou) return
    function passo(): boolean {
      const pausar = avancarMinuto(carreira, rodada).some((e) => e.pausa && e.partida === indiceMeu)
      if (rodada.minuto >= 90) aoFinalizar()
      setTick((t) => t + 1)
      if (pausar) setPausado(true)
      return pausar || rodada.minuto >= 90
    }
    if (velocidade === 'instantanea') {
      while (!passo());
      return
    }
    const id = setInterval(passo, VELOCIDADES.find((v) => v.id === velocidade)!.ms)
    return () => clearInterval(id)
  }, [pausado, terminou, velocidade, carreira, rodada, indiceMeu])

  const agendadas = carreira.calendario[rodada.data].partidas
  const outras = (): PartidaAgendada[] =>
    rodada.partidas
      .map((p, i): PartidaAgendada => ({ divisao: agendadas[i].divisao, casaId: p.casaId, foraId: p.foraId, resultado: { golsCasa: p.golsCasa, golsFora: p.golsFora, ...(p.penaltis && { penaltis: p.penaltis }) } }))
      .filter((p) => p.casaId !== meu?.casaId)

  const noIntervalo = pausado && rodada.minuto === 45

  const clube = (id: string) => carreira.clubes.find((c) => c.id === id)!

  return (
    <div className="ao-vivo">
      <div className="ao-vivo-principal">
        <section className="placar-ao-vivo" aria-label="Placar">
          <strong className="relogio">{rodada.minuto}'</strong>
          {meu ? (
            <div className="placar-times">
              <span className="placar-clube">
                <Escudo clube={clube(meu.casaId)} tamanho={24} />
                <span>{nomeCurto(meu.casaId)}</span>
              </span>
              <strong className="placar-gols">
                {meu.golsCasa}-{meu.golsFora}
              </strong>
              <span className="placar-clube">
                <span>{nomeCurto(meu.foraId)}</span>
                <Escudo clube={clube(meu.foraId)} tamanho={24} />
              </span>
            </div>
          ) : (
            <span className="placar-times">{rotuloDaData(carreira, rodada.data)}</span>
          )}
          {terminou ? (
            <button className="botao" onClick={aoVoltar}>
              Voltar ao painel
            </button>
          ) : (
            <button className="botao" onClick={() => setPausado((p) => !p)}>
              {pausado ? 'Continuar' : 'Pausar'}
            </button>
          )}
        </section>
        {!terminou && (
          <div className="segmentado segmentado-4" role="group" aria-label="Velocidade da partida">
            {VELOCIDADES.map((v) => (
              <button key={v.id} aria-pressed={v.id === velocidade} onClick={() => setVelocidade(v.id)}>
                {v.nome}
              </button>
            ))}
          </div>
        )}
        {noIntervalo && <p className="encerrada">Intervalo. Continue quando quiser.</p>}
        {terminou && <p className="encerrada">Fim da Rodada. Resultados concluídos.</p>}
        {pausado && !terminou && meu && <Mudancas carreira={carreira} rodada={rodada} partida={meu} aoMudar={() => setTick((t) => t + 1)} />}
        {meu ? (
          <ol className="narracao" aria-label="Narração">
            {[...meu.eventos].reverse().map((e, i) => (
              <li key={i} className={e.tipo}>
                <span className="minuto">{e.minuto}'</span> <span>{e.texto}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p>Seu Clube não joga nesta data. Acompanhe os placares.</p>
        )}
      </div>
      <aside className="bloco ao-vivo-demais" aria-label="Demais partidas">
        <h2>Demais partidas</h2>
        <p className="suave">{rotuloDaData(carreira, rodada.data)}</p>
        {agendadas[0]?.copa ? (
          <ListaPartidas partidas={outras()} />
        ) : (
          DIVISOES.map((d) => (
            <div key={d}>
              <h3>Série {d}</h3>
              <ListaPartidas partidas={outras().filter((p) => p.divisao === d)} />
            </div>
          ))
        )}
      </aside>
    </div>
  )
}
