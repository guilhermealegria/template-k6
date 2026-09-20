# Objetivo

Crie um template completo, organizado e reutilizável para testes de performance utilizando **Grafana k6 e JavaScript**, seguindo boas práticas de arquitetura, separação de responsabilidades e facilidade de manutenção.

O projeto deve servir como base para times de QA Automation criarem e evoluírem testes de performance dos tipos:

- Smoke Testing
- Load Testing
- Stress Testing
- Soak Testing

O projeto será utilizado inicialmente em **Windows** e deve estar preparado para futura utilização em pipelines CI/CD.

---

# 1. Tecnologias e premissas

Utilizar:

- Grafana k6
- JavaScript
- ES Modules (`import` / `export`)
- npm apenas como task runner/orquestrador de comandos
- `package.json` para padronização das execuções

IMPORTANTE:

O k6 NÃO deve ser instalado através do npm e NÃO deve aparecer em `dependencies` ou `devDependencies`.

O k6 é um executável independente, escrito em Go, e deve estar instalado no sistema operacional.

No Windows, considerar como opções de instalação:

- Chocolatey
- Winget
- Binário oficial do k6
- Docker, quando aplicável

Chocolatey e npm podem coexistir normalmente, pois possuem responsabilidades diferentes.

O npm será utilizado apenas para executar comandos como:

```bash
npm run test:smoke
npm run test:load
npm run test:stress
npm run test:soak
```

Não deve ser necessário executar `npm install` para utilizar a versão inicial do template, pois inicialmente não haverá dependências npm.

---

# 2. Arquitetura do projeto

Utilizar a seguinte estrutura:

```text
k6-performance-template/
│
├── README.md
├── package.json
├── .gitignore
├── .env.example
│
├── scripts/
│
├── results/
│   ├── raw/
│   └── reports/
│
└── src/
    ├── clients/
    │   ├── ipify.client.js
    │   ├── jsonplaceholder.client.js
    │   ├── httpbin.client.js
    │   └── restcountries.client.js
    │
    ├── config/
    │   └── tests/
    │       ├── smoke.options.js
    │       ├── load.options.js
    │       ├── stress.options.js
    │       └── soak.options.js
    │
    ├── scenarios/
    │   ├── ipify.scenario.js
    │   ├── jsonplaceholder.scenario.js
    │   ├── httpbin.scenario.js
    │   └── restcountries.scenario.js
    │
    ├── tests/
    │   ├── smoke/
    │   │   └── ipify.smoke.js
    │   ├── load/
    │   │   └── jsonplaceholder.load.js
    │   ├── stress/
    │   │   └── httpbin.stress.js
    │   └── soak/
    │       └── restcountries.soak.js
    │
    ├── data/
    │
    └── utils/
        ├── random.js
        └── checks/
            └── ipify.checks.js
```

Caso alguma pasta precise permanecer vazia inicialmente, adicionar `.gitkeep` quando necessário para que seja versionada pelo Git.

---

# 3. Responsabilidade das camadas

A separação de responsabilidades deve ser rigorosamente respeitada.

## `src/tests/`

São os **entrypoints executáveis pelo k6**.

Somente arquivos dessa camada devem ser utilizados diretamente em comandos:

```bash
k6 run src/tests/...
```

Os arquivos dessa pasta devem ser pequenos e responsáveis principalmente por:

- importar as options;
- importar o scenario correspondente;
- exportar `options`;
- disponibilizar a função executada pelo k6.

Exemplo conceitual:

```js
import { loadOptions } from "../../config/tests/load.options.js";
import { jsonPlaceholderLoadScenario } from "../../scenarios/jsonplaceholder.scenario.js";

export const options = loadOptions;

export default function () {
  jsonPlaceholderLoadScenario();
}
```

Não concentrar lógica HTTP ou regras complexas nos entrypoints.

---

## `src/scenarios/`

Contém os fluxos/jornadas executados pelos testes.

Essa camada deve:

- chamar clients;
- executar checks;
- controlar think time;
- definir o comportamento da iteração;
- combinar diferentes chamadas quando necessário.

Os arquivos de `scenarios/` NÃO são entrypoints e NÃO devem ser executados diretamente utilizando:

```bash
k6 run src/scenarios/...
```

---

## `src/clients/`

Responsável exclusivamente pela comunicação HTTP com as APIs.

