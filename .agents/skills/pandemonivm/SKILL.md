---
name: pandemonivm
description: Modifique e verifique a rolagem, a seleção de setores, o desempenho ou o servidor público do PANDEMONIVM. Use para mudanças neste projeto; não substitui uma revisão visual solicitada.
---

# Manutenção do PANDEMONIVM

Localize a raiz que contém `PRODUCT.md`, `app.js` e `serve.py`. Leia as instruções de `AGENTS.md` e o documento relevante antes de alterar o comportamento. Mantenha os requisitos de produto em `PRODUCT.md` e as decisões visuais em `DESIGN.md`, sem duplicar esses documentos na habilidade.

## Física e seleção

Trace os manipuladores em `app.js` e os testes em `test.cjs` antes de editar:

- O octógono permanece parado. Cada setor é um triângulo de bordas retas.
- Clicar no setor N substitui a seleção pelos setores N a 8, incluindo N. Enter e Espaço têm o mesmo efeito.
- A rolagem aceita 1 a 10 dados do mesmo tipo, entre d4, d6, d8, d10, d12 e d20. O valor de cada dado respeita o intervalo desse tipo.
- O centro da posição final determina o setor, independentemente do valor sorteado. `highlightDie` também atualiza dados já parados quando a seleção muda.
- Dados colidem entre si e com as oito bordas. O raio de colisão deve conter o desenho em qualquer rotação.
- Controles ficam bloqueados durante a rolagem e são liberados no fim. Preserve a proteção contra rolagens simultâneas.

Ao corrigir um defeito, acrescente uma verificação que reproduza o comportamento esperado, especialmente para colisões, limites de quantidade, setores e destaque.

## Desempenho

A duração usa tempo real. Não volte a somar apenas intervalos limitados ao relógio da animação: isso prolonga a rolagem quando há poucos quadros. Preserve passos de física pequenos e recuperação limitada após suspensão da aba para evitar atravessamento de bordas e trabalho acumulado sem limite.

A resolução de colisões encerra cedo quando os dados já estão separados. Pares distantes usam comparação de distância ao quadrado. O desenho atualiza uma vez por quadro, após a física. Evite filtros de sombra sobre o SVG inteiro e filtros nos dados em movimento.

Para avaliar uma otimização, use a mesma quantidade e os mesmos tipos de dado e entradas aleatórias reproduzíveis. Confira também quadros espaçados, colisões e término da animação. Uma queda no número de operações não demonstra, sozinha, ganho de FPS em aparelho real.

## Recursos e servidor

Texturas ficam em `assets/`; fontes do sistema não exigem download. Evite URLs remotas, filtros SVG de ruído em tempo de execução e arquivos grandes sem necessidade demonstrada.

O servidor serve apenas as entradas de `serve.py:PUBLIC`. Se adicionar ou renomear um recurso, atualize a lista e confira o tipo de conteúdo. Preserve gzip, a resposta 304 por ETag, GET/HEAD e o bloqueio de caminhos privados. Não substitua o servidor por uma listagem de diretório exposta à rede.

## Verificação e relato

Execute `sh .agents/scripts/check.sh`. O script usa testes existentes, sem instalar dependências. Em mudanças visuais ou de integração, confira no navegador a seleção e uma rolagem de dez dados, inclusive o resultado final e o destaque. Testes com DOM simulado não substituem esse uso no navegador.

Informe os arquivos relevantes, o comportamento resultante, as verificações executadas e as limitações materiais. Atualize a documentação somente quando o contrato ou a forma de executar o projeto mudar.
