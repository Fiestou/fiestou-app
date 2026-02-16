# Fiestou - Agent Memory (Pedro)

## Dono do Código e Regras de Git
- Pedro é o responsável por commit e push.
- O agente **nunca** deve fazer `git push`.
- O agente pode fazer `git pull` quando necessário para atualizar ambiente.
- Commits (quando Pedro solicitar) devem manter linguagem profissional, sem menção a IA.

## Padrões de Código
- Código sem emojis e sem "assinatura" de IA.
- Manter estilo consistente com o projeto.
- Sempre validar build antes de declarar que está funcionando.
- Sempre executar testes das mudanças feitas.

## Ambientes e Fluxo
- Ambiente principal de validação: `staging` (rodando em modo dev).
- URL pública de staging: `https://teste.fiestou.com.br`.
- Exposição externa via Cloudflare Tunnel (com restrições de acesso configuráveis).
- Produção exige nível de cautela superior ao staging.

## Serviço de Staging
- App staging dev em `:3030` (Next.js dev).
- Serviço systemd observado: `fiestou-app-staging-dev.service`.
- Sintoma já observado: erro intermitente de chunk no dev
  - `Cannot find module './chunks/vendor-chunks/next.js'`
  - Sintoma visível no browser: tela branca por `body{display:none}` (`data-next-hide-fouc`) quando JS não carrega.
  - Mitigação aplicada: limpar `.next` (com backup) + reiniciar `fiestou-app-staging-dev.service` para recompilar chunks.
- Regra operacional:
  - Não rodar `npm run build` no mesmo diretório do staging dev em execução.
  - Usar cópia de validação (`/var/www/fiestou-app-staging-buildcheck`) para build.

## Estado das Melhorias Recentes (2026-02-16)
- Refatoração do carrinho para fluxo centralizado em `src/services/cart.ts`:
  - persistência + limpeza centralizadas;
  - eventos de atualização (`subscribeToCartChanges`) para evitar polling;
  - helpers de `add/remove/update` com sincronização.
- Header migrado de polling para assinatura de eventos do carrinho.
- Fluxos de checkout/logout/auth alinhados com limpeza centralizada de carrinho.
- Blog `[slug]` com payload estático enxuto e carregamento cliente dos blocos pesados.
- Base de paginação/filtro compartilhada em `src/services/productsPagination.ts`.
- Telemetria de web vitals adicionada:
  - `pages/_app.tsx` (`reportWebVitals`)
  - `pages/api/telemetry/web-vitals.ts`
- Sistema de recomendação automática de produtos implementado:
  - Tracking de interesse por ator (usuário logado e guest com `visitor_id`) via `POST /api/request/product-interest`.
  - Endpoint de recomendação personalizada via `GET /api/request/product-recommendations`.
  - Regras de recomendação combinando:
    - mesma loja do produto atual;
    - afinidade por categorias/tags do produto atual;
    - histórico comportamental (view, cart_add, favorite) por ator.
  - Persistência no backend API com tabela `product_interest`.
  - Página admin nova para análise:
    - rota: `/admin/recomendacoes`
    - endpoints: `/api/app/admin/recommendations*`
- Otimizações públicas (fase 1 - mobile/desktop):
  - `RelatedProducts` com deduplicação de requests por produto+loja (cache em memória + controle de requisição em voo).
  - Fallback de recomendação reforçado (não quebra em erro de API).
  - `ProductCard` memoizado (`React.memo`) para reduzir re-render em listas longas.
  - Imagens dos cards com `loading="lazy"`, `decoding="async"` e `fetchPriority="low"` + `alt` contextual.
  - Scroll infinito em `/produtos` e `/produtos/listagem` com lock de carregamento e `IntersectionObserver` com pré-carga (`rootMargin`).
  - Listener de scroll-top em `/produtos/listagem` otimizado com `requestAnimationFrame` + listener `passive`.
- Review técnico completo (hardening):
  - Correção de bug na página de produto: estado `isMobile` estava sendo salvo como objeto em vez de booleano.
  - `LikeButton` robustecido contra cookie inválido (`fiestou.likes`) para evitar crash no cliente.
  - Lock de paginação em `/produtos/listagem` ajustado para não liberar por request obsoleta (evita corrida).
  - Hook admin `useRecommendationInsights` com proteção contra resposta stale/race e refresh completo (lista + stats).
  - `RelatedProducts` reforçado com deduplicação/filtro de IDs na resposta da recomendação.

