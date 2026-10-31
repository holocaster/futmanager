# Política de segurança

## Versões atendidas

As correções de segurança são direcionadas à versão mais recente da branch `main`. Versões antigas não têm uma linha de manutenção separada. Use o código e o lockfile atuais ao verificar se uma falha ainda ocorre.

## Reportar uma vulnerabilidade

**Não publique detalhes de exploração, credenciais ou dados pessoais em issues ou pull requests públicos.**

1. Abra a aba [Security do repositório](https://github.com/holocaster/futmanager/security).
2. Se a opção **Report a vulnerability** estiver disponível, use-a para enviar um relato privado.
3. Se o reporte privado não estiver disponível, abra uma [issue](https://github.com/holocaster/futmanager/issues/new) com o título **Solicitação de canal privado de segurança**, sem detalhes da vulnerabilidade, e aguarde a indicação de um canal privado antes de compartilhar o relato.

O recurso de reporte privado depende da configuração do repositório no GitHub. Este documento não garante que ele esteja habilitado. Não há prazo garantido de resposta ou correção.

Depois que houver um canal privado, inclua:

- A versão ou o commit afetado.
- A descrição da falha, suas condições e o impacto possível.
- Passos mínimos de reprodução ou uma demonstração que não exponha terceiros.
- O navegador, a versão do Node.js e o ambiente afetado, quando relevantes.
- Uma sugestão de correção, se houver.

Remova dados pessoais de logs e capturas. Não envie senhas, tokens válidos, chaves privadas ou saves completos sem necessidade. Não teste contra sistemas de terceiros sem autorização.

## Cuidados ao executar e contribuir

- Os saves ficam no `localStorage` do navegador. Eles não são criptografados nem sincronizados pelo projeto; limpar os dados do site pode apagá-los.
- O estado local pode ser alterado por quem tem acesso ao navegador. O jogo é single-player e não oferece proteção contra manipulação de saves.
- Use `npm ci` para instalar as versões registradas no lockfile e `npm audit` para consultar avisos conhecidos das dependências.
- Não exponha o servidor de desenvolvimento do Vite à internet. Para produção, publique os arquivos gerados em `dist/` em uma hospedagem estática, preferencialmente com HTTPS.
- Revise arquivos, diffs e metadados de commits antes de publicá-los. Apagar uma credencial de um arquivo não a remove de commits anteriores; se uma credencial real vazar, revogue-a ou rotacione-a.

Para defeitos comuns de jogabilidade, apresentação ou regras, use as [issues](https://github.com/holocaster/futmanager/issues) e o [guia de contribuição](CONTRIBUTING.md).
