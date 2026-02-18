# Staging Smoke (Fiestou App)

Guia rápido para validar staging com Playwright após mudanças críticas.

## Pré-requisitos

- Staging frontend ativo em `https://teste.fiestou.com.br`
- API staging ativa em `https://testeapi.fiestou.com.br`
- Dependências instaladas (`npm install`)

## Variáveis recomendadas

```bash
export E2E_BASE_URL='https://teste.fiestou.com.br'
export E2E_API_BASE_URL='https://testeapi.fiestou.com.br'
export E2E_ADMIN_EMAIL='pedro@fiestou.com.br'
export E2E_ADMIN_PASSWORD='Fst#Pedr0@2026!Adm'
# opcional
export E2E_PARTNER_EMAIL='pedro.lojista@fiestou.com.br'
export E2E_PARTNER_PASSWORD='Teste123!'
```

## Execução

- Público:
```bash
npm run qa:smoke:public
```

- Autenticação (admin obrigatório / lojista opcional):
```bash
npm run qa:smoke:auth
```

- Tudo (desktop):
```bash
npm run qa:smoke:all
```

## Critério de aprovação

- Sem falha em testes críticos de navegação/login
- Sem tela em branco
- Sem erro de chunk (`_next/static/chunks`) no staging

## Dica operacional

Se aparecer erro de chunk no staging (`Cannot find module ... vendor-chunks/next.js`), reinicie o serviço de staging e rode o healthcheck antes de repetir os testes.
