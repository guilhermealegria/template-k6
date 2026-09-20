import { loadOptions } from "../../config/tests/load.options.js";
import { jsonPlaceholderLoadScenario } from "../../scenarios/jsonplaceholder.scenario.js";

export const options = loadOptions;

export default function () {
  jsonPlaceholderLoadScenario();
}
