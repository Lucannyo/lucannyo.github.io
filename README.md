# lucannyo.github.io
Personal RPG page

## Servir localmente

Execute `python3 serve.py --bind 0.0.0.0 --port 3000` para acesso local e pela rede/Tailscale. O servidor permite somente HTML, CSS, JavaScript e as duas texturas públicas. Usa gzip e ETag para evitar transferir novamente arquivos que não mudaram. Alterações nos arquivos aparecem sem copiar para uma pasta temporária.

As texturas são SVG locais sem filtros procedurais. A tipografia usa fontes já instaladas no dispositivo e não faz requisições a serviços de fontes.

Verificação: `node test.cjs` e `python3 -m unittest test_server.py`.
