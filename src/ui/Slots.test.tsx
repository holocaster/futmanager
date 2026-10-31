import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, expect, it, vi } from 'vitest'
import { novaCarreira } from '../motor/carreira'
import { ERRO_ARMAZENAMENTO, salvar } from '../save'
import { memoria } from '../save.test-helpers'
import { App } from './App'

afterEach(() => vi.unstubAllGlobals())

it('a tela inicial mostra erro e bloqueia novas carreiras quando o getter localStorage falha', () => {
  vi.stubGlobal('window', Object.defineProperty({}, 'localStorage', {
    get: () => { throw new DOMException('bloqueado', 'SecurityError') },
  }))
  const html = renderToStaticMarkup(<App />)
  expect(html).toContain(ERRO_ARMAZENAMENTO)
  expect(html).toContain('role="alert"')
  expect(html.match(/disabled=""/g)).toHaveLength(3)
  expect(html).not.toContain('>Carregar<')
  expect(html).not.toContain('>vazio<')
})

it('um slot corrompido nao impede carregar outro slot pela tela inicial', () => {
  const storage = memoria()
  storage.setItem('futmanager:save:1', '{"versao":8,"salvoEm":0,"carreira":{}}')
  salvar(storage, 2, novaCarreira(1, 'flamengo'))
  vi.stubGlobal('window', { localStorage: storage })
  const html = renderToStaticMarkup(<App />)
  expect(html).toContain('Save incompatível')
  expect(html).toContain('Flamengo')
  expect(html.match(/>Carregar</g)).toHaveLength(1)
})
