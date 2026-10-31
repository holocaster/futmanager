import { artilheiros, classificacao } from '../motor/classificacao'
import { rotuloDaData } from '../motor/copa'
import { elencoDe } from '../motor/elenco'
import { atribuirSetores, FORMACOES, mudarFormacao, mudarPostura, POSICOES, POSTURAS, validarEscalacao } from '../motor/tatica'
import type { Carreira, Divisao, Formacao, Jogador, PartidaAgendada } from '../motor/tipos'
import { ListaPartidas, NomeClube, zona } from './Competicao'
import { useCarreira } from './contexto'
import { Escudo } from './Escudo'
import { CONDICAO_BAIXA, situacao } from './formato'
import { Propostas } from './Propostas'

export type Destino = 'escalacao' | 'meuElenco' | 'classificacao' | 'calendario' | 'artilheiros'

const ALTURA_SETOR = { G: 90, D: 70, M: 47, A: 20 }

function nomeCurto(nome: string): string {
  const partes = nome.split(' ')
  return partes.length > 1 ? `${partes[0][0]}. ${partes[partes.length - 1]}` : nome
}

function classeDoJogador(j: Jogador, foraDePosicao: boolean): string {
  if (j.lesao > 0 || j.suspensao > 0) return 'jogador-campo indisponivel'
  if (foraDePosicao) return 'jogador-campo fora-posicao'
  if (j.amarelos === 2) return 'jogador-campo pendurado'
  if (j.condicao < CONDICAO_BAIXA) return 'jogador-campo cansado'
  return 'jogador-campo'
}

