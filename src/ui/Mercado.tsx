import { useState } from 'react'
import { elencoDe } from '../motor/elenco'
import { buscarJogadores, janelaAberta, proporCompra, proporTroca, rodadasJogadas, valorDe, type FiltroDeBusca, type RespostaDeCompra, type RespostaDeTroca } from '../motor/mercado'
import type { Jogador, Posicao } from '../motor/tipos'
import { useCarreira } from './contexto'
import { dinheiro } from './formato'

const POSICOES: Posicao[] = ['G', 'D', 'M', 'A']

const numero = (texto: string) => (texto.trim() === '' || Number.isNaN(Number(texto)) ? undefined : Number(texto))

function PainelDeProposta({ jogador, aoMudar, aoFechar }: { jogador: Jogador; aoMudar: () => void; aoFechar: () => void }) {
  const carreira = useCarreira()
  const [oferta, setOferta] = useState(String(valorDe(jogador)))
  const [resposta, setResposta] = useState<RespostaDeCompra | null>(null)
  const clube = carreira.clubes.find((c) => c.id === jogador.clubeId)!

  function enviar(valor: number) {
    const r = proporCompra(carreira, jogador.id, valor)
    setResposta(r)
    if (r.resultado === 'aceita') aoMudar()
  }

  return (
    <div className="mudancas">
      <h2>
        Proposta por {jogador.nome} ({clube.nomeCurto})
      </h2>
      <p>
        {jogador.posicao}, {jogador.idade} anos, força {jogador.forca}, valor {dinheiro(valorDe(jogador))}
      </p>
      <div className="controles">
        <label>
          Oferta (R$){' '}
          <input type="number" min={0} step={10000} value={oferta} onChange={(e) => setOferta(e.target.value)} disabled={resposta?.resultado === 'aceita'} />
        </label>
        <button className="botao" onClick={() => enviar(Number(oferta))} disabled={resposta?.resultado === 'aceita'}>
          Enviar Proposta
        </button>
        <button className="aba" onClick={aoFechar}>
          Fechar
        </button>
      </div>
      {resposta && <p className={resposta.resultado === 'aceita' ? 'encerrada' : 'erro'}>{resposta.mensagem}</p>}
      {resposta?.resultado === 'contraproposta' && (
        <div className="controles">
          <button className="botao" onClick={() => enviar(resposta.preco!)}>
            Aceitar contraproposta
          </button>
          <button className="aba" onClick={() => setResposta(null)}>
            Recusar contraproposta
          </button>
        </div>
      )}
    </div>
  )
}

function PainelDeTroca({ alvo, aoMudar, aoFechar }: { alvo: Jogador; aoMudar: () => void; aoFechar: () => void }) {
  const carreira = useCarreira()
  const meus = elencoDe(carreira, carreira.clubeId).sort((a, b) => b.forca - a.forca)
  const [meuId, setMeuId] = useState('')
  const [complemento, setComplemento] = useState('0')
  const [resposta, setResposta] = useState<RespostaDeTroca | null>(null)
  const clube = carreira.clubes.find((c) => c.id === alvo.clubeId)!
  const concluida = resposta?.resultado === 'aceita'
  return (
    <div className="mudancas">
      <h2>
        Troca por {alvo.nome} ({clube.nomeCurto})
      </h2>
      <p>
        {alvo.posicao}, {alvo.idade} anos, força {alvo.forca}, valor {dinheiro(valorDe(alvo))}
      </p>
      <div className="controles">
        <label>
          Seu Jogador{' '}
          <select value={meuId} onChange={(e) => setMeuId(e.target.value)} disabled={concluida}>
            <option value="">Escolha seu Jogador</option>
            {meus.map((j) => (
              <option key={j.id} value={j.id}>
                {j.posicao} {j.nome} ({j.idade} anos, força {j.forca}, valor {dinheiro(valorDe(j))})
              </option>
            ))}
          </select>
        </label>
        <label>
          Dinheiro (R$, negativo = você recebe){' '}
          <input type="number" step={10000} value={complemento} onChange={(e) => setComplemento(e.target.value)} disabled={concluida} />
        </label>
        <button
          className="botao"
          disabled={concluida || !meuId}
          onClick={() => {
            const r = proporTroca(carreira, meuId, alvo.id, Number(complemento))
            setResposta(r)
            if (r.resultado === 'aceita') aoMudar()
          }}
        >
          Propor Troca
        </button>
        <button className="aba" onClick={aoFechar}>
          Fechar
        </button>
      </div>
      {resposta && <p className={concluida ? 'encerrada' : 'erro'}>{resposta.mensagem}</p>}
    </div>
  )
}

