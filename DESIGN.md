# Ferro e sangue

A superfície é uma ferramenta de rolagem com estética de terror industrial: octógono de ferro oxidado, painel aparafusado, manchas de sangue e tipografia serifada em cor de osso. A textura é decorativa e não recebe eventos de entrada.

Tokens em styles.css: fundo #0c0b0a, texto #e8dfcc, texto secundário #b8aa99, sangue #921f27, ferrugem #9c6541 e borda #655342. Setores selecionados têm preenchimento vermelho; setores de parada têm contorno claro. O foco de teclado usa o próprio contorno do setor. Dados em setores selecionados recebem contorno claro e maior brilho. O painel passa para baixo do tabuleiro em 760 px.

HTML: index.html. Estilos: styles.css. Simulação: app.js. Texturas SVG locais: assets/metal.svg e assets/blood.svg. Sem fontes remotas ou dependências de execução.

Desempenho: texturas vetoriais locais com riscos e formas estáticas; não usam feTurbulence nem feDisplacementMap. Fontes do sistema não exigem download. serve.py entrega somente os cinco arquivos públicos, com gzip e revalidação por ETag. A configuração do provedor de hospedagem controla compressão e cache quando publicado fora desse servidor.

Rolagem: o relógio usa tempo real, com passos de física limitados para colisões estáveis. A resolução encerra cedo quando não há sobreposição e evita raízes quadradas para pares distantes. O tabuleiro não usa filtro de sombra sobre todo o SVG; os dados suspendem filtros enquanto se movem.
