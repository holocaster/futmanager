# Changelog

## 0.1.1

### Corrigido

- Autosave após negociações, renovações, ajustes de escalação e respostas a propostas; recuperação de falha de gravação sem descartar a carreira em memória.
- Validação da estrutura e das referências dos saves antes de carregar ou sobrescrever um slot; saves inválidos não bloqueiam os demais.
- Tratamento de armazenamento bloqueado na leitura, gravação e exclusão, inclusive quando o getter `localStorage` lança erro.
- Vagas de lesão acompanham os setores livres da Formação atual, preservando as reposições e os limites de Substituição.
- Rodadas sem jogadores elegíveis não geram lances com autores inexistentes; desempates sem cobradores terminam de forma determinística.
- Critérios contraditórios da correção F4 substituídos por invariantes de capacidade, preservando a proposta anterior como histórico.
- Vite atualizado para uma versão corrigida dos avisos de segurança da linha 8.3.2.
- Caminhos pessoais substituídos por `$HOME` na documentação de medições.

O formato de Save permanece na versão 8; não há migração nem exclusão automática de saves existentes.
