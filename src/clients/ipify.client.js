import http from "k6/http";

export function getPublicIp(tags = {}) {
  return http.get("https://api.ipify.org?format=json", {
    tags,
    timeout: "5s",
  });
}
