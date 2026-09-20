import { smokeOptions } from "../../config/tests/smoke.options.js";
import { ipifySmokeScenario } from "../../scenarios/ipify.scenario.js";

export const options = smokeOptions;

export default function () {
  ipifySmokeScenario();
}
