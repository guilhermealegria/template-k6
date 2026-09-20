import { check } from "k6";

export function checkPublicIp(response) {
  return check(response, {
    "status is 200": (r) => r.status === 200,
    "has ip field": (r) => {
      try {
        const body = r.json();
        return typeof body.ip === "string" && body.ip.length > 0;
      } catch (_) {
        return false;
      }
    },
  });
}
