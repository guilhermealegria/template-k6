import { check, sleep } from "k6";
import { getPosts, getPostById } from "../clients/jsonplaceholder.client.js";
import {
  chance,
  getRandomIntInclusive,
  randomSleepSeconds,
} from "../utils/random.js";

export function jsonPlaceholderLoadScenario() {
  const tags = { test_type: "load", target: "jsonplaceholder" };
  const response = chance(0.7)
    ? getPosts(tags)
    : getPostById(getRandomIntInclusive(1, 100), tags);

  check(response, { "status is 200": (r) => r.status === 200 });
  sleep(randomSleepSeconds(1.5));
}
