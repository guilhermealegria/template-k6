export const soakOptions = {
  scenarios: {
    soak: {
      executor: "constant-vus",
      vus: 5,
      duration: "15m",
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.02"],
    http_req_duration: ["p(95)<2000"],
  },
};
