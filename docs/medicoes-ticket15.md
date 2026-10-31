# Medições e verificação do ticket 15

Execução local em 2026-10-03, base `d8c403c5b3eaaaf69d469fd6be1f26c9cf20211c`. Sem staging/commit; os cinco arquivos de planejamento previamente alterados foram preservados.

## Método econômico

`src/motor/multitemporada.test.ts`: seed 1/Flamengo, 8/Ceará e 42/Guarani, 10 Temporadas completas cada, Escalação automática antes de cada data, sem negociações, renovações ou dinheiro artificial do Técnico. Copa, mercado IA, renovação IA, evolução, aposentadoria, Base e reposição continuam ligados. A referência anterior já inclui as correções de artilharia/desfalques, mas ainda usa o patrocínio constante original. A única diferença econômica posterior é o crescimento anual de 20% do patrocínio; o primeiro ano conserva exatamente a fórmula anterior.

Cada data observa as novas operações no registro, por identidade das entradas, antes de ele perder operações antigas (há no máximo 3 novas operações por data, contra capacidade de 100). Conta cada operação real, inclusive se o mesmo Jogador passar por dois Clubes na data; o destino final é verificado contra a última operação dele. Não infere atividade pela lista remanescente ao fim da Temporada. Compras são agrupadas pela Divisão do comprador; vendas e valores líquidos também constam no JSON bruto.

Os grupos financeiros são os Clubes da Divisão/Pool **da Temporada encerrada**, capturados antes dos movimentos e da zeragem. Receita operacional = patrocínio + bilheteria + premiação de Copa e posição. Despesa = salários efetivamente lançados durante o ano, não 12 vezes a folha do último dia. Saldo final inclui a premiação por posição e Transferências; operação exclui Transferências. Quantidade de negativos exclui o Clube do Técnico. Todos os grupos incluem o Técnico nos demais totais, quando ele pertence ao grupo. Não é garantia de solvência individual.

Nos quadros, valores em **R$ milhões**, ordem **A/B/C/Pool** dentro de cada célula. T1 = 2026, T10 = 2035. A folha é mensal no último dia antes da virada. Alterações esportivas e econômicas posteriores ao primeiro ano podem divergir, pois as compras mudam o consumo do RNG.

### Antes — 1/Flamengo

| T | Folha mensal | Saldo final | Receita operacional | Despesa salarial | IA negativos | Compras IA |
|---|---|---|---|---|---|---|
| 1 | 32.16/10.54/5.34/1.18 | 1025.83/284.44/101.01/11.33 | 585.47/155.08/67.86/7.56 | 384.60/127.55/64.03/14.19 | 0/0/0/0 | 7/7/5/3 |
| 2 | 33.19/8.78/4.66/1.20 | 1264.65/280.15/106.57/4.76 | 601.02/137.44/63.88/6.97 | 400.08/105.12/56.14/14.44 | 0/0/0/2 | 8/9/4/1 |
| 3 | 33.76/11.33/5.00/1.26 | 1379.74/383.66/88.12/0.30 | 579.55/163.12/60.52/7.02 | 402.82/136.45/60.08/15.16 | 0/1/1/4 | 9/4/4/0 |
| 4 | 38.30/12.29/6.30/1.22 | 1417.88/447.19/97.39/1.69 | 565.44/170.16/67.44/6.90 | 459.93/147.54/75.56/14.59 | 1/0/5/3 | 5/5/4/0 |
| 5 | 44.91/13.18/8.23/1.61 | 1453.44/416.10/101.94/-11.77 | 578.12/149.45/75.73/7.42 | 538.90/158.10/98.81/19.34 | 1/0/6/6 | 0/0/0/0 |
| 6 | 46.62/18.12/9.29/1.74 | 1378.05/411.18/84.85/-18.35 | 557.05/169.72/71.49/7.27 | 559.63/217.48/111.51/20.89 | 1/1/9/5 | 9/2/0/0 |
| 7 | 50.53/19.17/9.39/2.05 | 1262.84/456.23/5.41/-35.38 | 552.57/182.05/64.80/6.95 | 605.48/230.23/112.65/24.65 | 1/2/12/8 | 5/7/2/0 |
| 8 | 56.15/22.93/10.98/2.59 | 1199.06/211.23/9.67/-37.24 | 556.38/164.32/74.07/8.60 | 671.78/275.12/131.72/31.11 | 4/8/11/7 | 6/2/0/0 |
| 9 | 65.21/24.69/9.28/2.96 | 952.14/94.25/-20.38/-63.45 | 570.42/163.60/63.25/8.19 | 782.03/295.73/112.37/35.49 | 7/9/13/7 | 5/9/3/0 |
| 10 | 72.55/23.50/10.47/2.73 | 644.05/-34.65/-49.23/-101.77 | 579.43/153.69/65.53/7.85 | 870.21/281.99/125.68/32.79 | 8/11/15/8 | 10/1/1/0 |

### Depois — 1/Flamengo

