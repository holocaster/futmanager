import { useState } from 'react'
import { novaCarreira } from '../motor/carreira'
import { CLUBES } from '../motor/clubes'
import { fimDeTemporada } from '../motor/temporada'
import { finalizarRodada, iniciarRodada, simularRodada, type Rodada } from '../motor/rodada'
import type { Carreira } from '../motor/tipos'
import { armazenamentoLocal, carregar, ERRO_ARMAZENAMENTO, salvar } from '../save'
import { AoVivo } from './AoVivo'
import { Artilheiros, Calendario, Classificacoes } from './Competicao'
import { CarreiraContext, useCarreira } from './contexto'
import { Copa } from './Copa'
import { Escalacao } from './Escalacao'
import { Financas } from './Financas'
import { Historico, ResumoTemporada } from './Historico'
import { Mercado } from './Mercado'
import { dinheiro } from './formato'
import { Escudo } from './Escudo'
import { ListaClubes } from './ListaClubes'
import { Painel } from './Painel'
import { Slots } from './Slots'
import { TabelaElenco } from './TabelaElenco'

type Tela =
  | { nome: 'inicio' }
  | { nome: 'escolha'; slot: number }
  | { nome: 'painel' }
  | { nome: 'escalacao' }
  | { nome: 'meuElenco' }
  | { nome: 'rodada' }
  | { nome: 'clubes' }
  | { nome: 'elenco'; clubeId: string }
  | { nome: 'classificacao' }
  | { nome: 'copa' }
  | { nome: 'calendario' }
  | { nome: 'artilheiros' }
  | { nome: 'financas' }
  | { nome: 'historico' }
  | { nome: 'mercado' }
  | { nome: 'resumo' }

const MENU: [Tela['nome'], string][] = [
  ['painel', 'Painel'],
  ['escalacao', 'Escalação'],
  ['meuElenco', 'Elenco'],
  ['classificacao', 'Classificação'],
  ['copa', 'Copa'],
  ['calendario', 'Calendário'],
  ['artilheiros', 'Artilheiros'],
  ['mercado', 'Mercado'],
  ['financas', 'Finanças'],
  ['historico', 'Histórico'],
  ['clubes', 'Clubes'],
]

