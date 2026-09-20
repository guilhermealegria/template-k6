# k6 Performance Template

Template reutilizável de testes de performance com **Grafana k6 e JavaScript**, organizado para times de QA Automation. Inclui Smoke, Load, Stress e Soak, com configurações de carga separadas dos fluxos e da comunicação HTTP.

## Pré-requisitos

- k6 instalado no sistema e disponível no `PATH`.
- Acesso à internet para alcançar as quatro APIs públicas dos exemplos.
- Node.js com npm somente se quiser usar os atalhos do `package.json`.

**O k6 não é instalado através do npm. O npm é utilizado neste projeto somente como task runner para padronizar os comandos de execução.**

Não é necessário executar `npm install`. O projeto não tem dependências npm e não precisa de `node_modules`.

## Instalação do k6 no macOS

No Terminal, utilize o Homebrew, conforme a [documentação oficial do k6 para macOS](https://grafana.com/docs/k6/latest/set-up/install-k6/#macos).

Verifique se o Homebrew está disponível:

```bash
brew --version
```

Se o comando não for encontrado, instale o Homebrew seguindo as instruções em [brew.sh](https://brew.sh/). Ao terminar, siga os passos indicados pelo instalador para configurar o `PATH` e abra um novo terminal.

Instale o k6 e confirme a versão:

```bash
brew install k6
k6 version
```

Depois, na raiz deste repositório, execute o smoke test:

```bash
npm run test:smoke
```

Ou execute diretamente, sem precisar de npm:

```bash
k6 run src/tests/smoke/ipify.smoke.js
```

Para atualizar o k6 futuramente:

```bash
brew upgrade k6
```

## Instalação do k6 no Windows

Com Chocolatey disponível, execute no PowerShell (como administrador quando exigido pelo gerenciador):

```powershell
choco install k6
```

Chocolatey instala programas no sistema operacional; npm executa os atalhos deste projeto. Eles podem coexistir normalmente, sem conflito.

Como alternativa, utilize Winget:

```powershell
winget install k6 --source winget
```

Também é possível baixar o instalador ou binário oficial nas [releases do k6](https://github.com/grafana/k6/releases). Se usar o arquivo compactado, extraia e adicione a pasta de `k6.exe` ao `PATH`. Abra um novo terminal após instalar.

Consulte as opções por sistema operacional na [documentação oficial de instalação](https://grafana.com/docs/k6/latest/set-up/install-k6/).

### Validando a instalação

```powershell
k6 version
```

Ou, na raiz deste projeto, com npm disponível:

```powershell
npm run check:k6
```

## Estrutura e responsabilidades

```text
template-k6/
├── PROMPT_K6_PERFORMANCE_TEMPLATE.md
├── README.md
├── package.json
├── .gitignore
├── .env.example
├── scripts/
│   └── .gitkeep
├── results/
│   ├── raw/
│   │   └── .gitkeep
│   └── reports/
│       └── .gitkeep
└── src/
    ├── clients/
    │   ├── ipify.client.js
    │   ├── jsonplaceholder.client.js
    │   ├── httpbin.client.js
    │   └── restcountries.client.js
    ├── config/
    │   └── tests/
    │       ├── smoke.options.js
    │       ├── load.options.js
    │       ├── stress.options.js
    │       └── soak.options.js
    ├── scenarios/
    │   ├── ipify.scenario.js
    │   ├── jsonplaceholder.scenario.js
    │   ├── httpbin.scenario.js
    │   └── restcountries.scenario.js
    ├── tests/
    │   ├── smoke/
    │   │   └── ipify.smoke.js
    │   ├── load/
    │   │   └── jsonplaceholder.load.js
    │   ├── stress/
    │   │   └── httpbin.stress.js
    │   └── soak/
    │       └── restcountries.soak.js
    ├── data/
    │   └── .gitkeep
    └── utils/
        ├── random.js
        └── checks/
            └── ipify.checks.js
```

| Camada | Responsabilidade |
| --- | --- |
| `src/tests/` | Entrypoints pequenos: importam options e executam o cenário correspondente. |
| `src/scenarios/` | Jornadas: escolha de chamadas, checks e think time. |
| `src/clients/` | Comunicação HTTP: URLs, endpoints, timeout e tags recebidas do cenário. |
| `src/config/tests/` | VUs, executors, stages, durações e thresholds. |
| `src/utils/` | Helpers compartilhados de aleatoriedade e checks reutilizáveis. |
| `src/data/` | Espaço para massas de teste, sem segredos. |
| `results/raw/` e `results/reports/` | Espaços para saídas e relatórios futuros, ignorados pelo Git. |
| `scripts/` | Espaço para futuras automações. |

**`src/tests/` contém os entrypoints executáveis pelo k6.**

**`src/scenarios/` contém fluxos reutilizáveis e não deve ser executado diretamente com `k6 run`.**

## Execução

Execute os comandos na raiz do repositório:

| Tipo | Comando npm | Finalidade e perfil |
| --- | --- | --- |
| Smoke | `npm run test:smoke` | Validação básica: 1 VU por 15 segundos. |
| Load | `npm run test:load` | Carga progressiva: 10, 50, 80 e 0 VUs em estágios de 1, 3, 5 e 2 minutos. |
| Stress | `npm run test:stress` | Aumento de pressão: 10, 25, 50 e 0 VUs em estágios de 30 segundos. |
| Soak | `npm run test:soak` | Estabilidade contínua: 5 VUs por 15 minutos. |

VU significa usuário virtual. As durações podem incluir tempo adicional para encerrar iterações em andamento; Load permite `gracefulRampDown` de 30 segundos e Stress de 10 segundos.

Também é possível executar diretamente, sem Node.js ou npm:

```powershell
k6 run src/tests/smoke/ipify.smoke.js
k6 run src/tests/load/jsonplaceholder.load.js
k6 run src/tests/stress/httpbin.stress.js
k6 run src/tests/soak/restcountries.soak.js
```

O atalho `npm run test:all` executa Smoke, Load e Stress sequencialmente e para se um comando falhar. Soak é executado separadamente por sua duração.

### Comportamento dos exemplos

| Tipo | API e fluxo | Timeout | Think time |
| --- | --- | --- | --- |
| Smoke | `https://api.ipify.org?format=json`; valida HTTP 200 e campo `ip` como string não vazia. | 5s | 1s |
| Load | `https://jsonplaceholder.typicode.com`; 70% de chance de `GET /posts` e 30% de `GET /posts/{id}`, com ID entre 1 e 100; valida HTTP 200. | 10s | Aleatório de 0 até menos de 1,5s |
| Stress | `https://httpbin.org`; 80% de chance de `GET /get` e 20% de `GET /delay/1`; check aceita HTTP 200 ou 429. | 8s | 0,1s |
| Soak | `https://restcountries.com/v3.1/region/europe`; valida HTTP 200 e JSON como array não vazio. | 12s | Aleatório de 2 até menos de 5s |

As proporções são probabilidades por iteração e não cotas exatas em uma execução curta. Todos os requests recebem `test_type` e `target`; Stress também recebe `delayed` como string `"true"` ou `"false"`.

### Thresholds e interpretação

| Tipo | `http_req_failed` | `http_req_duration` |
| --- | --- | --- |
| Smoke | `rate<0.01` | `p(95)<800` |
| Load | `rate<0.02` | `p(95)<1200` |
| Stress | `rate<0.10` | `p(95)<3000` |
| Soak | `rate<0.02` | `p(95)<2000` |

Os limites de duração estão em milissegundos. Thresholds não atendidos fazem o k6 terminar com código diferente de zero, permitindo futura integração com CI/CD.

Checks registram validações funcionais; não foi adicionado threshold para `checks`. No Stress, HTTP 429 passa no check solicitado, mas continua contando como falha em `http_req_failed` pelo comportamento padrão do k6. Isso preserva o limite de falhas especificado. Veja a [documentação sobre respostas esperadas](https://grafana.com/docs/k6/latest/javascript-api/k6-http/set-response-callback/).

## Configuração e evolução

O `.env.example` é apenas uma referência para evolução futura. Os exemplos funcionam sem esse arquivo e não carregam `.env` automaticamente. URLs, timeouts e carga estão definidos nas respectivas camadas; preencher `BASE_URL` ou `TOKEN` no arquivo não altera os testes atuais.

Para adicionar uma API, crie o client HTTP, um cenário com a jornada e um entrypoint em `src/tests/`. Reutilize ou adicione options em `src/config/tests/` e registre o atalho no `package.json`. Reutilize os helpers de `src/utils/random.js` para manter a aleatoriedade consistente.

As pastas `results/` ficam inicialmente vazias; nenhuma ferramenta de relatório ou infraestrutura de pipeline é necessária. Em uma futura pipeline, disponibilize o executável k6, execute o mesmo entrypoint e preserve seu código de saída. Não versione tokens ou credenciais.

## Validação local

Após instalar o k6, execute:

```powershell
npm run check:k6
npm run test:smoke
```

O smoke realiza chamadas reais ao ipify e avalia os thresholds configurados. Se houver falha, examine no resumo do k6 os checks, a taxa de erros e o p95 para identificar a causa.
