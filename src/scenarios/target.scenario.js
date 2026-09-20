import { check } from "k6";
import exec from "k6/execution";
import { Counter } from "k6/metrics";
import { getTarget } from "../clients/target.client.js";
import { stageAt } from "../utils/load-profile.js";

const started = new Counter("journey_started");

export function targetScenario(testType, stages) {
  // A fase fica vinculada ao início da iteração, mesmo se a resposta cruzar a fronteira.
  const stage = stageAt(stages, Date.now() - exec.scenario.startTime);
  const tags = { test_type: testType, phase: stage.phase };
  started.add(1, tags);
  const response = getTarget(tags);
  check(response, {
    "status is 200": (r) => r.status === 200,
    "body is not empty": (r) => typeof r.body === "string" && r.body.trim().length > 0,
  }, tags);
  // Arrival rate agenda as iterações; não há sleep para controlar a taxa.
}
