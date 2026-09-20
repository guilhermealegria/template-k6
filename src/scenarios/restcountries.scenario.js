import { check, sleep } from "k6";
import { getCountriesByRegion } from "../clients/restcountries.client.js";
import { randomBetween } from "../utils/random.js";

export function restCountriesSoakScenario() {
  const response = getCountriesByRegion("europe", {
    test_type: "soak",
    target: "restcountries",
  });

  let countries;
  try {
    countries = response.json();
  } catch (_) {
    // Respostas inválidas devem falhar nos checks sem interromper a iteração.
    countries = null;
  }

  check(response, {
    "status is 200": (r) => r.status === 200,
    "body is an array": () => Array.isArray(countries),
    "array is not empty": () => Array.isArray(countries) && countries.length > 0,
  });
  sleep(randomBetween(2, 5));
}
