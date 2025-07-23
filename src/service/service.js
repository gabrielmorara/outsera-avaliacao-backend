const { selectWinners } = require('../data/db');

// Converte os registros vencedores em objetos de intervalo
function computeIntervals() {
  const winsMap = new Map();
  const registros = selectWinners();
  for (const { year, producer } of registros) {
    if (!winsMap.has(producer)) winsMap.set(producer, []);
    winsMap.get(producer).push(year);
  }
  const wins = winsMap;
  const intervals = [];

  for (const [producer, years] of wins.entries()) {
    years.sort((a, b) => a - b);
    for (let i = 1; i < years.length; i++) {
      intervals.push({
        producer,
        interval: years[i] - years[i - 1],
        previousWin: years[i - 1],
        followingWin: years[i]
      });
    }
  }

  return intervals;
}

// Constroi o objeto final a partir de todos os intervalos
function calculateResult(intervals) {
  if (!intervals.length) return { min: [], max: [] };
  const minVal = Math.min(...intervals.map((i) => i.interval));
  const maxVal = Math.max(...intervals.map((i) => i.interval));
  return {
    min: intervals.filter((i) => i.interval === minVal),
    max: intervals.filter((i) => i.interval === maxVal)
  };
}

module.exports = { computeIntervals, calculateResult };
