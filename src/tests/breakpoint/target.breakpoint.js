import { breakpointOptions, breakpointStages } from "../../config/tests/breakpoint.options.js";
import { targetScenario } from "../../scenarios/target.scenario.js";

export const options = breakpointOptions;

export default function () {
  targetScenario("breakpoint", breakpointStages);
}
