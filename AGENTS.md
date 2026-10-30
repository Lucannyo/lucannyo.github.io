# PANDEMONIVM — instruções para agentes

## Contexto e fontes

Este repositório contém um simulador estático de dados de RPG. Leia `PRODUCT.md` para o comportamento e `DESIGN.md` para a identidade visual. `README.md` documenta a execução local. A interface e a comunicação com o usuário usam português do Brasil, salvo pedido em outro idioma.

O projeto não usa framework, gerenciador de pacotes, compilação ou fontes remotas. Preserve HTML, CSS e JavaScript separados. Use recursos locais e APIs nativas antes de adicionar dependências.

## Mapa do código

- `index.html`: estrutura, controles e tabuleiro SVG acessível.
- `styles.css`: tema, estados, texturas locais e adaptação a telas pequenas.
- `app.js`: seleção de setores, criação dos dados, física e animação.
- `assets/`: texturas SVG de metal e sangue.
- `serve.py`: servidor local com gzip, ETag e lista explícita de arquivos públicos.
- `test.cjs`: testes determinísticos da interação e da física em Node.js.
- `test_server.py`: testes de entrega e proteção dos arquivos privados.

## Habilidade local

Para mudanças na rolagem, nos setores, no desempenho ou na entrega do site, leia `.agents/skills/pandemonivm/SKILL.md`. A habilidade é autossuficiente. Habilidades pessoais como Impeccable, ASD-STE100 e Português Técnico Controlado são opcionais; não são dependências de execução ou requisitos para contribuir.

## Executar e verificar

- Desenvolvimento local: `python3 serve.py --port 3000`.
- Acesso pela rede/Tailscale quando solicitado: `python3 serve.py --bind 0.0.0.0 --port 3000`.
- Verificações: `sh .agents/scripts/check.sh`.

O servidor lê os arquivos atuais, sem pasta temporária ou etapa de cópia. Não exponha o diretório do repositório com um servidor genérico. Novos recursos públicos precisam entrar em `serve.py:PUBLIC`; mantenha documentos, instruções, testes e metadados Git fora dessa lista.

Para alterações visuais, confira o resultado no navegador em tela pequena e grande. Os testes em Node simulam o DOM e não comprovam aparência ou fluidez. Declare o que não foi verificado. Para mudanças de desempenho, compare a mesma carga antes e depois e diferencie custo de rede, física e renderização.

## Git e entrega

Use Conventional Commits, por exemplo `feat: ...`, `fix: ...`, `perf: ...` ou `docs: ...`. Confirme os arquivos que entrarão no commit, inclusive os ainda não rastreados. Não inclua caches, capturas temporárias, configurações pessoais ou credenciais. Faça commit e push quando solicitados pelo usuário.

A página funciona em hospedagem estática. `serve.py` é uma ferramenta local; compressão e cache em produção dependem do provedor, não desse script.
