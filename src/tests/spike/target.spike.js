import { spikeOptions, spikeStages } from "../../config/tests/spike.options.js";
import { targetScenario } from "../../scenarios/target.scenario.js";

export const options = spikeOptions;

export default function () {
  targetScenario("spike", spikeStages);
}