## Correções de Regra de Negócio (API Recomendações)
- `favorite_remove` agora:
  - não incrementa `view_count`;
  - decrementa `favorite_count` (mínimo 0);
  - reduz score de afinidade (com piso em 0).
- Endpoint `track` com tratamento de condição de corrida no `unique(actor_key, product)`:
  - em colisão de insert simultâneo, recarrega registro e reaplica evento.

## Incidente Resolvido (Staging)
- Data: `2026-02-16`.
- Sintoma: tela branca geral no staging e falha global no Playwright.
- Causa: `next dev` com `.next` inconsistente, erro:
  - `Cannot find module './chunks/vendor-chunks/next.js'`.
- Ação aplicada:
  - limpeza de `.next` em `/var/www/fiestou-app-staging`;
  - reinício do serviço `fiestou-app-staging-dev.service`.
- Resultado: staging voltou a responder `200` e suíte pública voltou a passar.

## Validação Técnica
- Build validado com `npm run build`.
- E2E smoke público validado com Playwright:
  - `npx playwright test e2e/public.audit.spec.ts`
  - Resultado final: `14 passed`.
- Smoke do túnel validado diretamente em `https://teste.fiestou.com.br` (desktop/mobile home).
- Smoke de recomendação validado no produto (`/produtos/circus-festas/101-dalmatas-36/`):
  - `Recomendados para você` renderizado;
  - chamada de recomendação observada: `1` request (`200`).

## Próximo Foco Recomendado
- Continuar melhoria de UX/performance mobile nas páginas públicas com maior tráfego:
  - home, listagem de produtos, produto, loja e checkout.
- Manter ciclo: editar -> build -> playwright -> validação em `teste.fiestou.com.br`.

## Melhorias Aplicadas (2026-02-16 - Round checkout/admin)
- Checkout hardening (consumidor):
  - Submit protegido contra clique duplo/race (`isSubmittingRef` + lock de loading).
  - Fluxo `pickup-only` agora finaliza sem exigir CEP/frete.
  - Validações server-safe reforçadas no submit:
    - seleção entrega/retirada para itens `both`;
    - pedido mínimo por loja;
    - telefone válido;
    - endereço obrigatório apenas quando há itens de entrega;
    - horários de entrega/retirada por loja.
  - Resumo de checkout agora mostra pendências de pedido mínimo por loja.
- Cálculo de frete no checkout:
  - Cache de CEP/frete passou a considerar assinatura dos itens de entrega;
  - evita falso "já calculado" quando muda composição do carrinho no mesmo CEP.
- Carrinho (`CartSummary`) UX:
  - botão de cálculo de frete com `id=btn-calc-frete` (integração com trigger da página);
  - bloqueio de checkout ajustado para não travar pedidos só de retirada;
  - mensagens contextuais para entrega vs retirada.
- Admin recomendações:
  - botão de exportação CSV da listagem de atores;
  - KPIs derivados adicionados (`interações/ator`, `% guests`);
  - painéis operacionais de `Top produtos` e `Top lojas` usando stats da API.

## Validação (após melhorias acima)
- Build validado em ambiente isolado (`/var/www/fiestou-app-staging-buildcheck`): `npm run build` OK.
- Playwright público: `npx playwright test e2e/public.audit.spec.ts` -> `14 passed`.
- Tunnel/staging:
  - `https://teste.fiestou.com.br/` -> `200`;
  - serviço `fiestou-app-staging-dev.service` -> `active`.
- Backend API (staging) ajustado para compatibilidade com checkout pickup-only:
  - `OrdersController::Register` agora aceita `freights.productsIds` vazio;
  - cálculo de frete só executa quando há produtos de entrega;
  - mantém erro explícito quando há itens de entrega sem CEP.
- Hardening extra em `orders/register` (staging API):
  - valida compatibilidade de `deliverySelection` com `delivery_type` do produto;
  - exige seleção explícita para produtos `both`;
  - impede bypass de frete via payload inconsistente (`freights.productsIds` deve cobrir itens de entrega).
- Admin recomendações (ajuste pós-feedback):
  - botões com `type="button"` para evitar submit implícito em containers com `<form>`;
  - `Ver perfil` mantém scroll automático para o bloco de detalhes;
  - atualização automática silenciosa a cada 15s (live mode) + sync ao voltar para aba;
  - perfil selecionado é atualizado em background sem travar a UI.
- Verificação de dados reais em staging:
  - usuário `pedro@fiestou.com.br` (id `446`) possui eventos em `product_interest` com `actor_key=user:446`.
