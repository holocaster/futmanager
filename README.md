# FutManager

Simulador de técnico de futebol brasileiro no navegador, inspirado em Elifoot e Brasfoot. Comande um clube, monte a escalação, negocie jogadores e acompanhe temporadas completas — tudo em português.

Projeto single-player em desenvolvimento, feito com React, TypeScript e Vite. Não exige conta nem backend próprio.

## O que você pode fazer

- Disputar as Séries A, B e C e a Copa do Brasil, com acessos e rebaixamentos.
- Escolher formações, posturas e titulares; fazer substituições durante a partida.
- Acompanhar rodadas minuto a minuto ou simular os resultados.
- Comprar, vender e trocar jogadores fictícios, responder a propostas e renovar contratos.
- Administrar salários, patrocínio, bilheteria, premiações e saldo do clube.
- Acompanhar evolução, aposentadorias, jogadores da base, classificação, artilharia e histórico de temporadas.
- Manter até três carreiras salvas no navegador.

Os clubes são reais; os jogadores são fictícios. Não há estaduais, competições continentais, multiplayer ou sincronização entre dispositivos.

## Rodar localmente

Use **Node.js 24 LTS** e npm.

```bash
git clone https://github.com/holocaster/futmanager.git
cd futmanager
npm ci
npm run dev
```

Abra o endereço informado pelo Vite no terminal, normalmente `http://localhost:5173`.

### Começar uma carreira

1. Escolha um slot e clique em **Nova carreira**.
2. Escolha o clube que deseja comandar.
3. Ajuste o elenco e a escalação no menu.
4. No painel, clique em **Jogar rodada** para acompanhar a partida ou em **Simular** para avançar diretamente.

## Saves e privacidade

Os saves ficam no `localStorage`, no navegador e endereço em que você joga. A carreira é salva após ações de gestão, ao fim de cada rodada e na virada da temporada. Uma partida em andamento não é salva minuto a minuto.

**Limpar os dados do site pode apagar suas carreiras.** Outro navegador, dispositivo, domínio ou porta não compartilha os mesmos saves. Não há backup em nuvem nem importação/exportação de saves pela interface.

O formato atual de Save é a versão **8**. Versões incompatíveis são sinalizadas, sem migração automática nem exclusão do registro. Se a gravação falhar, a interface mostra o erro; não feche a página antes de resolver a falha e tentar salvar novamente.

## Testes e build

```bash
npm test
npm run build
```

O build verifica os tipos e gera os arquivos de produção em `dist/`. Para executar a suíte com os arquivos de teste em sequência:

```bash
npm test -- --fileParallelism=false
```

A suíte inclui testes de regras, determinismo, calibração das partidas, persistência e simulações de várias temporadas. Algumas verificações são mais demoradas por simularem muitos jogos.

Para publicar o jogo, hospede o conteúdo de `dist/` em um servidor de arquivos estáticos. O servidor de `npm run dev` é apenas para desenvolvimento. A configuração atual usa o caminho base `/`; hospedar em uma subpasta exige ajustar `base` em `vite.config.ts` antes do build.

## Organização

| Caminho | Conteúdo |
| --- | --- |
| [`src/motor/`](src/motor/) | Regras e simulação em TypeScript, sem dependência do navegador ou do React. |
| [`src/ui/`](src/ui/) | Interface React e estilos. |
| [`src/save.ts`](src/save.ts) | Acesso aos slots de armazenamento. |
| [`src/save.validacao.ts`](src/save.validacao.ts) | Validação dos saves. |
| [`docs/`](docs/) | Regras, decisões e especificações. |
| [`tickets/`](tickets/) | Planejamento e registros de implementação. |

## Documentação e participação

- [Como o motor funciona](docs/MOTOR.md)
- [Vocabulário e decisões do projeto](docs/CONTEXT.md)
- [Registro de questões e correções](docs/ISSUES.md)
- [Histórico de mudanças](changelog.md)
- [Como contribuir](CONTRIBUTING.md)
- [Política de segurança](SECURITY.md)
- [Reportar um bug ou sugerir uma melhoria](https://github.com/holocaster/futmanager/issues)

## Licença

O código do projeto é distribuído sob a [licença MIT](LICENSE). Nomes e marcas de clubes pertencem aos respectivos titulares; este projeto não é afiliado aos clubes citados.
