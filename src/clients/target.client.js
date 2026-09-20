import http from "k6/http";

// Validação no init: nenhum request pode ocorrer antes dela.
const base = __ENV.BASE_URL;
const origin = typeof base === "string" && base.match(/^https?:\/\/([a-zA-Z0-9.-]+)(?::([0-9]{1,5}))?\/?$/);
if (!origin || !origin[1].split(".").every((label) =>
  /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/.test(label)) ||
  (origin[2] && (Number(origin[2]) < 1 || Number(origin[2]) > 65535)) ||
  (/^[0-9.]+$/.test(origin[1]) && (origin[1].split(".").length !== 4 ||
    origin[1].split(".").some((part) => Number(part) > 255)))) {
  throw new Error("BASE_URL obrigatório: use uma origem http(s) válida, como http://127.0.0.1:8080, sem path, credenciais ou query (host DNS/IPv4).");
}
const path = __ENV.TARGET_PATH === undefined ? "/" : __ENV.TARGET_PATH;
if (!/^\/(?!\/)/.test(path) || /[\s\\#\x00-\x1f\x7f]/.test(path) || /%(?![a-fA-F0-9]{2})/.test(path)) {
  throw new Error("TARGET_PATH deve começar com uma única /, sem espaços, fragmentos ou barras invertidas; exemplo: /health.");
}
const url = `${base.replace(/\/$/, "")}${path}`;

export function getTarget(tags) {
  return http.get(url, {
    tags: { ...tags, name: "GET target" },
    timeout: "5s",
    redirects: 0,
    responseCallback: http.expectedStatuses(200),
  });
}
