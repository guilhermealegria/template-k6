import http from "k6/http";

const BASE_URL = "https://httpbin.org";

export function fastGet(tags = {}) {
  return http.get(`${BASE_URL}/get`, { tags, timeout: "8s" });
}

export function delayedGet(tags = {}) {
  return http.get(`${BASE_URL}/delay/1`, { tags, timeout: "8s" });
}
