// Apenas os dois novos perfis usam estes helpers.
export function positiveInteger(name, fallback, maximum = 100000) {
  const raw = __ENV[name] === undefined ? String(fallback) : __ENV[name];
  const value = Number(raw);
  if (!/^[0-9]+$/.test(raw) || !Number.isSafeInteger(value) || value < 1 || value > maximum) {
    throw new Error(`${name} deve ser um inteiro entre 1 e ${maximum}.`);
  }
  return value;
}

export function vuLimits() {
  const preAllocatedVUs = positiveInteger("PRE_ALLOCATED_VUS", 20, 10000);
  const maxVUs = positiveInteger("MAX_VUS", 100, 10000);
  if (maxVUs < preAllocatedVUs) throw new Error("MAX_VUS deve ser >= PRE_ALLOCATED_VUS.");
  return { preAllocatedVUs, maxVUs };
}

// Segundos inteiros mantêm configuração e atribuição temporal consistentes.
export function stageAt(stages, elapsedMs) {
  let endMs = 0;
  for (const stage of stages) {
    endMs += stage.seconds * 1000;
    if (elapsedMs < endMs) return stage;
  }
  return stages[stages.length - 1];
}

export function k6Stages(stages) {
  return stages.map(({ seconds, target }) => ({ duration: `${seconds}s`, target }));
}

export function phaseThresholds(phase, latency, errors, checks) {
  return {
    [`http_req_duration{phase:${phase}}`]: [`p(95)<${latency}`],
    [`http_req_failed{phase:${phase}}`]: [`rate<${errors}`],
    [`checks{phase:${phase}}`]: [`rate>=${checks}`],
    // Evita interpretar uma fase sem nenhuma resposta como aprovada.
    [`http_reqs{phase:${phase}}`]: ["count>0"],
  };
}
