# Como contribuir

Contribuições com correções, testes, documentação e melhorias de experiência são bem-vindas.

Antes de começar uma mudança grande, abra uma [issue](https://github.com/holocaster/futmanager/issues) para alinhar o problema e o escopo. Para vulnerabilidades, siga a [política de segurança](SECURITY.md), não uma issue pública com detalhes da falha.

## Preparar o ambiente

Faça um fork no GitHub e clone o seu fork. Na pasta do projeto, com Node.js 24 LTS e npm:

```bash
npm ci
git switch -c minha-contribuicao
npm run dev
```

## Reportar bugs

Inclua:

- O comportamento esperado e o que aconteceu.
- Os passos mínimos para reproduzir.
- A versão ou o commit utilizado, o navegador e o sistema operacional.
- A tela e o momento da carreira em que ocorreu: temporada, rodada e competição, quando relevantes.
- Uma captura de tela ou mensagem de erro, se ajudar, sem dados pessoais.

Os resultados dependem do estado da carreira e do gerador aleatório. Se a falha foi reproduzida por um teste, inclua a seed e a sequência de ações usadas. Não publique tokens, arquivos de configuração privados ou um save completo sem revisar seu conteúdo.

## Fazer uma alteração

- Mantenha o escopo pequeno e siga o estilo dos arquivos próximos.
- Use os termos definidos em [`docs/CONTEXT.md`](docs/CONTEXT.md).
- Mantenha as regras em `src/motor/`; não introduza React, acesso ao DOM ou armazenamento do navegador nessa pasta.
- Preserve o determinismo: o motor usa o RNG da carreira, não `Math.random`.
- Para corrigir um bug, acrescente um teste que reproduza a falha. Não enfraqueça testes existentes para fazer a suíte passar.
- Se mudar regras do jogo, atualize [`docs/MOTOR.md`](docs/MOTOR.md).
- Se mudar o formato persistido, trate a compatibilidade e a versão do Save em `src/motor/carreira.ts`, com testes de leitura e gravação. Não descarte saves silenciosamente.
- Registre mudanças relevantes em [`changelog.md`](changelog.md).
- Evite novas dependências quando o código existente ou a plataforma já resolverem o problema.

## Validar

Antes de abrir o pull request:

```bash
npm test
npm run build
git diff --check
```

Para testar apenas um arquivo durante o desenvolvimento:

```bash
npm test -- src/save.test.ts
```

Se necessário, execute a suíte completa em sequência com `npm test -- --fileParallelism=false`. Não reduza as amostras de calibração apenas para acelerar os testes.

Se alterar a interface, confira o fluxo no navegador, a navegação por teclado, as larguras pequenas e as mensagens de erro. Se alterar saves, confira também recarga da página e falhas de armazenamento.

## Abrir um pull request

1. Envie sua branch ao seu fork.
2. Abra um pull request para a branch `main` deste repositório.
3. Explique o problema, a solução e como validou. Relacione a issue, se houver.
4. Inclua capturas para alterações visuais e informe limitações ou verificações não executadas.

Não inclua `node_modules/`, `dist/`, credenciais, dados pessoais ou caminhos absolutos da sua máquina. Antes de fazer commits, confira sua identidade com `git config user.name` e `git config user.email`; prefira o endereço `noreply` fornecido pelo GitHub se quiser manter seu e-mail privado.

Ao contribuir, você concorda que sua contribuição seja distribuída sob a [licença MIT do projeto](LICENSE).