| T | Folha mensal | Saldo final | Receita operacional | Despesa salarial | IA negativos | Compras IA |
|---|---|---|---|---|---|---|
| 1 | 32.16/10.54/5.34/1.18 | 1025.83/284.44/101.01/11.33 | 585.47/155.08/67.86/7.56 | 384.60/127.55/64.03/14.19 | 0/0/0/0 | 7/7/5/3 |
| 2 | 33.59/8.63/4.68/1.20 | 1318.44/311.62/110.82/6.06 | 670.13/152.65/70.50/8.32 | 402.21/104.35/56.25/14.44 | 0/0/0/2 | 9/6/5/2 |
| 3 | 32.97/10.63/5.56/1.18 | 1619.81/371.85/155.41/7.40 | 726.29/191.22/84.36/9.71 | 395.39/127.59/66.95/14.11 | 0/0/0/2 | 3/9/5/0 |
| 4 | 32.06/15.59/5.69/1.52 | 1881.90/597.76/140.10/16.15 | 760.47/280.03/86.46/12.86 | 385.52/186.14/68.48/18.24 | 0/0/0/4 | 4/7/7/2 |
| 5 | 42.42/15.13/7.62/1.56 | 2331.18/610.17/187.50/11.48 | 918.03/263.64/106.84/14.20 | 506.52/181.59/91.49/18.68 | 0/0/3/2 | 3/2/1/0 |
| 6 | 49.21/13.45/8.96/1.70 | 2891.99/655.31/208.00/7.22 | 1098.83/261.85/121.13/17.34 | 587.66/161.43/107.49/20.40 | 0/0/3/2 | 4/3/1/1 |
| 7 | 54.36/14.84/9.16/1.75 | 3235.68/973.67/296.28/15.88 | 1219.70/340.75/139.93/20.14 | 652.35/178.24/109.94/21.01 | 0/1/3/1 | 6/4/1/0 |
| 8 | 58.08/19.62/9.49/2.37 | 3649.01/1429.75/321.05/31.57 | 1336.93/465.21/156.67/27.07 | 698.16/235.48/113.90/28.46 | 0/0/3/2 | 6/0/0/0 |
| 9 | 67.96/19.16/10.56/2.69 | 4729.04/1342.85/455.61/28.46 | 1661.44/442.98/190.57/32.72 | 814.00/230.02/126.80/32.31 | 0/0/0/3 | 8/1/4/0 |
| 10 | 69.73/22.08/12.10/2.32 | 5938.89/1448.72/580.02/43.35 | 1961.24/506.61/226.48/34.89 | 836.00/265.02/145.33/27.85 | 0/0/2/1 | 6/2/3/0 |

### Antes — 8/Ceará

| T | Folha mensal | Saldo final | Receita operacional | Despesa salarial | IA negativos | Compras IA |
|---|---|---|---|---|---|---|
| 1 | 30.67/10.04/4.96/1.27 | 1049.57/280.86/104.57/7.35 | 574.19/160.83/66.70/6.94 | 368.01/120.50/59.52/15.28 | 0/0/0/1 | 6/3/8/6 |
| 2 | 29.44/10.57/3.86/1.23 | 1308.48/296.83/99.08/5.25 | 587.94/155.88/57.30/6.97 | 352.83/126.51/46.62/14.85 | 0/0/0/3 | 4/10/6/4 |
| 3 | 31.59/11.30/4.58/1.30 | 1331.27/484.09/101.30/14.42 | 554.40/184.62/58.62/8.53 | 378.20/136.02/54.95/15.57 | 0/0/1/2 | 8/5/5/1 |
| 4 | 33.88/14.05/5.65/1.56 | 1434.78/519.71/104.06/15.77 | 543.81/186.94/64.86/9.07 | 406.02/168.65/68.11/18.66 | 1/1/3/3 | 5/5/1/1 |
| 5 | 41.07/15.23/7.06/1.91 | 1682.53/329.75/96.64/-3.30 | 589.66/150.78/66.60/7.54 | 492.89/182.70/84.72/22.96 | 1/2/5/5 | 0/0/0/0 |
| 6 | 47.61/17.59/6.86/1.61 | 1541.32/443.10/63.12/-14.18 | 577.97/167.25/59.61/6.87 | 570.74/211.61/82.30/19.32 | 2/3/6/6 | 8/2/1/0 |
| 7 | 47.82/22.12/7.85/1.76 | 1181.47/679.99/24.16/-4.16 | 522.49/210.65/61.89/7.66 | 573.47/265.61/94.34/21.18 | 4/4/11/6 | 11/6/1/1 |
| 8 | 57.55/20.83/9.50/1.81 | 1402.30/242.48/-8.09/-21.37 | 581.22/156.44/64.79/7.66 | 690.44/250.06/114.02/21.73 | 4/8/12/6 | 3/1/1/0 |
| 9 | 62.57/23.78/9.97/2.04 | 1191.99/50.89/35.70/-29.65 | 575.68/161.07/69.70/7.47 | 750.75/285.39/119.67/24.51 | 7/12/11/7 | 8/0/2/1 |
| 10 | 66.46/24.36/10.70/2.36 | 1036.06/-105.05/-83.06/-36.01 | 582.19/155.32/64.03/7.70 | 797.46/291.85/128.34/28.57 | 7/12/14/6 | 7/5/4/2 |

### Depois — 8/Ceará

