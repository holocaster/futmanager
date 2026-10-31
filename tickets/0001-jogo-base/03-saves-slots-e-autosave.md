# 03: Saves - 3 slots e autosave

**What to build:** A tela inicial lista 3 slots de Save (Clube, ano, Rodada, data do save, ou "vazio"). O Técnico inicia uma carreira em um slot livre (ou sobrescreve com confirmação), carrega ou exclui Saves. Ao fim de cada Rodada a carreira é salva automaticamente no slot ativo; ao recarregar a página ele continua de onde parou.

**Blocked by:** 02

**Spec:** `docs/specs/0001-jogo-base.md` - Save, Estado da carreira, Testing Decisions (Save com Storage em memória).

- [ ] Módulo de Save é o único que toca `localStorage`; recebe o `Storage` como parâmetro para testes; chaves `futmanager:save:1..3`; JSON da `Carreira` com `versao`
- [ ] Autosave no slot ativo ao fim de cada Rodada
- [ ] Save com versão diferente aparece como incompatível e não carrega; erro de cota é mostrado ao Técnico
- [ ] Testes: round-trip (salvar, carregar, simular a mesma Rodada dá o mesmo resultado que sem salvar); listar/excluir slots; versão incompatível
- [ ] UI: tela inicial de slots com novo/carregar/excluir (confirmação para sobrescrever e excluir); botão para voltar à tela inicial
- [ ] `docs/MOTOR.md`: seção Save (formato, versão, quando salva)
- [ ] `npm test` e `npm run build` (com checagem de tipos) passam; `npm run dev` abre o jogo e o fluxo deste ticket funciona manualmente
- [ ] Sem dependências além das listadas em Arquitetura do spec; sem comentários desnecessários; sem emojis
