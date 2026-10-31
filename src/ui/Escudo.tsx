import type { Clube } from '../motor/tipos'

export function Escudo({ clube, tamanho = 28 }: { clube: Pick<Clube, 'cores'>; tamanho?: number }) {
  return (
    <span
      className="escudo"
      style={{ width: tamanho, height: tamanho, background: `linear-gradient(135deg, ${clube.cores[0]} 50%, ${clube.cores[1]} 50%)` }}
    />
  )
}