Exemplos:

```js
getPosts()
getPostById()
getPublicIp()
fastGet()
delayedGet()
getCountriesByRegion()
```

Essa camada deve encapsular:

- URLs;
- endpoints;
- `http.get()`;
- parâmetros HTTP;
- timeout;
- tags recebidas pelo cenário.

Evitar colocar regras de carga nessa camada.

---

## `src/config/tests/`

Responsável pelas configurações de execução dos diferentes tipos de teste.

Deve conter:

- executors;
- VUs;
- stages;
- durations;
- thresholds;
- gracefulRampDown.

As configurações devem permanecer separadas da lógica funcional das APIs.

---

## `src/utils/`

Contém funções genéricas e reutilizáveis.

Exemplos:

- geração de números aleatórios;
- probabilidades;
- randomização de think time;
- checks reutilizáveis.

Evitar colocar regras específicas de uma API em helpers genéricos quando não forem reutilizáveis.

---

## `src/data/`

Reservada para dados utilizados pelos testes, como:

- JSON;
- CSV;
- payloads;
- massas de teste.

Nenhum segredo, senha ou token deve ser versionado.

---

## `results/`

Reservada para outputs futuros do k6.

Estrutura:

```text
results/
├── raw/
└── reports/
```

Não implementar ferramentas adicionais de relatório neste primeiro momento.

---

# 4. Smoke Testing

Utilizar:

```text
https://api.ipify.org?format=json
```

O teste original possui o seguinte comportamento:

```js
import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 1,
  duration: "15s",
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<800"],
  },
};

export default function () {
  const res = http.get("https://api.ipify.org?format=json", {
    tags: { test_type: "smoke", target: "ipify" },
    timeout: "5s",
  });

  check(res, {
    "status is 200": (r) => r.status === 200,
    "has ip field": (r) => {
      try {
        const body = r.json();
        return typeof body.ip === "string" && body.ip.length > 0;
      } catch (_) {
        return false;
      }
    },
  });

  sleep(1);
}
```

Dividir esse código entre:

```text
config/tests/smoke.options.js
clients/ipify.client.js
utils/checks/ipify.checks.js
scenarios/ipify.scenario.js
tests/smoke/ipify.smoke.js
```

Manter:

- `vus: 1`
- `duration: "15s"`
- `http_req_failed: ["rate<0.01"]`
- `http_req_duration: ["p(95)<800"]`
- timeout de `5s`
- tags `test_type: "smoke"` e `target: "ipify"`
- check HTTP 200
- validação da existência do campo `ip`
- `sleep(1)`

---

# 5. Load Testing

Utilizar:

```text
https://jsonplaceholder.typicode.com
```

Configuração:

```js
scenarios: {
  ramp_load: {
    executor: "ramping-vus",
    startVUs: 1,
    stages: [
      { duration: "1m", target: 10 },
      { duration: "3m", target: 50 },
      { duration: "5m", target: 80 },
      { duration: "2m", target: 0 },
    ],
    gracefulRampDown: "30s",
  },
}
```

Thresholds:

```js
http_req_failed: ["rate<0.02"]
http_req_duration: ["p(95)<1200"]
```

O comportamento deve simular:

- 70% das requisições para:

```text
GET /posts
```

- 30% para:

```text
GET /posts/{id}
```

O ID deve ser aleatório entre 1 e 100.

Utilizar:

```js
tags: {
  test_type: "load",
  target: "jsonplaceholder"
}
```

Timeout:

```text
10s
```

Think time:

```js
Math.random() * 1.5
```

ou helper equivalente em `utils/random.js`.

Separar entre:

```text
config/tests/load.options.js
clients/jsonplaceholder.client.js
scenarios/jsonplaceholder.scenario.js
utils/random.js
tests/load/jsonplaceholder.load.js
```

---

# 6. Stress Testing

Utilizar:

```text
https://httpbin.org
```

Configuração:

```js
scenarios: {
  stress_ramp: {
    executor: "ramping-vus",
    startVUs: 1,
    stages: [
      { duration: "30s", target: 10 },
      { duration: "30s", target: 25 },
      { duration: "30s", target: 50 },
      { duration: "30s", target: 0 },
    ],
    gracefulRampDown: "10s",
  },
}
```

Thresholds:

