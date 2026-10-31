import { createContext, useContext } from 'react'
import type { Carreira } from '../motor/tipos'

export const CarreiraContext = createContext<Carreira | null>(null)

export function useCarreira(): Carreira {
  const carreira = useContext(CarreiraContext)
  if (!carreira) throw new Error('Carreira nao iniciada')
  return carreira
}
