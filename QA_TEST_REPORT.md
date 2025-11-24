# QA Test Report

## Testes executados

### 
pm run lint
- ? Sucesso  
- Warnings presentes (React Fast Refresh e react-hooks), mas nenhum erro bloqueante.

### 
pm run build
- ? Sucesso  
- Observação: bundle principal ~1.26 MB após minificação.  
- Aviso do Vite/Rollup sobre chunk > 500 kB (apenas recomendação, não é erro).

### 
ode testar-mercado-pago.mjs
- ? Sucesso  
- Status HTTP: **201**  
- Preferência criada com sucesso.  
- init_point e sandbox_init_point retornados corretamente.

### 
ode testar-melhor-envio.mjs
- ? Sucesso  
- Status HTTP: **200**  
- Cotação retornada com múltiplas opções de frete: PAC, SEDEX, Jadlog, LATAM Cargo, Loggi, Buslog, JeT, etc.

---

## Conclusão Geral
O ambiente local está **pronto para build, testes e deploy**.  
Integrações de pagamento (Mercado Pago) e cálculo de frete (Melhor Envio) funcionando com sucesso.