```js
http_req_failed: ["rate<0.10"]
http_req_duration: ["p(95)<3000"]
```

O comportamento deve possuir:

- 80% de chance de executar:

```text
GET /get
```

- 20% de chance de executar:

```text
GET /delay/1
```

Utilizar helper reutilizável:

```js
chance(probability)
```

em:

```text
src/utils/random.js
```

Tags:

```js
{
  test_type: "stress",
  target: "httpbin",
  delayed: String(isDelayed)
}
```

Timeout:

```text
8s
```

Check:

```js
r.status === 200 || r.status === 429
```

Think time:

```js
sleep(0.1)
```

Separar entre:

```text
config/tests/stress.options.js
clients/httpbin.client.js
scenarios/httpbin.scenario.js
utils/random.js
tests/stress/httpbin.stress.js
```

---

# 7. Soak Testing

Utilizar:

```text
https://restcountries.com/v3.1
```

Endpoint:

```text
GET /region/europe
```

Configuração:

```js
scenarios: {
  soak: {
    executor: "constant-vus",
    vus: 5,
    duration: "15m",
  },
}
```

Thresholds:

```js
http_req_failed: ["rate<0.02"]
http_req_duration: ["p(95)<2000"]
```

Tags:

```js
{
  test_type: "soak",
  target: "restcountries"
}
```

Timeout:

```text
12s
```

Checks:

1. status HTTP deve ser 200;
2. response JSON deve ser um array;
3. array deve possuir pelo menos um elemento.

Think time aleatório entre 2 e 5 segundos.

Criar helper:

```js
randomBetween(min, max)
```

em:

```text
src/utils/random.js
```

Separar entre:

```text
config/tests/soak.options.js
clients/restcountries.client.js
scenarios/restcountries.scenario.js
utils/random.js
tests/soak/restcountries.soak.js
```

---

# 8. `utils/random.js`

Como esse arquivo será compartilhado por diferentes testes, consolidar nele os helpers necessários, evitando duplicação.

Ele deve disponibilizar funções equivalentes a:

```js
export function getRandomIntInclusive(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function coinFlip() {
  return Math.random();
}

export function chance(probability) {
  return Math.random() < probability;
}

export function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

export function randomSleepSeconds(maxSeconds) {
  return Math.random() * maxSeconds;
}
```

Caso alguma função seja redundante, pode simplificar a implementação, desde que preserve exatamente o comportamento esperado pelos cenários.

---

# 9. package.json

Criar um `package.json` mesmo sem dependências npm.

Ele deve funcionar como task runner.

Utilizar como base:

```json
{
  "name": "k6-performance-template",
  "version": "1.0.0",
  "description": "Template de testes de performance com k6 (smoke, load, stress, soak)",
  "private": true,
  "type": "module",
  "scripts": {
    "check:k6": "k6 version",
    "test:smoke": "k6 run src/tests/smoke/ipify.smoke.js",
    "test:load": "k6 run src/tests/load/jsonplaceholder.load.js",
    "test:stress": "k6 run src/tests/stress/httpbin.stress.js",
    "test:soak": "k6 run src/tests/soak/restcountries.soak.js",
    "test:all": "npm run test:smoke && npm run test:load && npm run test:stress"
  }
}
```

Não adicionar dependências apenas para justificar o uso do npm.

Não criar `node_modules`.

Não exigir `npm install`.

O comando:

```bash
npm run test:smoke
```

deve simplesmente chamar:

```bash
k6 run src/tests/smoke/ipify.smoke.js
```

---

# 10. README.md

Criar um README profissional e didático contendo pelo menos:

## Sobre o projeto

Explicar que é um template para testes de performance com Grafana k6.

## Pré-requisitos

Informar que é necessário:

- k6 instalado;
- npm disponível somente caso o usuário queira utilizar os atalhos do `package.json`.

Deixar explícito que:

> O k6 não é instalado através do npm. O npm é utilizado neste projeto somente como task runner para padronizar os comandos de execução.

## Instalação do k6 no Windows

Documentar pelo menos:

Chocolatey:

```powershell
choco install k6
```

Winget e instalação manual podem ser mencionados como alternativas.

Explicar que instalar Chocolatey não gera conflito com npm.

## Validando a instalação

```bash
k6 version
```

ou:

```bash
npm run check:k6
```

## Estrutura

