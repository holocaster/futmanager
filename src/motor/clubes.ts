import type { ClubeBase, Divisao, Porte } from './tipos'

const COR: Record<string, string> = {
  vermelho: '#d32f2f',
  preto: '#111111',
  branco: '#f5f5f5',
  azul: '#1565c0',
  'azul-marinho': '#0d2a5c',
  'azul-celeste': '#4fc3f7',
  verde: '#2e7d32',
  amarelo: '#fdd835',
  grená: '#7b1e3a',
  laranja: '#ef6c00',
}

type Linha = [id: string, nome: string, nomeCurto: string, cidade: string, uf: string, cor1: string, cor2: string, porte: Porte]

const SERIE_A: Linha[] = [
  ['athletico-pr', 'Athletico Paranaense', 'Athletico-PR', 'Curitiba', 'PR', 'vermelho', 'preto', 4],
  ['atletico-mg', 'Atlético Mineiro', 'Atlético-MG', 'Belo Horizonte', 'MG', 'preto', 'branco', 5],
  ['bahia', 'Bahia', 'Bahia', 'Salvador', 'BA', 'azul', 'vermelho', 4],
  ['botafogo', 'Botafogo', 'Botafogo', 'Rio de Janeiro', 'RJ', 'preto', 'branco', 5],
  ['chapecoense', 'Chapecoense', 'Chapecoense', 'Chapecó', 'SC', 'verde', 'branco', 3],
  ['corinthians', 'Corinthians', 'Corinthians', 'São Paulo', 'SP', 'branco', 'preto', 5],
  ['coritiba', 'Coritiba', 'Coritiba', 'Curitiba', 'PR', 'verde', 'branco', 4],
  ['cruzeiro', 'Cruzeiro', 'Cruzeiro', 'Belo Horizonte', 'MG', 'azul', 'branco', 5],
  ['flamengo', 'Flamengo', 'Flamengo', 'Rio de Janeiro', 'RJ', 'vermelho', 'preto', 5],
  ['fluminense', 'Fluminense', 'Fluminense', 'Rio de Janeiro', 'RJ', 'grená', 'verde', 5],
  ['gremio', 'Grêmio', 'Grêmio', 'Porto Alegre', 'RS', 'azul', 'preto', 5],
  ['internacional', 'Internacional', 'Internacional', 'Porto Alegre', 'RS', 'vermelho', 'branco', 5],
  ['mirassol', 'Mirassol', 'Mirassol', 'Mirassol', 'SP', 'amarelo', 'verde', 3],
  ['palmeiras', 'Palmeiras', 'Palmeiras', 'São Paulo', 'SP', 'verde', 'branco', 5],
  ['bragantino', 'Red Bull Bragantino', 'Bragantino', 'Bragança Paulista', 'SP', 'branco', 'vermelho', 4],
  ['remo', 'Remo', 'Remo', 'Belém', 'PA', 'azul-marinho', 'branco', 3],
  ['santos', 'Santos', 'Santos', 'Santos', 'SP', 'branco', 'preto', 4],
  ['sao-paulo', 'São Paulo', 'São Paulo', 'São Paulo', 'SP', 'vermelho', 'branco', 5],
  ['vasco', 'Vasco da Gama', 'Vasco', 'Rio de Janeiro', 'RJ', 'preto', 'branco', 4],
  ['vitoria', 'Vitória', 'Vitória', 'Salvador', 'BA', 'vermelho', 'preto', 4],
]

const SERIE_B: Linha[] = [
  ['america-mg', 'América Mineiro', 'América-MG', 'Belo Horizonte', 'MG', 'verde', 'preto', 3],
  ['athletic', 'Athletic', 'Athletic', 'São João del-Rei', 'MG', 'preto', 'branco', 2],
  ['atletico-go', 'Atlético Goianiense', 'Atlético-GO', 'Goiânia', 'GO', 'vermelho', 'preto', 3],
  ['avai', 'Avaí', 'Avaí', 'Florianópolis', 'SC', 'azul', 'branco', 3],
  ['botafogo-sp', 'Botafogo-SP', 'Botafogo-SP', 'Ribeirão Preto', 'SP', 'vermelho', 'preto', 2],
  ['ceara', 'Ceará', 'Ceará', 'Fortaleza', 'CE', 'preto', 'branco', 4],
  ['crb', 'CRB', 'CRB', 'Maceió', 'AL', 'vermelho', 'branco', 2],
  ['criciuma', 'Criciúma', 'Criciúma', 'Criciúma', 'SC', 'amarelo', 'preto', 3],
  ['cuiaba', 'Cuiabá', 'Cuiabá', 'Cuiabá', 'MT', 'verde', 'amarelo', 3],
  ['fortaleza', 'Fortaleza', 'Fortaleza', 'Fortaleza', 'CE', 'azul', 'vermelho', 4],
  ['goias', 'Goiás', 'Goiás', 'Goiânia', 'GO', 'verde', 'branco', 3],
  ['juventude', 'Juventude', 'Juventude', 'Caxias do Sul', 'RS', 'verde', 'branco', 3],
  ['londrina', 'Londrina', 'Londrina', 'Londrina', 'PR', 'azul-celeste', 'branco', 2],
  ['nautico', 'Náutico', 'Náutico', 'Recife', 'PE', 'vermelho', 'branco', 3],
  ['novorizontino', 'Novorizontino', 'Novorizontino', 'Novo Horizonte', 'SP', 'amarelo', 'preto', 2],
  ['operario-pr', 'Operário-PR', 'Operário-PR', 'Ponta Grossa', 'PR', 'preto', 'branco', 2],
  ['ponte-preta', 'Ponte Preta', 'Ponte Preta', 'Campinas', 'SP', 'preto', 'branco', 3],
  ['sao-bernardo', 'São Bernardo', 'São Bernardo', 'São Bernardo do Campo', 'SP', 'amarelo', 'preto', 2],
  ['sport', 'Sport', 'Sport', 'Recife', 'PE', 'vermelho', 'preto', 4],
  ['vila-nova', 'Vila Nova', 'Vila Nova', 'Goiânia', 'GO', 'vermelho', 'branco', 2],
]