| T | Folha mensal | Saldo final | Receita operacional | Despesa salarial | IA negativos | Compras IA |
|---|---|---|---|---|---|---|
| 1 | 30.67/10.04/4.96/1.27 | 1049.57/280.86/104.57/7.35 | 574.19/160.83/66.70/6.94 | 368.01/120.50/59.52/15.28 | 0/0/0/1 | 6/3/8/6 |
| 2 | 29.44/10.57/3.86/1.23 | 1376.68/314.17/105.01/6.59 | 656.14/173.22/63.24/8.32 | 352.83/126.51/46.62/14.85 | 0/0/0/3 | 4/10/6/4 |
| 3 | 32.05/11.21/4.58/1.30 | 1479.76/602.60/121.09/19.47 | 690.93/232.28/71.67/12.12 | 380.50/135.59/54.89/15.57 | 0/0/1/2 | 8/6/4/0 |
| 4 | 34.60/13.81/5.29/1.58 | 1935.37/583.74/160.04/22.55 | 794.65/245.65/87.32/14.43 | 415.41/165.49/63.44/18.93 | 0/1/0/2 | 8/2/0/0 |
| 5 | 40.73/17.43/6.38/1.62 | 2281.70/752.53/152.21/24.62 | 906.28/287.50/93.96/15.56 | 488.73/209.18/76.55/19.47 | 0/0/2/1 | 0/0/0/0 |
| 6 | 48.98/18.67/6.44/2.28 | 2630.24/958.31/184.85/17.62 | 1028.66/344.67/102.05/20.67 | 587.38/224.01/77.34/27.39 | 0/0/1/2 | 2/2/0/0 |
| 7 | 51.78/19.42/7.20/2.31 | 3476.08/808.15/251.05/15.89 | 1246.89/335.87/123.85/22.55 | 621.03/233.87/86.37/27.72 | 0/1/2/2 | 8/5/0/1 |
| 8 | 57.19/21.40/9.45/1.85 | 4175.26/995.78/269.99/33.70 | 1441.44/387.18/149.25/24.34 | 686.26/256.76/113.45/22.19 | 0/1/4/0 | 1/0/0/0 |
| 9 | 64.33/24.12/9.97/2.36 | 4880.23/1377.80/284.02/51.56 | 1647.91/485.14/164.28/32.03 | 769.62/292.22/120.27/28.35 | 1/1/3/0 | 7/5/2/1 |
| 10 | 65.97/27.94/10.64/2.39 | 5745.18/1779.42/426.47/82.03 | 1882.40/599.95/201.92/38.61 | 790.92/336.05/127.73/28.69 | 1/1/2/0 | 10/5/3/0 |

### Antes — 42/Guarani

| T | Folha mensal | Saldo final | Receita operacional | Despesa salarial | IA negativos | Compras IA |
|---|---|---|---|---|---|---|
| 1 | 29.81/9.59/4.90/1.18 | 1059.41/288.74/104.12/11.25 | 579.62/158.15/67.71/6.75 | 357.58/115.08/58.81/14.24 | 0/0/1/0 | 4/6/11/0 |
| 2 | 30.74/8.68/4.06/1.22 | 1339.40/296.81/95.68/6.89 | 604.66/139.49/60.19/7.19 | 368.51/104.41/48.71/14.66 | 0/0/1/2 | 7/9/5/3 |
| 3 | 30.51/11.74/4.14/1.36 | 1467.45/362.19/137.97/9.16 | 580.51/157.39/63.53/7.47 | 363.17/141.82/49.56/16.37 | 0/1/0/2 | 10/7/2/4 |
| 4 | 35.17/12.92/5.75/1.43 | 1481.13/482.17/144.87/11.60 | 547.60/181.58/68.88/7.91 | 421.73/154.80/69.27/17.18 | 0/1/1/3 | 7/5/4/0 |
| 5 | 43.14/15.27/5.50/2.06 | 1625.38/395.54/128.20/-11.47 | 579.46/161.45/61.03/7.47 | 517.62/183.12/66.04/24.74 | 0/2/2/6 | 7/3/0/0 |
| 6 | 45.87/16.93/6.90/1.74 | 1702.75/322.39/69.89/-4.08 | 582.17/162.90/58.97/7.62 | 550.91/203.72/82.80/20.93 | 0/3/7/5 | 9/4/6/0 |
| 7 | 52.61/17.17/9.66/1.75 | 1549.20/399.11/-8.96/-13.53 | 564.03/172.41/66.59/6.94 | 632.21/206.03/115.88/20.98 | 1/2/9/6 | 6/0/0/0 |
| 8 | 56.20/21.52/9.21/1.87 | 1393.36/305.66/-11.45/-18.35 | 581.35/155.32/65.44/7.12 | 674.33/258.37/110.70/22.43 | 3/7/10/6 | 4/10/4/0 |
| 9 | 65.81/20.12/10.13/2.46 | 1111.10/245.80/-52.29/-8.01 | 581.70/156.28/62.97/8.67 | 789.33/241.85/121.58/29.48 | 5/8/15/6 | 10/6/1/0 |
| 10 | 73.25/26.50/9.73/2.21 | 912.08/-89.83/-27.32/-27.48 | 587.33/148.15/68.03/7.70 | 879.45/317.20/117.12/26.60 | 5/12/12/7 | 7/8/3/1 |

