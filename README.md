## Visão geral
- API em Node/Express que agenda faixas de CEP em fila SQS, consulta ViaCEP e persiste resultados no MongoDB.
- Worker consome fila, respeita rate limit e grava sucessos/erros.
- Frontend React (Vite + TS + Tailwind) para iniciar crawls, acompanhar progresso e visualizar resultados (inclui mapa via Google Maps).

## Decisões de arquitetura
- **Injeção de dependências**: container simples ([src/config/container.js](src/config/container.js)) e registro central ([src/config/dependencies.js](src/config/dependencies.js)). Controllers, services e worker recebem dependências no construtor (DIP/SOLID).
- **Separação de responsabilidades**: controllers (HTTP), services (regras), worker (fila), models (persistência), routes (exposição).
- **Fail fast de config**: [src/config/env.js](src/config/env.js) valida variáveis críticas (Mongo, SQS).
- **Teste unitário**: vitest cobrindo `CrawlService` com mocks de fila e modelo, garantindo geração/validação de ranges e enfileiramento.

## Frontend
- **Stack**: React 18, TypeScript, Vite, Tailwind.
- **Componentes-chave**: Header compacto, formulário de faixa de CEP, cards de status, tabelas separadas de sucesso/erro, modal de mapa (Google Maps).
- **Fluxo**: POST inicia crawl → polling de status → tabelas renderizam sucesso/erro; modal exibe localização quando disponível.

## Backend
- **Stack**: Node 18+, Express, Mongoose, AWS SQS SDK, dotenv, cors.
- **Serviços principais**:
  - `QueueService`: abstrai SQS.
  - `ViaCepService`: consulta ViaCEP.
  - `RateLimiter`: controla RPS para chamadas externas.
  - `CrawlService`: valida range, gera mensagens e cria crawl.
  - `CrawlController`: endpoints REST.
  - `CepWorker`: consome fila e persiste resultados.

## Estrutura de pastas (detalhada)
- `src/server.js` – bootstrap da API (Express) e middlewares
- `src/worker.js` – bootstrap do worker (consome SQS, aplica rate limit)
- `src/config/` – configuração de env/DB (`env.js`, `database.js`), container DI (`container.js`), registro de dependências (`dependencies.js`)
- `src/controllers/` – controladores HTTP (ex.: `CrawlController.js`)
- `src/services/` – regras de negócio e integrações externas (`CrawlService`, `QueueService`, `ViaCepService`, `RateLimiter`); testes unitários em `src/services/__tests__/`
- `src/models/` – schemas Mongoose (`Crawl.js`, `CepResult.js`)
- `src/routes/` – roteadores Express (ex.: `cepRoutes.js`)
- `src/ui/` – frontend React/Vite/Tailwind
  - `src/ui/src/App.tsx` – orquestração de chamadas e estado
  - `src/ui/src/components/` – componentes (Header, Form, StatusCard, tabelas, modal de mapa)
  - `src/ui/src/styles/` – Tailwind/global
  - `vite.ui.config.js`, `tailwind.config.js`, `postcss.config.js` – build e estilo

## Execução
- **API**: `npm run dev:api` (ou `npm run dev:all` para API + frontend + worker se configurado).
- **Worker**: `npm run dev:worker` (após deps e env prontos).
- **Frontend**: `npm run dev:ui` (Vite em 5173).

## Testes
- Vitest: `npm test`
- Teste atual: `src/services/__tests__/CrawlService.test.js` (mocks de fila/modelo, cobre validação de CEP, ranges e enfileiramento).

## Testando a API via terminal (sem frontend)

### Health check
```bash
curl http://localhost:4000/health
```

### Criar crawl
```bash
curl -X POST http://localhost:4000/crawl \
  -H "Content-Type: application/json" \
  -d "{\"cep_start\":\"01000000\",\"cep_end\":\"01000010\"}"
```
Retorna `crawl_id` e `total` de CEPs enfileirados.

### Consultar status do crawl
```bash
curl http://localhost:4000/crawl/{crawl_id}
```
Substitua `{crawl_id}` pelo ID retornado no passo anterior.

### Obter resultados do crawl
```bash
curl http://localhost:4000/crawl/{crawl_id}/results
```
Retorna array com sucessos e erros processados pelo worker.

## Variáveis de ambiente essenciais
- `PORT` (padrão 3000)
- `MONGODB_URI`
- `AWS_REGION`, `AWS_ENDPOINT`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `SQS_QUEUE_URL`
- `RATE_LIMIT_RPS` (padrão 10)

## Observações
- Rate limit configurável por env.
- Logs mínimos; erros propagam com mensagens claras.
- Frontend e backend prontos para rodar localmente com filas/DB locais ou AWS reais.
