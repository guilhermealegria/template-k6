import { stressOptions } from "../../config/tests/stress.options.js";
import { httpbinStressScenario } from "../../scenarios/httpbin.scenario.js";

export const options = stressOptions;

export default function () {
  httpbinStressScenario();
}