### Depois — 42/Guarani

| T | Folha mensal | Saldo final | Receita operacional | Despesa salarial | IA negativos | Compras IA |
|---|---|---|---|---|---|---|
| 1 | 29.81/9.59/4.90/1.18 | 1059.41/288.74/104.12/11.25 | 579.62/158.15/67.71/6.75 | 357.58/115.08/58.81/14.24 | 0/0/1/0 | 4/6/11/0 |
| 2 | 30.74/8.68/4.06/1.22 | 1409.00/312.55/101.95/8.24 | 674.26/155.23/66.47/8.54 | 368.51/104.41/48.71/14.66 | 0/0/0/1 | 7/9/5/3 |
| 3 | 30.06/11.80/4.19/1.40 | 1694.13/411.24/157.30/9.87 | 721.90/199.44/78.01/10.75 | 361.21/141.34/50.29/16.45 | 0/0/0/2 | 6/10/5/2 |
| 4 | 34.05/13.38/5.75/1.58 | 1997.47/546.49/200.40/13.49 | 797.47/237.48/93.58/14.14 | 407.10/161.99/69.19/19.09 | 0/0/0/3 | 9/5/9/1 |
| 5 | 41.98/15.74/7.23/1.85 | 2351.61/708.69/168.53/29.63 | 895.67/287.37/101.87/17.24 | 503.71/188.84/86.75/22.23 | 0/0/1/2 | 2/0/0/0 |
| 6 | 48.78/14.79/7.20/1.72 | 2930.78/726.78/183.97/43.22 | 1080.13/285.00/110.53/20.62 | 585.32/177.53/86.45/20.68 | 0/1/2/0 | 7/2/2/0 |
| 7 | 51.81/17.80/8.13/1.94 | 3572.71/799.26/227.37/57.14 | 1246.94/329.90/126.78/24.44 | 621.93/213.53/97.55/23.34 | 1/1/2/1 | 3/1/0/0 |
| 8 | 58.21/18.65/8.41/2.48 | 4423.91/788.04/346.67/47.02 | 1468.08/348.23/153.42/30.45 | 696.64/223.76/100.90/29.70 | 0/2/0/2 | 9/0/0/0 |
| 9 | 60.58/25.95/9.45/2.16 | 4625.56/1632.52/409.85/75.53 | 1554.12/550.30/176.02/35.22 | 725.99/311.83/114.04/25.98 | 1/1/0/1 | 5/6/3/2 |
| 10 | 69.44/23.03/10.25/2.45 | 5779.24/1568.45/738.40/101.69 | 1892.93/530.38/245.11/42.35 | 837.39/276.61/123.01/29.45 | 0/1/0/0 | 4/2/0/0 |

### Metas tardias

| Cenário | Operação média do Pool T8–10 antes (R$ mi) | Depois (R$ mi) | Transferências totais T8/T9/T10 depois |
|---|---:|---:|---|
| 1/Flamengo | -24,91 | 2,02 | 6/13/11 |
| 8/Ceará | -17,33 | 5,25 | 1/15/18 |
| 42/Guarani | -18,34 | 7,63 | 9/16/6 |

Os três critérios passam sem exigir que todos os Clubes estejam solventes. O Pool pode ter ano negativo (Flamengo T8) e Clubes endividados, mesmo com média positiva. Os grandes superávits das Divisões estão expostos nas tabelas; não se afirma estabilidade nominal do caixa nem equilíbrio de todas as posições/seeds além do horizonte medido. Crescimento nominal de receita não garante solvência universal ou precisão financeira para um horizonte ilimitado. A primeira Temporada do 10º colocado continua coberta pelo teste existente: pelo menos 27 de 30 seeds em cada Divisão na faixa 80%–150%, além das regressões pós-premiação seeds 1–3.

## Força, invariantes e Save

Média ponderada por Jogadores vivos, após cada virada; inicial antes da primeira data. Ordem Divisões A/B/C/Pool e Portes 1/2/3/4/5. Valores arredondados a duas casas, depois da calibração econômica; o JSON bruto inclui também as médias anteriores ao ajuste.