export function App() {
  const [carreira, setCarreira] = useState<Carreira | null>(null)
  const [slot, setSlot] = useState(0)
  const [tela, setTela] = useState<Tela>({ nome: 'inicio' })
  const [rodada, setRodada] = useState<Rodada | null>(null)
  const [erroSave, setErroSave] = useState<string | null>(null)
  const [, setVersao] = useState(0)

  function autosave(c: Carreira, s = slot) {
    setErroSave(salvar(armazenamentoLocal, s, c))
  }

  function aoMudar() {
    if (carreira) autosave(carreira)
    setVersao((v) => v + 1)
  }

  if (!carreira || tela.nome === 'inicio' || tela.nome === 'escolha') {
    return (
      <main className="pagina">
        <h1>FutManager</h1>
        {erroSave && <p className="erro" role="alert">{erroSave}</p>}
        {tela.nome === 'escolha' ? (
          <>
            <p>Escolha o Clube que você vai comandar.</p>
            <ListaClubes
              clubes={CLUBES.filter((c) => c.divisao !== 'D')}
              aoEscolher={(id) => {
                const nova = novaCarreira(Date.now(), id)
                setCarreira(nova)
                setSlot(tela.slot)
                autosave(nova, tela.slot)
                setTela({ nome: 'painel' })
              }}
            />
            <button className="botao" onClick={() => setTela({ nome: 'inicio' })}>
              Voltar
            </button>
          </>
        ) : (
          <>
            {carreira && <button className="botao" onClick={() => setTela({ nome: 'painel' })}>Voltar à carreira</button>}
            <Slots
              aoNovo={(s) => setTela({ nome: 'escolha', slot: s })}
              aoCarregar={(s) => {
                const c = carregar(armazenamentoLocal, s)
                if (!c) {
                  setErroSave(`Não foi possível carregar o Save. ${ERRO_ARMAZENAMENTO}`)
                  return
                }
                setCarreira(c)
                setSlot(s)
                setErroSave(null)
                setTela({ nome: 'painel' })
              }}
            />
          </>
        )}
      </main>
    )
  }

  const meuClube = carreira.clubes.find((c) => c.id === carreira.clubeId)!
  return (
    <CarreiraContext.Provider value={carreira}>
      {tela.nome !== 'rodada' && (
        <header className="topo">
          <div className="topo-conteudo">
            <span className="topo-clube">
              <Escudo clube={meuClube} tamanho={30} />
              <strong>{meuClube.nomeCurto}</strong>
              <span>
                {meuClube.divisao === 'D' ? 'Pool da Série D' : `Série ${meuClube.divisao}`} {carreira.ano}
              </span>
            </span>
            <nav className="menu" aria-label="Menu">
              {MENU.map(([nome, titulo]) => {
                const ativa = tela.nome === nome || (nome === 'clubes' && tela.nome === 'elenco')
                return (
                  <button key={nome} className={ativa ? 'item-menu ativa' : 'item-menu'} aria-current={ativa ? 'page' : undefined} onClick={() => setTela({ nome } as Tela)}>
                    {titulo}
                  </button>
                )
              })}
              <button className="item-menu" onClick={() => {
                autosave(carreira)
                setTela({ nome: 'inicio' })
              }}>
                Tela inicial
              </button>
            </nav>
            <span className="topo-dados">
              <span>
                Data <strong>{Math.min(carreira.proximaData + 1, carreira.calendario.length)}/{carreira.calendario.length}</strong>
              </span>
              <span>
                Saldo <strong>{dinheiro(meuClube.saldo)}</strong>
              </span>
            </span>
          </div>
        </header>
      )}
      <main className="pagina">
        {erroSave && (
          <div role="alert">
            <p className="erro">{erroSave}</p>
            <button className="aba" disabled={tela.nome === 'rodada'} onClick={() => autosave(carreira)}>Tentar salvar novamente</button>
          </div>
        )}
        {tela.nome === 'painel' && (
          <Painel
            aoMudar={aoMudar}
            aoSimular={() => {
              simularRodada(carreira)
              autosave(carreira)
              setVersao((v) => v + 1)
            }}
            aoEncerrar={() => {
              fimDeTemporada(carreira)
              autosave(carreira)
              setTela({ nome: 'resumo' })
            }}
            aoAssistir={() => {
              setRodada(iniciarRodada(carreira))
              setTela({ nome: 'rodada' })
            }}
            aoIr={(nome) => setTela({ nome })}
          />
        )}
        {tela.nome === 'rodada' && rodada && (
          <AoVivo
            rodada={rodada}
            aoFinalizar={() => {
              finalizarRodada(carreira, rodada)
              autosave(carreira)
            }}
            aoVoltar={() => {
              setRodada(null)
              setTela({ nome: 'painel' })
            }}
          />
        )}
        {tela.nome === 'escalacao' && <Escalacao aoMudar={aoMudar} />}
        {tela.nome === 'meuElenco' && (
          <>
            <h1>Elenco</h1>
            <TabelaElenco clubeId={carreira.clubeId} aoMudar={aoMudar} />
          </>
        )}
        {tela.nome === 'classificacao' && <Classificacoes />}
        {tela.nome === 'copa' && <Copa />}
        {tela.nome === 'calendario' && <Calendario />}
        {tela.nome === 'artilheiros' && <Artilheiros />}
        {tela.nome === 'financas' && <Financas />}
        {tela.nome === 'historico' && <Historico />}
        {tela.nome === 'mercado' && <Mercado aoMudar={aoMudar} />}
        {tela.nome === 'resumo' && (
          <>
            <h1>Temporada {carreira.historico[carreira.historico.length - 1].ano} encerrada</h1>
            <ResumoTemporada temporada={carreira.historico[carreira.historico.length - 1]} />
            <div className="controles">
              <button className="botao" onClick={() => setTela({ nome: 'painel' })}>
                Começar Temporada {carreira.ano}
              </button>
            </div>
          </>
        )}
        {tela.nome === 'clubes' && (
          <>
            <h1>Elencos dos clubes</h1>
            <ListaClubes clubes={carreira.clubes} aoEscolher={(clubeId) => setTela({ nome: 'elenco', clubeId })} />
          </>
        )}
        {tela.nome === 'elenco' && <ElencoDeClube clubeId={tela.clubeId} aoVoltar={() => setTela({ nome: 'clubes' })} aoMudar={aoMudar} />}
      </main>
    </CarreiraContext.Provider>
  )
}

function ElencoDeClube({ clubeId, aoVoltar, aoMudar }: { clubeId: string; aoVoltar: () => void; aoMudar: () => void }) {
  const carreira = useCarreira()
  const clube = carreira.clubes.find((c) => c.id === clubeId)!
  return (
    <>
      <button className="botao" onClick={aoVoltar}>
        Voltar
      </button>
      <header className="cabecalho-clube">
        <Escudo clube={clube} tamanho={44} />
        <div>
          <h1>{clube.nome}</h1>
          <p>
            {clube.cidade}/{clube.uf} - {clube.divisao === 'D' ? 'Pool da Série D' : `Série ${clube.divisao}`} - Porte {clube.porte}
          </p>
        </div>
      </header>
      <TabelaElenco clubeId={clubeId} aoMudar={aoMudar} />
    </>
  )
}
