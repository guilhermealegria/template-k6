# k6 Performance Template

Template reutilizável de testes de performance com **Grafana k6 e JavaScript**, organizado para times de QA Automation. Inclui Smoke, Load, Stress, Soak, Spike e Breakpoint, com configurações de carga separadas dos fluxos e da comunicação HTTP.

## Pré-requisitos

- k6 instalado no sistema e disponível no `PATH`.
- Acesso à internet para os quatro exemplos antigos; destino local ou autorizado para Spike e Breakpoint.
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
    │   ├── restcountries.client.js
    │   └── target.client.js
    ├── config/
    │   └── tests/
    │       ├── smoke.options.js
    │       ├── load.options.js
    │       ├── stress.options.js
    │       ├── soak.options.js
    │       ├── spike.options.js
    │       └── breakpoint.options.js
    ├── scenarios/
    │   ├── ipify.scenario.js
    │   ├── jsonplaceholder.scenario.js
    │   ├── httpbin.scenario.js
    │   ├── restcountries.scenario.js
    │   └── target.scenario.js
    ├── tests/
    │   ├── smoke/
    │   │   └── ipify.smoke.js
    │   ├── load/
    │   │   └── jsonplaceholder.load.js
    │   ├── stress/
    │   │   └── httpbin.stress.js
    │   ├── soak/
    │   │   └── restcountries.soak.js
    │   ├── spike/
    │   │   └── target.spike.js
    │   └── breakpoint/
    │       └── target.breakpoint.js
    ├── data/
    │   └── .gitkeep
    └── utils/
        ├── random.js
        ├── load-profile.js
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
| Spike | `npm run test:spike` | Pico de 2 para 20 iterações/s e recuperação; 114s. |
| Breakpoint | `npm run test:breakpoint` | Níveis de 2 até 22 iterações/s; até 108s. |

VU significa usuário virtual. As durações podem incluir tempo adicional para encerrar iterações em andamento; Load permite `gracefulRampDown` de 30 segundos e Stress de 10 segundos.

Também é possível executar diretamente, sem Node.js ou npm:

```powershell
k6 run src/tests/smoke/ipify.smoke.js
k6 run src/tests/load/jsonplaceholder.load.js
k6 run src/tests/stress/httpbin.stress.js
k6 run src/tests/soak/restcountries.soak.js
```

O atalho `npm run test:all` executa Smoke, Load e Stress sequencialmente e para se um comando falhar. Soak, Spike e Breakpoint são executados separadamente; os dois novos perfis exigem destino explícito.

### Comportamento dos exemplos

| Tipo | API e fluxo | Timeout | Think time |
| --- | --- | --- | --- |
| Smoke | `https://api.ipify.org?format=json`; valida HTTP 200 e campo `ip` como string não vazia. | 5s | 1s |
| Load | `https://jsonplaceholder.typicode.com`; 70% de chance de `GET /posts` e 30% de `GET /posts/{id}`, com ID entre 1 e 100; valida HTTP 200. | 10s | Aleatório de 0 até menos de 1,5s |
| Stress | `https://httpbin.org`; 80% de chance de `GET /get` e 20% de `GET /delay/1`; check aceita HTTP 200 ou 429. | 8s | 0,1s |
| Soak | `https://restcountries.com/v3.1/region/europe`; valida HTTP 200 e JSON como array não vazio. | 12s | Aleatório de 2 até menos de 5s |

As proporções são probabilidades por iteração e não cotas exatas em uma execução curta. Nos quatro exemplos antigos, todos os requests recebem `test_type` e `target`; Stress também recebe `delayed` como string `"true"` ou `"false"`.

### Thresholds e interpretação

| Tipo | `http_req_failed` | `http_req_duration` |
| --- | --- | --- |
| Smoke | `rate<0.01` | `p(95)<800` |
| Load | `rate<0.02` | `p(95)<1200` |
| Stress | `rate<0.10` | `p(95)<3000` |
| Soak | `rate<0.02` | `p(95)<2000` |

Os limites de duração estão em milissegundos. Thresholds não atendidos fazem o k6 terminar com código diferente de zero, permitindo futura integração com CI/CD.