| Cenário | T | Divisões | Portes |
|---|---|---|---|
| 1/Flamengo | Inicial | 71.38/62.58/56.98/51.34 | 52.13/58.44/63.49/70.59/74.38 |
| 1/Flamengo | 1 | 72.08/61.81/56.02/51.77 | 51.73/58.29/63.07/70.45/74.45 |
| 1/Flamengo | 2 | 71.64/62.48/57.17/52.03 | 52.17/58.81/63.58/70.59/74.66 |
| 1/Flamengo | 3 | 70.37/65.06/56.36/52.95 | 52.35/59.10/64.12/70.63/75.03 |
| 1/Flamengo | 4 | 72.61/64.61/58.36/53.60 | 53.67/60.23/65.03/72.26/76.02 |
| 1/Flamengo | 5 | 73.68/64.12/59.33/53.38 | 53.80/61.13/65.62/72.17/76.33 |
| 1/Flamengo | 6 | 74.04/64.53/59.69/53.47 | 54.37/61.04/66.09/72.32/77.09 |
| 1/Flamengo | 7 | 73.71/65.50/59.48/54.16 | 54.62/61.22/66.04/72.72/77.47 |
| 1/Flamengo | 8 | 74.69/64.90/59.65/55.18 | 54.74/61.68/66.32/73.01/77.70 |
| 1/Flamengo | 9 | 74.47/65.71/60.68/55.02 | 55.53/61.91/67.02/73.24/77.86 |
| 1/Flamengo | 10 | 74.54/66.23/59.90/56.09 | 55.14/62.33/67.06/73.45/78.03 |
| 8/Ceará | Inicial | 71.61/62.17/56.47/52.02 | 51.84/57.84/64.11/70.01/74.69 |
| 8/Ceará | 1 | 70.96/62.95/54.80/52.32 | 51.87/57.29/63.73/69.49/73.61 |
| 8/Ceará | 2 | 71.30/63.39/55.49/53.59 | 52.66/57.98/64.14/69.65/74.53 |
| 8/Ceará | 3 | 71.36/63.59/56.60/53.96 | 53.16/58.66/64.39/70.23/74.60 |
| 8/Ceará | 4 | 72.36/65.07/57.24/53.55 | 53.81/59.34/65.77/70.66/75.89 |
| 8/Ceará | 5 | 73.24/65.24/57.61/55.53 | 54.18/60.10/66.24/71.50/76.92 |
| 8/Ceará | 6 | 73.67/65.61/57.86/55.10 | 54.54/60.04/66.96/71.70/76.81 |
| 8/Ceará | 7 | 74.19/65.35/59.49/54.53 | 55.38/60.20/67.25/72.46/77.39 |
| 8/Ceará | 8 | 74.82/66.12/59.07/55.52 | 55.41/60.94/67.60/72.88/77.88 |
| 8/Ceará | 9 | 74.11/66.53/59.14/55.69 | 55.45/60.87/67.39/72.94/77.93 |
| 8/Ceará | 10 | 74.98/66.18/59.79/55.69 | 55.77/61.45/67.42/73.39/78.21 |
| 42/Guarani | Inicial | 71.27/62.18/56.43/52.41 | 52.08/58.15/63.43/69.72/74.65 |
| 42/Guarani | 1 | 71.72/62.34/55.06/51.23 | 51.48/57.43/63.36/69.70/74.28 |
| 42/Guarani | 2 | 71.12/63.22/55.38/51.53 | 51.55/57.90/63.75/70.01/74.07 |
| 42/Guarani | 3 | 71.57/63.23/56.44/53.58 | 52.46/58.23/64.20/70.86/75.01 |
| 42/Guarani | 4 | 72.57/63.63/57.51/55.20 | 53.88/59.14/65.10/71.70/75.49 |
| 42/Guarani | 5 | 73.42/64.08/57.87/55.30 | 54.52/59.79/65.42/71.50/76.47 |
| 42/Guarani | 6 | 73.46/65.30/58.12/56.17 | 54.95/60.52/66.15/72.02/76.62 |
| 42/Guarani | 7 | 74.57/65.36/58.49/57.48 | 55.28/61.36/66.55/72.58/77.67 |
| 42/Guarani | 8 | 73.88/66.60/59.02/56.30 | 55.03/61.94/66.85/72.65/77.77 |
| 42/Guarani | 9 | 74.59/65.91/59.82/55.96 | 55.44/62.07/66.76/73.03/78.00 |
| 42/Guarani | 10 | 74.14/66.55/59.62/56.46 | 55.60/61.99/67.06/72.50/78.41 |

Em cada data dos três cenários verificam-se titulares/banco elegíveis de todos os lados, IDs/referências de Jogadores vivos, Propostas e Transferências, resultados inteiros não negativos, avanço do calendário, Elencos 16–32/2 G, valores finitos e limites de força/potencial/condição/moral/idade/vínculo/disciplina. Em cada virada: 20/20/20/8 Clubes, 22–32/2 G, ano/Histórico, 48 datas, Copa de 64, desempate novo, estatísticas/extrato/artilharia atual zerados e Histórico anterior intacto. A deriva de cada Divisão é testada contra sua própria média inicial a cada uma das 10 viradas, com limite de 15 pontos; não se confunde acesso/rebaixamento com evolução individual.

O cenário 42/Guarani repete as primeiras cinco Temporadas e compara o JSON da **Carreira completa**, usando `simularRodada` na repetição e o fluxo minuto a minuto na primeira execução. Round-trip após cinco viradas conserva cinco entradas completas de Histórico e continuação idêntica; regressões de artilharia/Save também conservam origens atuais após Transferências/Trocas, antes de serem zeradas na virada. Não se exige autor histórico ainda vivo.

| Cenário | JSON Carreira após 5 viradas (bytes UTF-8) | Envelope salvo (bytes UTF-8) |
|---|---:|---:|
| 1/Flamengo | 590122 | 590170 |
| 8/Ceará | 587588 | 587636 |
| 42/Guarani | 591525 | 591573 |