function TransferenciasRecentes() {
  const carreira = useCarreira()
  const nome = (id: string) => carreira.clubes.find((c) => c.id === id)!.nomeCurto
  const lista = [...carreira.transferencias].reverse()
  return (
    <>
      <h2>Transferências recentes</h2>
      {lista.length === 0 ? (
        <p>Nenhuma Transferência ainda.</p>
      ) : (
        <div className="rolagem">
          <table className="tabela">
            <thead>
              <tr>
                <th className="num">Ano</th>
                <th className="num">Rodada</th>
                <th>Jogador</th>
                <th>De</th>
                <th>Para</th>
                <th className="num">Valor</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((t, i) => (
                <tr key={i} className={t.deId === carreira.clubeId || t.paraId === carreira.clubeId ? 'meu-clube' : ''}>
                  <td className="num">{t.ano}</td>
                  <td className="num">{t.rodada}</td>
                  <td>{t.nome}</td>
                  <td>{nome(t.deId)}</td>
                  <td>{nome(t.paraId)}</td>
                  <td className="num">{t.troca ? 'Troca' : dinheiro(t.valor)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

export function Mercado({ aoMudar }: { aoMudar: () => void }) {
  const carreira = useCarreira()
  const [posicao, setPosicao] = useState('')
  const [forcaMin, setForcaMin] = useState('')
  const [forcaMax, setForcaMax] = useState('')
  const [idadeMin, setIdadeMin] = useState('')
  const [idadeMax, setIdadeMax] = useState('')
  const [valorMax, setValorMax] = useState('')
  const [alvo, setAlvo] = useState<{ jogador: Jogador; tipo: 'compra' | 'troca' } | null>(null)
  const aberta = janelaAberta(carreira)
  const filtro: FiltroDeBusca = {
    posicao: (posicao || undefined) as Posicao | undefined,
    forcaMin: numero(forcaMin),
    forcaMax: numero(forcaMax),
    idadeMin: numero(idadeMin),
    idadeMax: numero(idadeMax),
    valorMax: numero(valorMax),
  }
  const resultado = buscarJogadores(carreira, filtro)
  const clube = (id: string) => carreira.clubes.find((c) => c.id === id)!
  const meu = clube(carreira.clubeId)
  return (
    <>
      <h1>Mercado</h1>
      <p className={aberta ? 'encerrada' : 'erro'}>
        {aberta ? 'Janela aberta' : 'Janela fechada'} ({rodadasJogadas(carreira)} Rodadas de Divisão jogadas). Saldo: {dinheiro(meu.saldo)}. Elenco: {elencoDe(carreira, meu.id).length} Jogadores.
      </p>
      <div className="controles">
        <label>
          Posição{' '}
          <select value={posicao} onChange={(e) => setPosicao(e.target.value)}>
            <option value="">todas</option>
            {POSICOES.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </label>
        <label>
          Força de <input aria-label="Força mínima" type="number" className="curto" value={forcaMin} onChange={(e) => setForcaMin(e.target.value)} /> a{' '}
          <input aria-label="Força máxima" type="number" className="curto" value={forcaMax} onChange={(e) => setForcaMax(e.target.value)} />
        </label>
        <label>
          Idade de <input aria-label="Idade mínima" type="number" className="curto" value={idadeMin} onChange={(e) => setIdadeMin(e.target.value)} /> a{' '}
          <input aria-label="Idade máxima" type="number" className="curto" value={idadeMax} onChange={(e) => setIdadeMax(e.target.value)} />
        </label>
        <label>
          Valor máximo (R$) <input type="number" step={100000} value={valorMax} onChange={(e) => setValorMax(e.target.value)} />
        </label>
      </div>
      {alvo?.tipo === 'compra' && <PainelDeProposta key={alvo.jogador.id} jogador={alvo.jogador} aoMudar={aoMudar} aoFechar={() => setAlvo(null)} />}
      {alvo?.tipo === 'troca' && <PainelDeTroca key={alvo.jogador.id} alvo={alvo.jogador} aoMudar={aoMudar} aoFechar={() => setAlvo(null)} />}
      <p className="legenda">Mostrando os {resultado.length} mais fortes da busca.</p>
      <div className="rolagem">
        <table className="tabela">
          <thead>
            <tr>
              <th>Pos</th>
              <th>Nome</th>
              <th>Clube</th>
              <th className="num">Idade</th>
              <th className="num">Força</th>
              <th className="num">Salário/mês</th>
              <th className="num">Contrato</th>
              <th className="num">Valor</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {resultado.map((j) => (
              <tr key={j.id}>
                <td>{j.posicao}</td>
                <td>{j.nome}</td>
                <td>{clube(j.clubeId).nomeCurto}</td>
                <td className="num">{j.idade}</td>
                <td className="num">{j.forca}</td>
                <td className="num">{dinheiro(j.salario)}</td>
                <td className="num">{j.contratoAte}</td>
                <td className="num">{dinheiro(valorDe(j))}</td>
                <td>
                  <span className="controles">
                    <button className="aba" disabled={!aberta} onClick={() => setAlvo({ jogador: j, tipo: 'compra' })}>
                      Propor compra
                    </button>
                    <button className="aba" disabled={!aberta} onClick={() => setAlvo({ jogador: j, tipo: 'troca' })}>
                      Propor Troca
                    </button>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <TransferenciasRecentes />
    </>
  )
}