Nos quatro exemplos antigos, checks registram validações funcionais sem threshold para `checks`. Nos novos, checks participam explicitamente da aprovação. No Stress, HTTP 429 passa no check solicitado, mas continua contando como falha em `http_req_failed` pelo comportamento padrão do k6. Isso preserva o limite de falhas especificado. Veja a [documentação sobre respostas esperadas](https://grafana.com/docs/k6/latest/javascript-api/k6-http/set-response-callback/).

## Configuração e evolução

O `.env.example` documenta variáveis e **não é carregado automaticamente pelo k6**. Preencher esse arquivo não configura uma execução. Passe variáveis com `-e` ou pelo ambiente, como nos exemplos abaixo. Os quatro perfis antigos mantêm suas URLs fixas; somente Spike e Breakpoint usam `BASE_URL` e `TARGET_PATH`.

Para adicionar uma API, crie o client HTTP, um cenário com a jornada e um entrypoint em `src/tests/`. Reutilize ou adicione options em `src/config/tests/` e registre o atalho no `package.json`. Reutilize os helpers de `src/utils/random.js` para manter a aleatoriedade consistente.

As pastas `results/` ficam inicialmente vazias; nenhuma ferramenta de relatório ou infraestrutura de pipeline é necessária. Em uma futura pipeline, disponibilize o executável k6, execute o mesmo entrypoint e preserve seu código de saída. Não versione tokens ou credenciais.

## Validação local

Após instalar o k6, execute:

```powershell
npm run check:k6
npm run test:smoke
```

O smoke realiza chamadas reais ao ipify e avalia os thresholds configurados. Se houver falha, examine no resumo do k6 os checks, a taxa de erros e o p95 para identificar a causa.

## Perguntas respondidas pelos seis tipos

| Tipo | Pergunta |
| --- | --- |
| Smoke | A jornada funciona com carga mínima? |
| Load | O serviço atende às metas sob a carga esperada? |
| Stress | Como se comporta sob uma sobrecarga planejada? |
| Soak | Mantém estabilidade durante exposição prolongada? |
| Spike | Tolera um pico abrupto e recupera o desempenho depois? |
| Breakpoint | Qual o primeiro nível observado que deixa de atender às metas ao aumentar a demanda? |

## Spike e Breakpoint: destino e jornada

Use um ambiente **local ou autorizado para receber carga**. Não existe destino padrão para os novos testes. `BASE_URL` é obrigatório e aceita uma origem HTTP(S) com host DNS ou IPv4 e porta opcional, por exemplo `http://127.0.0.1:8080`. IPv6, credenciais, path e query na origem não são aceitos neste exemplo simples. `TARGET_PATH` é opcional (padrão `/`), começa com uma única `/` e pode conter query codificada. Configuração ausente ou inválida falha no init, antes de requests; isso também vale para `k6 inspect`.

Os entrypoints `target.spike.js` e `target.breakpoint.js` conectam suas options à mesma `target.scenario.js`. A jornada faz um GET pelo `target.client.js`, timeout de 5s, sem seguir redirects, e verifica **HTTP 200 e corpo não vazio**. Somente HTTP 200 conta como resposta esperada em `http_req_failed`. Ao adaptar, substitua o check de corpo pelo contrato funcional real do endpoint; estes checks não comprovam regras de negócio de um produto.

Ambos usam `ramping-arrival-rate`: a demanda é agendada independentemente do tempo de resposta, enquanto houver VUs disponíveis. Taxas são **iterações/s**, não usuários simultâneos. Nesta jornada, uma iteração gera exatamente um GET; adicionar chamadas muda a relação com requests/s. Não há sleep ao final para controlar taxa. Veja o [executor oficial](https://grafana.com/docs/k6/latest/using-k6/scenarios/executors/ramping-arrival-rate/).

### Perfil Spike

| Fase (`phase`) | Duração padrão | Taxa |
| --- | --- | --- |
| `initial` | 30s | 2 iterações/s constantes |
| `rise` | 2s | De 2 a 20 |
| `peak` | 20s | 20 constantes |
| `fall` | 2s | De 20 a 2 |
| `recovery` | 60s | 2 constantes |

Total: 114s, mais até 5s para finalizar iterações. A recuperação começa imediatamente após a descida. Critério didático verificável: **na janela inteira de recuperação**, p95 < 500ms, falhas HTTP < 1%, checks >= 99% e pelo menos uma resposta. A fase inicial tem as mesmas metas. No pico: p95 < 1500ms, falhas < 5%, checks >= 95%. Globalmente: p95 < 1500ms, falhas < 5%, checks >= 95% e zero iterações descartadas. Subida e descida entram nos critérios globais e nas séries temporais.

Os thresholds filtrados por `phase:recovery` avaliam a recuperação separadamente; o agregado global não comprova recuperação. O p95 da janela tampouco comprova ausência de oscilações ou o instante exato de recuperação: consulte a série temporal. Ajuste em `spike.options.js` a tolerância do pico e os limites inicial/recuperação conforme os requisitos, mantendo o critério global coerente. Caso se permita um prazo de estabilização, modele esse intervalo explicitamente antes da janela avaliada.

| Variável | Padrão | Significado |
| --- | --- | --- |
| `SPIKE_BASE_RATE` | 2 | Taxa inicial e de recuperação |
| `SPIKE_PEAK_RATE` | 20 | Pico, maior que a taxa inicial |
| `SPIKE_INITIAL_SECONDS` | 30 | Observação inicial |
| `SPIKE_RAMP_SECONDS` | 2 | Duração de cada transição |
| `SPIKE_PEAK_SECONDS` | 20 | Sustentação do pico |
| `SPIKE_RECOVERY_SECONDS` | 60 | Observação após a descida |

### Perfil Breakpoint

Padrão: cinco patamares de **2, 7, 12, 17 e 22 iterações/s**, cada um mantido por 20s, com rampas de 2s entre eles. Total máximo: 108s mais até 5s de encerramento. O último nível é limitado exatamente ao teto, mesmo se o incremento não dividir o intervalo. `level_1` a `level_5` identificam patamares; `ramp_2` a `ramp_5` identificam transições.

| Variável | Padrão | Significado |
| --- | --- | --- |
| `BREAKPOINT_START_RATE` | 2 | Taxa do primeiro nível |
| `BREAKPOINT_INCREMENT` | 5 | Incremento entre níveis |
| `BREAKPOINT_MAX_RATE` | 22 | Teto, maior que a taxa inicial |
| `BREAKPOINT_LEVEL_SECONDS` | 20 | Tempo em cada patamar |
| `BREAKPOINT_RAMP_SECONDS` | 2 | Tempo entre patamares |

Por patamar: **p95 < 800ms, falhas HTTP < 2%, checks >= 99% e pelo menos uma resposta**. Estas são metas de avaliação, sem aborto imediato: é possível observar o nível seguinte após uma violação moderada. As guardas globais interrompem a execução se p95 >= 2000ms, falhas >= 20%, checks < 80% ou houver qualquer `dropped_iterations`. A alternativa é encerrar ao concluir o teto finito.

As guardas usam `abortOnFail` com `delayAbortEval` igual à duração de um patamar. O atraso é contado desde o início do teste e permite coletar amostras antes de avaliar o aborto; **não reinicia a cada nível e não cria uma janela móvel**. O k6 avalia periodicamente, portanto a parada não é instantânea. Os agregados podem diluir uma degradação recente e não identificam o nível exato de ruptura. Veja [thresholds oficiais](https://grafana.com/docs/k6/latest/using-k6/thresholds/).

Se houver aborto, os níveis futuros não têm evidências; seus thresholds sem amostras, inclusive contagem mínima, não indicam falha do sistema nesses níveis. O patamar interrompido é parcial e deve ser identificado como tal. Compare cada patamar observado com suas metas e registre **o primeiro que viola** e **o maior que atende**, incluindo eventuais resultados não monotônicos. Se nenhum violar, diga apenas que o sistema suportou a carga testada; o máximo não foi encontrado. Granularidade, duração, volume de amostras, variabilidade e repetições limitam a precisão. Refine o intervalo e repita antes de estimar capacidade.

### Recursos e validação dos parâmetros

`PRE_ALLOCATED_VUS=20` e `MAX_VUS=100` valem para ambos. Cada VU executa uma iteração por vez; latência maior exige mais VUs para sustentar a taxa. Ajuste recursos com base na duração das iterações e na capacidade do gerador; a criação dinâmica de VUs também tem custo. `MAX_VUS` deve ser >= `PRE_ALLOCATED_VUS`.

Todos os parâmetros numéricos aceitam apenas inteiros positivos, sem unidade: valores vazios, negativos, zero e decimais falham no init. Taxas/incrementos têm limite de 100000; VUs, de 10000; durações de patamar/janela, de 3600 segundos; transições, de 60 segundos. Breakpoint aceita no máximo 50 níveis. São proteções de configuração, não recomendações de carga. O teto temporal é calculado como `níveis × tempo do patamar + (níveis − 1) × tempo da rampa`, mais encerramento. Para Spike, some as cinco fases.

### Comandos com destino ilustrativo

Os comandos pressupõem um serviço local já ativo em `127.0.0.1:8080`, cujo `/health` responde HTTP 200 e corpo não vazio. Troque pelo ambiente autorizado. Não use parâmetros CLI que substituam o executor (`--vus`, `--duration` ou `--stage`): as tags de fase dependem do cronograma configurado nas options.

macOS/Linux, pelo npm:

```bash
BASE_URL=http://127.0.0.1:8080 TARGET_PATH=/health npm run test:spike
BASE_URL=http://127.0.0.1:8080 TARGET_PATH=/health npm run test:breakpoint
```

PowerShell, pelo npm:

```powershell
$env:BASE_URL = "http://127.0.0.1:8080"
$env:TARGET_PATH = "/health"
npm run test:spike
npm run test:breakpoint
```

Diretamente pelo k6 (mesma sintaxe em macOS/Linux e PowerShell):

```bash
k6 run -e BASE_URL=http://127.0.0.1:8080 -e TARGET_PATH=/health --out json=results/raw/spike.json src/tests/spike/target.spike.js
k6 run -e BASE_URL=http://127.0.0.1:8080 -e TARGET_PATH=/health -e BREAKPOINT_START_RATE=2 -e BREAKPOINT_INCREMENT=2 -e BREAKPOINT_MAX_RATE=6 -e BREAKPOINT_LEVEL_SECONDS=10 --out json=results/raw/breakpoint.json src/tests/breakpoint/target.breakpoint.js
```

Para uma verificação curta de integração (12s de Spike; 5s de Breakpoint, mais encerramento), em qualquer um desses shells:

```bash
k6 run -e BASE_URL=http://127.0.0.1:8080 -e TARGET_PATH=/health -e SPIKE_BASE_RATE=1 -e SPIKE_PEAK_RATE=2 -e SPIKE_INITIAL_SECONDS=2 -e SPIKE_RAMP_SECONDS=1 -e SPIKE_PEAK_SECONDS=2 -e SPIKE_RECOVERY_SECONDS=6 --out json=results/raw/spike-short.json src/tests/spike/target.spike.js
k6 run -e BASE_URL=http://127.0.0.1:8080 -e TARGET_PATH=/health -e BREAKPOINT_START_RATE=1 -e BREAKPOINT_INCREMENT=1 -e BREAKPOINT_MAX_RATE=2 -e BREAKPOINT_LEVEL_SECONDS=2 -e BREAKPOINT_RAMP_SECONDS=1 --out json=results/raw/breakpoint-short.json src/tests/breakpoint/target.breakpoint.js
```

Essas execuções curtas verificam integração, não estimam capacidade. Para inspecionar sem carga: `k6 inspect -e BASE_URL=http://127.0.0.1:8080 src/tests/spike/target.spike.js` (troque o entrypoint para Breakpoint).

### Evidências e interpretação

O resumo do terminal mostra thresholds globais e por fase/patamar. Salve também a saída `--out json=...`: o arquivo contém um objeto JSON por linha, não um array. Não exige serviço externo. Preserve as options efetivas (`k6 inspect` com as mesmas variáveis), comandos/variáveis usados, horário, versão do k6 e características do alvo e gerador junto aos resultados. A [saída JSON oficial](https://grafana.com/docs/k6/latest/results-output/real-time/json/) contém timestamps e tags para consulta posterior.

Exemplo de consulta com `jq` opcional (macOS/Linux ou PowerShell com jq instalado):

```bash
jq -c 'select(.type == "Point" and (.metric == "http_req_duration" or .metric == "http_req_failed" or .metric == "checks" or .metric == "journey_started" or .metric == "http_reqs" or .metric == "dropped_iterations" or .metric == "vus")) | {metric, data}' results/raw/breakpoint.json
```

Relacione o cronograma de taxas oferecidas das options com as contagens de `journey_started` (iterações iniciadas), `http_reqs` (requisições concluídas), latência, falhas e checks por `phase`. Divida contagens pela duração observada para taxas médias, separando rampas de patamares. `journey_started` marca o início; métricas HTTP são emitidas na conclusão. A fase é fixada no início da iteração usando [`exec.scenario.startTime`](https://grafana.com/docs/k6/latest/javascript-api/k6-execution/); uma resposta lenta pode terminar na fase seguinte e manter a tag anterior. Não use IDs de iteração ou timestamps como tags.

`dropped_iterations` é emitido pelo executor, sem a tag customizada `phase`: correlacione seu timestamp e `scenario` com o cronograma. Observe também VUs, CPU e memória do gerador. Descartes indicam demanda não entregue e reprovam estes exemplos; podem resultar de insuficiência de VUs, saturação do gerador ou lentidão do alvo ocupando VUs. Sozinhos não comprovam ruptura do sistema. Corrija o gerador/dimensionamento e repita antes de atribuir o limite ao alvo. Veja [iterações descartadas](https://grafana.com/docs/k6/latest/using-k6/scenarios/concepts/dropped-iterations/).

Sucesso exige thresholds atendidos, fases observadas e entrega de carga coerente. Falha funcional ou de latência reprova mesmo com processo concluído. Aborto significa execução incompleta: registre motivo, duração e último nível observado. Uma reprovação pode ser esperada na exploração de Breakpoint, mas **o código de saída não é mascarado** pelos atalhos npm. Consulte `$?` imediatamente após k6 no macOS/Linux (por exemplo `echo $?`) ou `$LASTEXITCODE` no PowerShell. Não use `|| true` em CI para transformar reprovação em sucesso.

### Levantamento e exemplos escritos

Todos os valores são didáticos ajustáveis; não são requisitos de um produto nem evidência de sua capacidade.

**Spike — roteiro:** qual a carga inicial, o pico esperado, a velocidade da subida, a duração e frequência dos picos, a tolerância durante o pico e o prazo de recuperação? As taxas e tempos viram `startRate` e `stages` nas options; tolerância e desempenho pós-pico viram thresholds por fase; sucesso da operação vira checks na jornada. Frequência exige repetir o ciclo explicitamente: este exemplo contém apenas um pico.

**Exemplo Spike:** objetivo: observar um serviço local sob pico de 2 para 20 iterações/s e a recuperação. Pré-condições: destino autorizado, GET respondendo 200 com corpo, gerador dimensionado e estado inicial conhecido. Etapas/carga: 30s a 2/s, subida em 2s, 20s a 20/s, descida em 2s e 60s a 2/s. Critérios: pico p95 < 1500ms, falhas < 5%, checks >= 95%; inicial e recuperação p95 < 500ms, falhas < 1%, checks >= 99%, com respostas observadas e zero descartes. Evidências: resumo por fase, JSON temporal, cronograma e recursos do gerador. O requisito de recuperação aqui significa cumprir as metas na janela de 60s inteira após a descida, não esperar 60s para então começar a medir.

**Breakpoint — roteiro:** qual a carga inicial, os incrementos, o tempo por nível, o limite procurado (latência, erros, regra funcional), o teto de execução, a condição de parada e as evidências necessárias? Taxas, teto e duração viram options; limite procurado vira thresholds por nível; parada vira guardas globais; contrato funcional vira checks; evidências viram saída JSON e registro do cronograma.

**Exemplo Breakpoint:** objetivo: localizar um intervalo observado de violação das metas de um GET. Pré-condições: alvo autorizado e estável, resposta 200 com corpo, recursos do gerador monitorados. Etapas/carga: patamares 2/7/12/17/22 iterações/s por 20s, rampas de 2s. Critérios por nível: p95 < 800ms, falhas < 2%, checks >= 99% e resposta observada. Parada: guardas globais de 2000ms/20%/80% ou descartes, após atraso inicial de 20s, ou teto de 108s. Evidências: JSON e resumo com o primeiro nível reprovado e maior aprovado, distinguindo patamares completos/parciais e carga não entregue. Nenhuma violação até 22/s significa somente suporte à carga testada; repetir com resolução adequada é necessário para refinar uma estimativa.

### Verificações desta implementação

Validação local com k6 v2.2.0, sem carga contra serviços públicos:

- Sintaxe dos sete arquivos JavaScript novos, imports/options via `k6 inspect` e durações padrão (114s/108s) conferidos.
- Ambos os atalhos npm sem `BASE_URL` falharam antes de iniciar carga; 11 combinações inválidas de destino, parâmetros e recursos foram rejeitadas.
- Servidor HTTP temporário em loopback: Spike reduzido de 12s e Breakpoint de 5s aprovados, com tags das fases/patamares e JSON coletado.
- Corpo vazio provocou aborto por checks no Breakpoint; um único VU com resposta lenta provocou aborto por `dropped_iterations`.
- Spike de 8s com uma falha funcional apenas na recuperação reprovou `checks{phase:recovery}`, mantendo o threshold global de checks aprovado.
- Comandos existentes e código dos quatro exemplos anteriores preservados; `git diff --check` sem erros.

O servidor temporário foi encerrado. Evidências locais estão em `results/raw/validation-*.json` e `results/reports/validation-*.txt`, ignoradas pelo Git. Não foram executados os perfis completos nem validada a capacidade de um produto real. Os comandos PowerShell foram documentados, mas não executados neste ambiente macOS.
