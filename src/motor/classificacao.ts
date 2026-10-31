import type { Carreira, CompeticaoHistorico, Divisao, LinhaArtilharia, PartidaAgendada, LinhaClassificacao } from './tipos'

function linhas(clubeIds: readonly string[], partidas: readonly PartidaAgendada[]): Map<string, LinhaClassificacao> {
  const tabela = new Map<string, LinhaClassificacao>(
    clubeIds.map((clubeId) => [clubeId, { clubeId, p: 0, j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, sg: 0 }]),
  )
  for (const { casaId, foraId, resultado } of partidas) {
    const casa = tabela.get(casaId)
    const fora = tabela.get(foraId)
    if (!resultado || !casa || !fora) continue
    const { golsCasa, golsFora } = resultado
    for (const [l, gp, gc] of [[casa, golsCasa, golsFora], [fora, golsFora, golsCasa]] as const) {
      l.j++
      l.gp += gp
      l.gc += gc
      l.sg += gp - gc
      if (gp > gc) {
        l.v++
        l.p += 3
      } else if (gp === gc) {
        l.e++
        l.p += 1
      } else l.d++
    }
  }
  return tabela
}

const chavePrincipal = (l: LinhaClassificacao) => [l.p, l.v, l.sg, l.gp]
const chaveConfronto = (l: LinhaClassificacao) => [l.p, l.sg, l.gp]

function comparar(a: number[], b: number[]): number {
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return b[i] - a[i]
  return 0
}

export function classificar(clubeIds: readonly string[], partidas: readonly PartidaAgendada[], desempate: Record<string, number>): LinhaClassificacao[] {
  const ordenadas = [...linhas(clubeIds, partidas).values()].sort((a, b) => comparar(chavePrincipal(a), chavePrincipal(b)))
  const resultado: LinhaClassificacao[] = []
  for (let i = 0; i < ordenadas.length; ) {
    let fim = i + 1
    while (fim < ordenadas.length && comparar(chavePrincipal(ordenadas[i]), chavePrincipal(ordenadas[fim])) === 0) fim++
    const grupo = ordenadas.slice(i, fim)
    if (grupo.length > 1) {
      const ids = grupo.map((l) => l.clubeId)
      const confronto = linhas(ids, partidas.filter((j) => ids.includes(j.casaId) && ids.includes(j.foraId)))
      grupo.sort(
        (a, b) =>
          comparar(chaveConfronto(confronto.get(a.clubeId)!), chaveConfronto(confronto.get(b.clubeId)!)) ||
          desempate[a.clubeId] - desempate[b.clubeId],
      )
    }
    resultado.push(...grupo)
    i = fim
  }
  return resultado
}

export function classificacao(carreira: Carreira, divisao: Divisao): LinhaClassificacao[] {
  const ids = carreira.clubes.filter((c) => c.divisao === divisao).map((c) => c.id)
  const partidas = carreira.calendario.filter((d) => d.tipo === 'divisao').flatMap((d) => d.partidas.filter((j) => j.divisao === divisao))
  return classificar(ids, partidas, carreira.desempate)
}

function artilhariaDaCompeticao(carreira: Carreira, competicao: CompeticaoHistorico, limite: number): LinhaArtilharia[] {
  const autores = new Map<string, LinhaArtilharia>()
  for (const a of carreira.artilharia) {
    if (a.competicao !== competicao) continue
    const linha = autores.get(a.jogadorId) ?? { jogadorId: a.jogadorId, nome: a.nome, gols: 0, partidas: 0, origens: [] }
    linha.gols += a.gols
    linha.partidas += a.partidas
    if (a.gols > 0) linha.origens.push({ clubeId: a.clubeId, gols: a.gols })
    autores.set(a.jogadorId, linha)
  }
  return [...autores.values()].filter((a) => a.gols > 0)
    .sort((a, b) => b.gols - a.gols || a.partidas - b.partidas || a.jogadorId.localeCompare(b.jogadorId, 'en', { numeric: true }))
    .slice(0, limite)
}

export function artilheiros(carreira: Carreira, divisao: Divisao, limite = 10): LinhaArtilharia[] {
  return divisao === 'D' ? [] : artilhariaDaCompeticao(carreira, divisao, limite)
}

export function artilheirosCopa(carreira: Carreira, limite = 10): LinhaArtilharia[] {
  return artilhariaDaCompeticao(carreira, 'copa', limite)
}
