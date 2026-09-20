import { sleep } from "k6";
import { getPublicIp } from "../clients/ipify.client.js";
import { checkPublicIp } from "../utils/checks/ipify.checks.js";

export function ipifySmokeScenario() {
  const response = getPublicIp({ test_type: "smoke", target: "ipify" });
  checkPublicIp(response);
  sleep(1);
}
