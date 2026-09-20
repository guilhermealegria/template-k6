import { check, sleep } from "k6";
import { fastGet, delayedGet } from "../clients/httpbin.client.js";
import { chance } from "../utils/random.js";

export function httpbinStressScenario() {
  const isDelayed = chance(0.2);
  const tags = {
    test_type: "stress",
    target: "httpbin",
    delayed: String(isDelayed),
  };
  const response = isDelayed ? delayedGet(tags) : fastGet(tags);

  check(response, {
    "status is 200 or 429": (r) => r.status === 200 || r.status === 429,
  });
  sleep(0.1);
}