Todos abaixo de 2.000.000, sem descartar Histórico. O envelope tem 48 bytes adicionais nesta execução, com timestamp de 13 dígitos. Versão 8; versões anteriores incompatíveis, sem migração. Teste de cota preserva o registro anterior e a UI mostra o erro. O orçamento não promete cota universal nem espaço infinito.

## Testes, tempos e evidência

| Comando/ciclo | Resultado | Tempo/evidência |
|---|---|---|
| `npx vitest run src/motor/artilharia.test.ts` antes da correção | 5 falhas esperadas | Origem perdida/linhas dependentes do Clube atual, 782 ms |
| `npx vitest run src/motor/tatica.test.ts` antes da correção | 2 falhas esperadas, 14 passam | M/A penalizados nos primeiros setores D; ausência de G desloca a linha, 1,39 s |
| `npx vitest run src/motor/multitemporada.test.ts --maxWorkers=1` antes do patrocínio | 3 falhas esperadas | Somente meta operacional do Pool; 14,11/13,53/21,16 s por cenário (Guarani inclui repetição de cinco); total 49,14 s |
| `npx vitest run src/motor/financas.test.ts -t 'patrocinio cresce\|virada preserva'` | Vermelho, depois verde | 2 passam após ajuste; igualdade Técnico/IA, lançamentos e dívida preservada |
| `npx vitest run src/motor/multitemporada.test.ts --maxWorkers=1 --silent=false` depois | 3 passam | 13,48/13,33/19,21 s por cenário; JSON completo no log abaixo |
| `npx vitest run src/motor/temporada.test.ts -t '4 sobem e 4 descem' --reporter=verbose` | 1 passa | Teste isolado 2179 ms, comando 2,68 s |
| `npm test` padrão, sem serializar | 246 testes, 16 arquivos passam | 76,44 s, nenhuma falha/timeout; inclui todas as calibrações táticas, mercado, primeira Temporada e integrações novas |
| `npm run build` | Tipos e Vite passam | 49 módulos; build 558 ms, bundle JS 297,60 kB / gzip 90,69 kB |
| `git diff --check` | Passa | Sem erros de whitespace |

Os testes existentes que simulam uma Temporada completa e ainda estavam no default receberam 30 s explícitos, inclusive acesso/rebaixamento. Preparações compartilhadas de Copa e classificação agora usam `beforeAll` com 30 s. Não foram reduzidos N, metas ou limites já explícitos: continuam 20/30/60/120 s nos testes anteriores; integrações de 10 anos têm 120 s por cenário, inclusive a repetição Guarani. Os tempos isolados (cerca de 2,18 s/ano e 13–19 s/cenário) e a suíte padrão verde dão margem, sem usar serial como substituto. A referência serial anterior de 232 testes/183,55 s é de outra execução; não é comparação controlada de desempenho.

Artefatos locais desta execução (não fazem parte do Save e podem desaparecer com limpeza de `/tmp`):

- `/tmp/opencode/ticket15-economia-antes.log`: três JSONs, por ano/Divisão/Porte, categorias financeiras individuais, compras e vendas; erros esperados da meta anterior.
- `/tmp/opencode/ticket15-economia-depois.log`: três JSONs equivalentes, depois do ajuste.
- `/tmp/opencode/ticket15-npm-test.log`: suíte padrão final.
- `/tmp/opencode/ticket15-resumir.mjs` e `ticket15-tabelas.mjs`: resumos dos JSONs; para novas medições usar o comando integrado com `--silent=false`.

## Navegador e celular

`npm run dev -- --host 127.0.0.1`, `http://localhost:5173`. Chromium **149.0.7827.55**, navegador visível, larguras **320/390/1280 px**, altura 850 px. Playwright já instalado fora do projeto; foi necessário baixar seu Chromium no cache do operador, sem dependências novas no repositório. O script exploratório é externo à suíte, não adiciona framework de UI ao projeto.

Primeira inspeção reproduziu overflow: Troca a 320 px (conteúdo 391 px) e 390 px (402 px), Rodada pausada a 320 px (396 px). Causas: largura intrínseca de `select`/label, tabela de resultados sem contêiner e grid mínimo fixo. Corrigidos com limites de largura dos controles, grid responsivo, rolagem local e placar flexível. Não se mascara overflow com `overflow-x: hidden` na página.

Verificação final: **108 cenários (36 por largura)**, nenhum erro JavaScript, nenhum controle externo a tabela cortado, largura de conteúdo igual à largura útil da página em todos. As tabelas podem rolar horizontalmente no próprio contêiner; cliques e foco nos controles distantes deslocam somente o contêiner. Capturas foram inspecionadas visualmente, inclusive renovação, desfalques, Troca, Rodada pausada, resumo e Histórico.

