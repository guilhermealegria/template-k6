import http from "k6/http";

const BASE_URL = "https://restcountries.com/v3.1";

export function getCountriesByRegion(region, tags = {}) {
  return http.get(`${BASE_URL}/region/${encodeURIComponent(region)}`, {
    tags,
    timeout: "12s",
  });
}