Documentar resumidamente a responsabilidade de:

```text
tests
scenarios
clients
config
utils
data
results
```

Deixar extremamente claro:

> `src/tests/` contém os entrypoints executáveis pelo k6.

E:

> `src/scenarios/` contém fluxos reutilizáveis e não deve ser executado diretamente com `k6 run`.

## Execução

Documentar:

```bash
npm run test:smoke
npm run test:load
npm run test:stress
npm run test:soak
```

E também a execução direta:

```bash
k6 run src/tests/smoke/ipify.smoke.js
k6 run src/tests/load/jsonplaceholder.load.js
k6 run src/tests/stress/httpbin.stress.js
k6 run src/tests/soak/restcountries.soak.js
```

Explicar brevemente a finalidade de Smoke, Load, Stress e Soak.

---

# 11. .gitignore

Criar `.gitignore` apropriado.

Considerar pelo menos:

```gitignore
.env
results/raw/*
results/reports/*
```

Preservar `.gitkeep` caso utilizado.

Não ignorar arquivos necessários para execução do template.

---

# 12. .env.example

Criar um `.env.example` apenas como preparação para evolução futura.

Não adicionar segredos reais.

Pode conter exemplos como:

```env
ENV=local
BASE_URL=
TOKEN=
```

Entretanto, os testes de exemplo deste template devem funcionar sem depender desse arquivo.

---

# 13. Regras de implementação

Seguir estas regras:

1. Utilizar somente JavaScript, não TypeScript.
2. Utilizar ES Modules.
3. Não utilizar `require()`.
4. Não instalar k6 via npm.
5. Não adicionar dependências npm desnecessárias.
6. Não criar `node_modules`.
7. Não exigir `npm install`.
8. `tests/` deve conter somente os entrypoints.
9. `scenarios/` deve conter os fluxos/jornadas.
10. `clients/` deve encapsular as chamadas HTTP.
11. `config/tests/` deve conter configurações de carga.
12. `utils/` deve conter funções reutilizáveis.
13. Evitar código duplicado.
14. Utilizar nomes claros e consistentes.
15. Manter comentários úteis, evitando comentários óbvios ou excessivos.
16. Preservar os thresholds, VUs, stages, durations, timeouts, tags e proporções especificados neste prompt.
17. Os exemplos devem utilizar exclusivamente as APIs públicas especificadas.
18. Não adicionar frameworks ou abstrações desnecessárias.
19. Priorizar simplicidade, legibilidade e facilidade de manutenção.
20. O template deve estar preparado para expansão futura e CI/CD, mas sem implementar infraestrutura desnecessária nesta primeira versão.

---

# 14. Validação final

Depois de criar todos os arquivos:

1. Verifique se todos os imports relativos estão corretos.
2. Verifique se todos os arquivos referenciados existem.
3. Verifique se não existem imports TypeScript.
4. Verifique se nenhum arquivo utiliza `require()`.
5. Verifique se `package.json` é JSON válido.
6. Verifique se os quatro entrypoints estão corretamente configurados.
7. Verifique se os scenarios não estão sendo tratados como entrypoints.
8. Verifique se as funções de `utils/random.js` estão sendo reutilizadas corretamente.
9. Verifique se não existem dependências npm desnecessárias.
10. Verifique se os comandos do `package.json` apontam para os caminhos corretos.
11. Verifique se os testes mantêm exatamente os comportamentos e proporções especificados.
12. Caso o ambiente possua k6 instalado e acesso à internet, execute pelo menos uma validação do smoke test:

```bash
k6 run src/tests/smoke/ipify.smoke.js
```

Não alterar a arquitetura apenas para corrigir problemas de execução; corrija a causa na camada apropriada.

---

# Resultado esperado

Ao final, entregue o projeto completo e funcional com todos os arquivos necessários.

Apresente também a árvore final do projeto e um resumo curto informando:

- quais arquivos foram criados;
- qual é o papel de cada camada;
- quais comandos executam cada tipo de teste;
- se a validação do smoke test foi realizada com sucesso.

O projeto deve permitir que, após clonar o repositório e possuir k6 instalado, seja possível executar imediatamente:

```bash
npm run test:smoke
```

ou:

```bash
k6 run src/tests/smoke/ipify.smoke.js
```

sem instalação adicional de dependências npm.