| Área | Cenários verificados nas três larguras |
|---|---|
| Slots/escolha | Vazio, nova carreira, escolher Flamengo, Save existente, incompatível versão 7, confirmação/exclusão |
| Painel/Elencos | Propostas reais geradas seed 1/Flamengo; Elenco próprio e Santos; saldo, próxima data, situações e resultados |
| Renovação | Moral 100 e 0, vínculo de quatro anos; aviso visível antes de confirmar duração 1; seleção 5 não altera vínculo; retorno a 1 e confirmação preservam término e mostram salário efetivo |
| Escalação | Automática; seleção por teclado/Enter e foco visível; seed 4/Santos com G/2 D/4 M/2 A; nove setores visíveis iguais aos usados pelo motor |
| Rodada ao vivo | Pausa, Formação, Postura, Substituição (restam 4/5), velocidade instantânea, pausas automáticas, final e autosave; mudança pausada 3-5-2 com nove em campo sem inventar titulares |
| Competições | Classificação, Copa, calendário/resultados e artilheiros com gols reais |
| Mercado | Busca por força, compra com erro de oferta, venda com preço inválido/válido, Propostas aceitar/recusar/contrapropor inválido, Troca desabilitada sem seleção e habilitada com seleção, resultado e registro |
| Finanças/Histórico | Extrato, encerramento real seed 16/Anápolis, resumo, campeões/artilheiros de origem, tabelas e mudanças do Elenco |
| Pool | Seed 16/Anápolis rebaixado como fixture; Escalação vazia, data de Divisão sem Partida do Técnico: botão disponível, placares e autosave; nenhuma validação indevida |
| Erros | Cota de Storage simulada no navegador: mensagem legível, anterior preservado; versão incompatível no slot |

Clubes mantêm cores apenas nos escudos/detalhes; texto e controles usam o tema escuro comum. Botões/inputs/selects móveis têm altura mínima de 36 px, rótulos acessíveis e foco explícito. A verificação usa viewport de Chromium, não um aparelho físico nem Safari/iOS; não é promessa de compatibilidade com todos os navegadores.

Evidência/reprodução: `/tmp/opencode/playwright-ticket15-completo.cjs`, `/tmp/opencode/ticket15-browser-completo.log`, `/tmp/opencode/ticket15-browser-audit.log` e capturas `/tmp/opencode/ticket15-{320,390,1280}-*.png`. Comando usado: `NODE_PATH="$HOME/.claude/skills/playwright-skill/node_modules" node run.js /tmp/opencode/playwright-ticket15-completo.cjs`, na pasta `$HOME/.config/opencode/skills/playwright-skill`. URL substituível por `TARGET_URL`. Scripts e capturas ficam fora do projeto; tickets/index continuam sob responsabilidade do orquestrador.

## Correção — rodada 1 (F1, F2, F3)

Snapshot inicial desta rodada: `5a0b8c0210c9907a3943fd683197bdced8da4370`; base imutável `d8c403c5b3eaaaf69d469fd6be1f26c9cf20211c`. Correções sem commit/staging/push. Preservados `.ai/PROJECT_STATE.md`, brief e registro de revisão, já alterados pelo orquestrador. F4 (vaga de lesão antiga após mudar Formação) continua preexistente, aceito/logado no brief, sem alteração nesta rodada.

### Provas e mudanças

- **F1:** regressão pública seed 4/Santos, nove elegíveis G/2D/4M/2A, automática + `trocarJogadores(G,D)`. Antes, a validação retorna erro de goleiro apesar dos setores D/G/D/M/M/M/M/A/A naturais. Depois, `validarEscalacao` e `iniciarRodada` passam e preservam a ordem manual; Escalação completa com G deslocado ainda falha e ID inexistente retorna erro. A validação passou a consultar os setores efetivos, sem mudar a regra de atribuição.
- **F2:** três regressões com G/2D/6M/A, M 95/90/85/80/75/70, condição 100/moral 70, em 4-4-2, 3-5-2 e 5-3-2. Antes, excedentes ocupam os setores M e deslocam naturais mais fortes. Depois, a automática curta mantém os naturais selecionados primeiro (ordem de inserção já existente), antes dos improvisados: Técnico usa os melhores 4/5/3 M da Formação; IA mantém os melhores quatro no 4-4-2. Permutas manuais posteriores continuam na ordem escolhida e podem colocar deliberadamente um M mais fraco no setor natural; a atribuição não reordena manuais.
- **F3:** probes `novaCarreira(1, ...)`, apenas mudando `ano` para 5826/10000/MAX_SAFE_INTEGER e chamando `pagarDataDeDivisao`, reproduzem finanças infinitas antes. Depois, 68 Clubes têm saldo/extrato finitos, a receita é idêntica para Técnico/IA, dívida prévia só muda por lançamentos e o Save conserva o objeto completo. Teto comum de crescimento derivado de `Number.MAX_SAFE_INTEGER` e do maior patrocínio base, antes da potência/multiplicação; primeiro ano afetado 2135, sem alterar o horizonte calibrado. Não se simulou 3800 Temporadas.
- **F3, mesma classe no módulo:** reproduzidos salário mensal finito com produto intermediário infinito, soma de folha infinita, lançamento NaN/±Infinity e overflow de saldo/categoria. Corrigidos rateio dividindo primeiro, rejeição de folha agregada inválida antes dos lançamentos e rejeição de lançamento inválido antes de alterar aquele Clube. Não há truncamento de dívida, saldo ou salários.
- **F3, Save:** antes, `salvar` retorna `null` (sucesso) para valores não finitos e carrega finanças `null`. Depois, regressões NaN/±Infinity cobrem saldo, cinco categorias, salário, Histórico, RNG e estatísticas; todas recusam gravação com mensagem de dados inválidos, preservando objeto e slot anterior. Finanças `null`/ausentes também são incompatíveis ao ler e recusadas ao salvar, sem migração; tratamento de cota continua verde.

