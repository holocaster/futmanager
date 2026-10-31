import type { ClubeBase, Divisao } from '../motor/tipos'
import { Escudo } from './Escudo'

const GRUPOS: [Divisao, string][] = [
  ['A', 'Série A'],
  ['B', 'Série B'],
  ['C', 'Série C'],
  ['D', 'Pool da Série D'],
]

export function ListaClubes({ clubes, aoEscolher }: { clubes: ClubeBase[]; aoEscolher: (clubeId: string) => void }) {
  return (
    <>
      {GRUPOS.map(([d, titulo]) => {
        const doGrupo = clubes.filter((c) => c.divisao === d)
        if (doGrupo.length === 0) return null
        return (
          <section key={d}>
            <h2>{titulo}</h2>
            <div className="grade">
              {doGrupo.map((c) => (
                <button key={c.id} className="cartao-clube" onClick={() => aoEscolher(c.id)}>
                  <Escudo clube={c} />
                  <span className="cartao-texto">
                    <strong>{c.nome}</strong>
                    <small>
                      {c.cidade}/{c.uf} - Porte {c.porte}
                    </small>
                  </span>
                </button>
              ))}
            </div>
          </section>
        )
      })}
    </>
  )
}