function Campo({ aoMudar, aoIr }: { aoMudar: () => void; aoIr: (d: Destino) => void }) {
  const carreira = useCarreira()
  const e = carreira.escalacao
  const titulares = e.titulares.map((id) => carreira.jogadores[id])
  const setores = atribuirSetores(titulares, e.formacao)
  const posicionados = POSICOES.flatMap((setor) => {
    const doSetor = titulares.filter((_, i) => setores[i] === setor)
    return doSetor.map((j, i) => ({ j, setor, x: 10 + ((i + 0.5) * 80) / doSetor.length, y: ALTURA_SETOR[setor] }))
  })
  return (
    <section className="bloco area-campo" aria-label="Escalação">
      <div className="bloco-titulo">
        <h2>Escalação</h2>
        <button className="link" onClick={() => aoIr('escalacao')}>
          Abrir escalação
        </button>
      </div>
      <div className="campo">
        <span className="campo-meio" />
        <span className="campo-circulo" />
        <span className="campo-area campo-area-cima" />
        <span className="campo-area campo-area-baixo" />
        {posicionados.map(({ j, setor, x, y }) => (
          <div key={j.id} className={classeDoJogador(j, setor !== j.posicao)} style={{ left: `${x}%`, top: `${y}%` }} title={`${j.posicao} ${j.nome}, força ${j.forca}, condição ${Math.round(j.condicao)}${situacao(j) ? `, ${situacao(j)}` : ''}`}>
            <span className="disco">{j.forca}</span>
            <span className="nome">{nomeCurto(j.nome)}</span>
          </div>
        ))}
      </div>
      <div className="taticas">
        <label>
          Formação
          <select
            value={e.formacao}
            onChange={(ev) => {
              mudarFormacao(carreira, ev.target.value as Formacao)
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
                aria-pressed={p === e.postura}
                onClick={() => {
                  mudarPostura(carreira, p)
                  aoMudar()
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
      <p className="legenda-campo">
        <span>
          <span className="marca marca-pendurado" />
          Pendurado
        </span>
        <span>
          <span className="marca marca-cansado" />
          Condição abaixo de {CONDICAO_BAIXA}
        </span>
        <span>
          <span className="marca marca-fora" />
          Fora de posição ou indisponível
        </span>
      </p>
    </section>
  )
}

function ProximoJogo({ aoSimular, aoAssistir, aoEncerrar, aoIr }: { aoSimular: () => void; aoAssistir: () => void; aoEncerrar: () => void; aoIr: (d: Destino) => void }) {
  const carreira = useCarreira()
  const clube = carreira.clubes.find((c) => c.id === carreira.clubeId)!
  if (carreira.proximaData >= carreira.calendario.length) {
    return (
      <section className="proximo-jogo" aria-label="Fim da temporada">
        <div className="proximo-texto">
          <span>Todas as datas foram jogadas</span>
          <strong className="proximo-confronto">Temporada {carreira.ano} completa</strong>
          <span>
            Contratos que terminam em {carreira.ano} acabam ao encerrar.{' '}
            <button className="link" onClick={() => aoIr('meuElenco')}>
              Renovar no Elenco
            </button>
          </span>
        </div>
        <div className="proximo-acoes">
          <button className="botao" onClick={aoEncerrar}>
            Encerrar Temporada
          </button>
        </div>
      </section>
    )
  }
  const data = carreira.calendario[carreira.proximaData]
  const partida = data.partidas.find((p) => p.casaId === clube.id || p.foraId === clube.id)
  const emCasa = partida?.casaId === clube.id
  const adversario = partida && carreira.clubes.find((c) => c.id === (emCasa ? partida.foraId : partida.casaId))!
  const erros = partida ? validarEscalacao(carreira, carreira.escalacao) : []
  const posicaoAdversario = adversario && data.tipo === 'divisao' ? classificacao(carreira, adversario.divisao).findIndex((l) => l.clubeId === adversario.id) + 1 : 0
  const rotulo = `${data.tipo === 'divisao' ? `Série ${clube.divisao}, ` : ''}${rotuloDaData(carreira, carreira.proximaData)}`
  return (
    <>
      <section className="proximo-jogo" aria-label="Próximo jogo">
        <div className="proximo-texto">
          <span>
            Próximo: {rotulo}
            {adversario && (emCasa ? ', em casa' : ', fora de casa')}
          </span>
          {adversario ? (
            <strong className="proximo-confronto">
              <Escudo clube={emCasa ? clube : adversario} tamanho={26} />
              {emCasa ? `${clube.nomeCurto} x ${adversario.nomeCurto}` : `${adversario.nomeCurto} x ${clube.nomeCurto}`}
              <Escudo clube={emCasa ? adversario : clube} tamanho={26} />
            </strong>
          ) : (
            <strong className="proximo-confronto">Seu Clube não joga nesta data</strong>
          )}
          {posicaoAdversario > 0 && (
            <span>
              {adversario!.nomeCurto}: {posicaoAdversario}º na Série {adversario!.divisao}
            </span>
          )}
        </div>
        <div className="proximo-acoes">
          <button className="secundario" onClick={aoSimular} disabled={erros.length > 0}>
            Simular
          </button>
          <button className="botao" onClick={aoAssistir} disabled={erros.length > 0}>
            {adversario ? 'Jogar rodada' : 'Acompanhar rodada'}
          </button>
        </div>
      </section>
      {erros.length > 0 && (
        <div className="erros-escalacao">
          {erros.map((erro) => (
            <p key={erro} className="erro">
              {erro}
            </p>
          ))}
          <button className="link" onClick={() => aoIr('escalacao')}>
            Ajustar escalação
          </button>
        </div>
      )}
    </>
  )
}

function CaixaDeEntrada({ aoMudar, aoIr }: { aoMudar: () => void; aoIr: (d: Destino) => void }) {
  const carreira = useCarreira()
  const elenco = elencoDe(carreira, carreira.clubeId)
  const alertas = elenco.filter((j) => j.lesao > 0 || j.suspensao > 0 || j.amarelos === 2)
  const vencendo = elenco.filter((j) => j.contratoAte === carreira.ano).length
  const vazia = carreira.propostas.length === 0 && alertas.length === 0 && vencendo === 0
  return (
    <section className="bloco" aria-label="Caixa de entrada">
      <h2>Caixa de entrada</h2>
      <ul className="caixa">
        <Propostas aoMudar={aoMudar} />
        {alertas.map((j) => (
          <li key={j.id} className="caixa-item">
            <span className={j.amarelos === 2 && !j.lesao && !j.suspensao ? 'ponto ponto-alerta' : 'ponto ponto-perigo'} />
            <span className="caixa-texto">
              {j.nome} ({j.posicao}): {situacao(j).toLowerCase()}
            </span>
          </li>
        ))}
        {vencendo > 0 && (
          <li className="caixa-item">
            <span className="ponto" />
            <span className="caixa-texto">
              {vencendo} {vencendo === 1 ? 'contrato termina' : 'contratos terminam'} em {carreira.ano}.
            </span>
            <button className="link" onClick={() => aoIr('meuElenco')}>
              Renovar no Elenco
            </button>
          </li>
        )}
      </ul>
      {vazia && <p>Nada pendente.</p>}
    </section>
  )
}

function resultadoDoClube(p: PartidaAgendada, clubeId: string): 'V' | 'E' | 'D' {
  const r = p.resultado!
  const meus = p.casaId === clubeId ? r.golsCasa : r.golsFora
  const deles = p.casaId === clubeId ? r.golsFora : r.golsCasa
  return meus > deles ? 'V' : meus < deles ? 'D' : 'E'
}

function UltimaRodada({ aoIr }: { aoIr: (d: Destino) => void }) {
  const carreira = useCarreira()
  const indice = carreira.proximaData - 1
  if (indice < 0) return null
  const clube = carreira.clubes.find((c) => c.id === carreira.clubeId)!
  const data = carreira.calendario[indice]
  const partidas = data.partidas.filter((p) => (data.tipo === 'divisao' ? p.divisao === clube.divisao : p.casaId === clube.id || p.foraId === clube.id))
  const forma = carreira.calendario
    .slice(0, carreira.proximaData)
    .flatMap((d) => d.partidas.filter((p) => p.resultado && (p.casaId === clube.id || p.foraId === clube.id)))
    .slice(-5)
    .map((p) => resultadoDoClube(p, clube.id))
  return (
    <section className="bloco" aria-label="Última rodada">
      <div className="bloco-titulo">
        <h2>{data.tipo === 'divisao' ? `Série ${clube.divisao}, ${rotuloDaData(carreira, indice)}` : rotuloDaData(carreira, indice)}</h2>
        {forma.length > 0 && (
          <span className="forma" aria-label={`Últimos jogos: ${forma.join(' ')}`}>
            {forma.map((r, i) => (
              <span key={i} className={`forma-${r}`}>
                {r}
              </span>
            ))}
          </span>
        )}
      </div>
      <div className="resultados-compactos">{partidas.length > 0 ? <ListaPartidas partidas={partidas} /> : <p>Seu Clube não jogou nesta data.</p>}</div>
      <button className="link" onClick={() => aoIr('calendario')}>
        Ver calendário
      </button>
    </section>
  )
}

function TabelaLateral({ carreira, aoIr }: { carreira: Carreira; aoIr: (d: Destino) => void }) {
  const propria = carreira.clubes.find((c) => c.id === carreira.clubeId)!.divisao
  const divisao: Divisao = propria === 'D' ? 'C' : propria
  const tabela = classificacao(carreira, divisao)
  const goleadores = artilheiros(carreira, divisao, 5)
  const curto = (id: string) => carreira.clubes.find((c) => c.id === id)!.nomeCurto
  return (
    <section className="bloco area-tabela" aria-label={`Classificação Série ${divisao}`}>
      <div className="bloco-titulo">
        <h2>Série {divisao}</h2>
        <button className="link" onClick={() => aoIr('classificacao')}>
          Completa
        </button>
      </div>
      <table className="tabela tabela-compacta">
        <thead>
          <tr>
            <th className="num">#</th>
            <th>Clube</th>
            <th className="num">V</th>
            <th className="num">SG</th>
            <th className="num">Pts</th>
          </tr>
        </thead>
        <tbody>
          {tabela.map((l, i) => (
            <tr key={l.clubeId} className={`${zona(divisao, i + 1)} ${l.clubeId === carreira.clubeId ? 'meu-clube' : ''}`}>
              <td className="num">{i + 1}</td>
              <td>
                <NomeClube clubeId={l.clubeId} curto />
              </td>
              <td className="num">{l.v}</td>
              <td className="num">{l.sg}</td>
              <td className="num">
                <strong>{l.p}</strong>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="bloco-titulo artilharia-titulo">
        <h3>Artilharia</h3>
        <button className="link" onClick={() => aoIr('artilheiros')}>
          Todos
        </button>
      </div>
      {goleadores.length === 0 ? (
        <p>Sem gols ainda.</p>
      ) : (
        <ul className="artilharia">
          {goleadores.map((g) => (
            <li key={g.jogadorId} className={g.origens.some((o) => o.clubeId === carreira.clubeId) ? 'meu-clube' : ''}>
              <span>
                {g.nome} <small>{g.origens.map((o) => curto(o.clubeId)).join(', ')}</small>
              </span>
              <strong>{g.gols}</strong>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export function Painel({ aoMudar, aoSimular, aoAssistir, aoEncerrar, aoIr }: { aoMudar: () => void; aoSimular: () => void; aoAssistir: () => void; aoEncerrar: () => void; aoIr: (d: Destino) => void }) {
  const carreira = useCarreira()
  return (
    <div className="painel-grade">
      <Campo aoMudar={aoMudar} aoIr={aoIr} />
      <div className="area-centro">
        <ProximoJogo aoSimular={aoSimular} aoAssistir={aoAssistir} aoEncerrar={aoEncerrar} aoIr={aoIr} />
        <CaixaDeEntrada aoMudar={aoMudar} aoIr={aoIr} />
        <UltimaRodada aoIr={aoIr} />
      </div>
      <TabelaLateral carreira={carreira} aoIr={aoIr} />
    </div>
  )
}