const SERIE_C: Linha[] = [
  ['amazonas', 'Amazonas', 'Amazonas', 'Manaus', 'AM', 'amarelo', 'preto', 2],
  ['anapolis', 'Anápolis', 'Anápolis', 'Anápolis', 'GO', 'vermelho', 'branco', 1],
  ['barra-sc', 'Barra-SC', 'Barra-SC', 'Balneário Camboriú', 'SC', 'azul', 'branco', 1],
  ['botafogo-pb', 'Botafogo-PB', 'Botafogo-PB', 'João Pessoa', 'PB', 'preto', 'branco', 2],
  ['brusque', 'Brusque', 'Brusque', 'Brusque', 'SC', 'vermelho', 'amarelo', 2],
  ['caxias', 'Caxias', 'Caxias', 'Caxias do Sul', 'RS', 'grená', 'branco', 2],
  ['confianca', 'Confiança', 'Confiança', 'Aracaju', 'SE', 'azul', 'branco', 1],
  ['ferroviaria', 'Ferroviária', 'Ferroviária', 'Araraquara', 'SP', 'grená', 'branco', 2],
  ['figueirense', 'Figueirense', 'Figueirense', 'Florianópolis', 'SC', 'preto', 'branco', 2],
  ['floresta', 'Floresta', 'Floresta', 'Fortaleza', 'CE', 'verde', 'branco', 1],
  ['guarani', 'Guarani', 'Guarani', 'Campinas', 'SP', 'verde', 'branco', 3],
  ['inter-de-limeira', 'Inter de Limeira', 'Inter de Limeira', 'Limeira', 'SP', 'preto', 'branco', 1],
  ['itabaiana', 'Itabaiana', 'Itabaiana', 'Itabaiana', 'SE', 'azul', 'branco', 1],
  ['ituano', 'Ituano', 'Ituano', 'Itu', 'SP', 'vermelho', 'preto', 2],
  ['maranhao', 'Maranhão', 'Maranhão', 'São Luís', 'MA', 'azul', 'vermelho', 1],
  ['maringa', 'Maringá', 'Maringá', 'Maringá', 'PR', 'azul', 'branco', 1],
  ['paysandu', 'Paysandu', 'Paysandu', 'Belém', 'PA', 'azul-celeste', 'branco', 3],
  ['santa-cruz', 'Santa Cruz', 'Santa Cruz', 'Recife', 'PE', 'vermelho', 'preto', 3],
  ['volta-redonda', 'Volta Redonda', 'Volta Redonda', 'Volta Redonda', 'RJ', 'amarelo', 'preto', 2],
  ['ypiranga-rs', 'Ypiranga de Erechim', 'Ypiranga', 'Erechim', 'RS', 'verde', 'amarelo', 2],
]

const POOL_D: Linha[] = [
  ['abc', 'ABC', 'ABC', 'Natal', 'RN', 'preto', 'branco', 1],
  ['america-rn', 'América-RN', 'América-RN', 'Natal', 'RN', 'vermelho', 'branco', 1],
  ['csa', 'CSA', 'CSA', 'Maceió', 'AL', 'azul', 'branco', 1],
  ['joinville', 'Joinville', 'Joinville', 'Joinville', 'SC', 'vermelho', 'preto', 1],
  ['portuguesa', 'Portuguesa', 'Portuguesa', 'São Paulo', 'SP', 'vermelho', 'verde', 1],
  ['retro', 'Retrô', 'Retrô', 'Camaragibe', 'PE', 'azul', 'laranja', 1],
  ['tombense', 'Tombense', 'Tombense', 'Tombos', 'MG', 'vermelho', 'branco', 1],
  ['treze', 'Treze', 'Treze', 'Campina Grande', 'PB', 'preto', 'branco', 1],
]

function montar(linhas: Linha[], divisao: Divisao): ClubeBase[] {
  return linhas.map(([id, nome, nomeCurto, cidade, uf, cor1, cor2, porte]) => ({
    id,
    nome,
    nomeCurto,
    cidade,
    uf,
    cores: [COR[cor1], COR[cor2]],
    porte,
    divisao,
  }))
}

export const CLUBES: ClubeBase[] = [
  ...montar(SERIE_A, 'A'),
  ...montar(SERIE_B, 'B'),
  ...montar(SERIE_C, 'C'),
  ...montar(POOL_D, 'D'),
]