Os limites numéricos e de precisão estão na seção Finanças do MOTOR.md. O teto limita a receita recorrente, não o saldo acumulado nem a atividade do mercado. Não se promete aritmética monetária exata acima do intervalo seguro de inteiros, solvência universal ou cota infinita de Save.

### Verificações desta rodada

| Comando | Resultado/evidência |
|---|---|
| `npx vitest run src/motor/tatica.test.ts -t 'valida o goleiro pelo setor efetivo'` antes | 1 falha esperada, 16 ignorados; erro de G, 314 ms |
| `npx vitest run src/motor/tatica.test.ts -t 'a automatica preserva os melhores M'` antes | 3 falhas esperadas (três Formações), 436 ms |
| `npx vitest run src/motor/financas.test.ts -t 'mantem receitas e finanças finitas'` antes/depois | 3 falhas esperadas, depois 3 passam; 363/500 ms |
| `npx vitest run src/motor/financas.test.ts -t 'rateia salario\|recusa lancamento\|recusa folha'` antes | 5 falhas esperadas, 389 ms |
| `npx vitest run src/save.test.ts -t 'recusa numeros\|finanças null'` antes | 4 falhas esperadas, 737 ms |
| `npx vitest run src/motor/tatica.test.ts src/motor/rodada.test.ts` depois | 47 testes passam, 8,37 s; typecheck passa |
| `npx vitest run src/save.test.ts src/motor/financas.test.ts -t 'save\|rateia salario\|recusa lancamento\|recusa folha\|mantem receitas\|patrocinio cresce\|virada preserva'` depois | 28 passam, 7 ignorados, 2,86 s; typecheck passa |
| `npx vitest run src/motor/tatica.test.ts src/save.test.ts` final do incremento | 38 passam, 2,69 s; typecheck passa |
| `npm test -- --silent=false --reporter=verbose` | Suíte completa padrão, concorrência normal, **262 testes/16 arquivos passam em 60,73 s**. Os argumentos mudam somente a saída; não houve redução de N, metas ou timeout |
| `npm run build` | Tipos e Vite passam; 49 módulos, 259 ms de build; JS 298,53 kB / gzip 90,96 kB |
| `node /tmp/opencode/ticket15-c1-comparar-medicoes.mjs` | Três cenários/30 Temporadas: medições completas iguais ao snapshot anterior, excluindo tempo |
| `git diff --check` | Sem erros de whitespace |

Na suíte padrão desta rodada: 10 Temporadas 1/Flamengo 22,92 s, 8/Ceará 16,39 s, 42/Guarani (com repetição de cinco) 20,79 s; calibração de 30 seeds do 10º colocado passa em 44,58 s. Os JSONs de economia, forças, atividade e bytes são **idênticos** aos da medição posterior ao ajuste inicial; portanto continuam válidas todas as tabelas anteriores, as médias operacionais 2,02/5,25/7,63 mi, as Transferências T8–10 6/13/11, 1/15/18 e 9/16/6 e os Saves 590122/587588/591525 bytes. A comparação usa dados completos, não só valores arredondados do resumo.

**Navegador F1:** Chromium visível 149.0.7827.55 no dev server existente `http://localhost:5173`. Antes: nas três larguras 320/390/1280, permuta por dois botões da tela Escalação mostra nove setores naturais, mas Iniciar Rodada está desabilitado com erro de G (4,059 s). Depois: mesmos setores e mesma ordem, erro ausente, Iniciar Rodada habilitado e Rodada iniciada/pausada nas três larguras; nove Jogadores no seletor Sai, D/G nas duas primeiras entradas (8,486 s no teste final concorrente). Sem erros JS e sem overflow de página: largura útil/conteúdo 305/305, 375/375, 1265/1265. Capturas inspecionadas para celular e desktop. Nenhuma mudança de UI foi necessária; a correção é na validação compartilhada. Continua sendo verificação de viewport Chromium, não aparelho físico/Safari.

Artefatos locais desta rodada:

- `/tmp/opencode/ticket15-c1-npm-test.log`: suíte final verbosa e JSONs completos dos três cenários.
- `/tmp/opencode/ticket15-c1-build.log`: build final.
- `/tmp/opencode/playwright-ticket15-correction1.cjs`: reprodução/verificação F1; `FASE=antes` para esperar o bloqueio no snapshot anterior, padrão para esperar a correção.
- `/tmp/opencode/ticket15-c1-browser-antes.log` e `/tmp/opencode/ticket15-c1-browser-final.log`: resultados por largura; comando `NODE_PATH="$HOME/.claude/skills/playwright-skill/node_modules" node run.js /tmp/opencode/playwright-ticket15-correction1.cjs` na pasta do skill; URL configurável por `TARGET_URL`.
- `/tmp/opencode/ticket15-c1-{antes,depois}-{320,390,1280}-escalacao.png` e `ticket15-c1-depois-{320,390,1280}-rodada.png`: capturas.
- `/tmp/opencode/ticket15-c1-comparar-medicoes.mjs`: comparação determinística das medições com o log anterior.
