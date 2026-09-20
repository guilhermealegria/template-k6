import http from "k6/http";

const BASE_URL = "https://jsonplaceholder.typicode.com";

export function getPosts(tags = {}) {
  return http.get(`${BASE_URL}/posts`, { tags, timeout: "10s" });
}

export function getPostById(id, tags = {}) {
  return http.get(`${BASE_URL}/posts/${id}`, { tags, timeout: "10s" });
}
