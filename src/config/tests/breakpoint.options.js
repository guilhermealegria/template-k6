import { positiveInteger, vuLimits, k6Stages, phaseThresholds } from "../../utils/load-profile.js";

const initial = positiveInteger("BREAKPOINT_START_RATE", 2);
const increment = positiveInteger("BREAKPOINT_INCREMENT", 5);
const ceiling = positiveInteger("BREAKPOINT_MAX_RATE", 22);
const hold = positiveInteger("BREAKPOINT_LEVEL_SECONDS", 20, 3600);
const ramp = positiveInteger("BREAKPOINT_RAMP_SECONDS", 2, 60);
if (ceiling <= initial) throw new Error("BREAKPOINT_MAX_RATE deve ser > BREAKPOINT_START_RATE.");
const levels = Math.ceil((ceiling - initial) / increment) + 1;
if (levels > 50) throw new Error("Breakpoint permite no máximo 50 níveis; ajuste incremento ou teto.");

export const breakpointStages = [];
const thresholds = {
  // Guardas agregadas de interrupção; as metas por nível abaixo são mais estritas.
  http_req_duration: [{ threshold: "p(95)<2000", abortOnFail: true, delayAbortEval: `${hold}s` }],
  http_req_failed: [{ threshold: "rate<0.20", abortOnFail: true, delayAbortEval: `${hold}s` }],
  checks: [{ threshold: "rate>=0.80", abortOnFail: true, delayAbortEval: `${hold}s` }],
  dropped_iterations: [{ threshold: "count==0", abortOnFail: true, delayAbortEval: `${hold}s` }],
};
for (let index = 0; index < levels; index++) {
  const target = Math.min(initial + index * increment, ceiling);
  const phase = `level_${index + 1}`;
  if (index > 0) breakpointStages.push({ phase: `ramp_${index + 1}`, seconds: ramp, target });
  breakpointStages.push({ phase, seconds: hold, target });
  Object.assign(thresholds, phaseThresholds(phase, 800, 0.02, 0.99));
}

export const breakpointOptions = {
  scenarios: {
    breakpoint: {
      executor: "ramping-arrival-rate",
      startRate: initial,
      timeUnit: "1s",
      ...vuLimits(),
      stages: k6Stages(breakpointStages),
      gracefulStop: "5s",
    },
  },
  thresholds,
};
