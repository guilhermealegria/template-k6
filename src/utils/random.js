export function getRandomIntInclusive(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function chance(probability) {
  return Math.random() < probability;
}

export function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

export function randomSleepSeconds(maxSeconds) {
  return randomBetween(0, maxSeconds);
}
