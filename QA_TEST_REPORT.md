# QA Test Report

## Testes executados

### Lint (`npm run lint`)
- Sucesso com 19 avisos não bloqueantes (React Fast Refresh e dependências de hooks) já conhecidos.

### Build (`npm run build`)
- Sucesso.
- Bundle principal ~1.26 MB; aviso de chunk > 500 kB mantido como informação.

### Mercado Pago (`node testar-mercado-pago.mjs`)
- Falhou: MP_ACCESS_TOKEN não encontrado no .env. É necessário configurar um token válido para criar a preferência.

### Melhor Envio (`node testar-melhor-envio.mjs`)
- Falhou: MELHOR_ENVIO_TOKEN não encontrado no .env. É necessário configurar um token válido para calcular o frete.

## Conclusão
- Lint e build concluídos com avisos conhecidos.
- Testes de integrações externas dependem de fornecer tokens reais em um arquivo .env conforme o exemplo disponibilizado.
