import { soakOptions } from "../../config/tests/soak.options.js";
import { restCountriesSoakScenario } from "../../scenarios/restcountries.scenario.js";

export const options = soakOptions;

export default function () {
  restCountriesSoakScenario();
}
