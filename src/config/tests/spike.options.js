import { positiveInteger, vuLimits, k6Stages, phaseThresholds } from "../../utils/load-profile.js";

const baseline = positiveInteger("SPIKE_BASE_RATE", 2);
const peak = positiveInteger("SPIKE_PEAK_RATE", 20);
if (peak <= baseline) throw new Error("SPIKE_PEAK_RATE deve ser > SPIKE_BASE_RATE.");
const initial = positiveInteger("SPIKE_INITIAL_SECONDS", 30, 3600);
const ramp = positiveInteger("SPIKE_RAMP_SECONDS", 2, 60);
const hold = positiveInteger("SPIKE_PEAK_SECONDS", 20, 3600);
const recovery = positiveInteger("SPIKE_RECOVERY_SECONDS", 60, 3600);

export const spikeStages = [
  { phase: "initial", seconds: initial, target: baseline },
  { phase: "rise", seconds: ramp, target: peak },
  { phase: "peak", seconds: hold, target: peak },
  { phase: "fall", seconds: ramp, target: baseline },
  { phase: "recovery", seconds: recovery, target: baseline },
];

export const spikeOptions = {
  scenarios: {
    spike: {
      executor: "ramping-arrival-rate",
      startRate: baseline,
      timeUnit: "1s",
      ...vuLimits(),
      stages: k6Stages(spikeStages),
      gracefulStop: "5s",
    },
  },
  thresholds: {
    http_req_duration: ["p(95)<1500"],
    http_req_failed: ["rate<0.05"],
    checks: ["rate>=0.95"],
    dropped_iterations: ["count==0"],
    ...phaseThresholds("initial", 500, 0.01, 0.99),
    ...phaseThresholds("peak", 1500, 0.05, 0.95),
    ...phaseThresholds("recovery", 500, 0.01, 0.99),
  },
};
