const { selectWinners } = require('../data/db');

/**
 * Calcula os intervalos de tempo entre vitórias consecutivas de cada produtor.
 * 
 * Este método utiliza os registros de vencedores retornados por `selectWinners()`
 * para construir uma lista de objetos, onde cada objeto representa um intervalo
 * entre duas vitórias do mesmo produtor.
 * 
 * - Agrupa os anos de vitória por produtor.
 * - Para cada produtor com mais de uma vitória, calcula os intervalos de tempo entre elas.
 * - Retorna uma lista com os intervalos, incluindo o produtor, o intervalo (em anos),
 *   o ano da vitória anterior e o ano da vitória seguinte.
 * 
 * 
 * @returns {Promise<Array<Object>>} Lista de objetos com informações sobre os intervalos de vitórias por produtor.
 */
async function computeIntervals() {
  const registros = await selectWinners();
  const winsMap = new Map();
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

/**
 * Monta o objeto de resultado agrupando os intervalos mínimo e máximo.
 * 
 * Este método recebe uma lista de intervalos e retorna um objeto contendo:
 * - `min`: todos os intervalos com o menor valor encontrado.
 * - `max`: todos os intervalos com o maior valor encontrado.
 * 
 * Caso a lista esteja vazia, retorna ambos os arrays vazios.
 * 
 * @param {Array<Object>} intervals Lista de objetos representando intervalos de vitórias.
 * @returns {Object} Objeto com as propriedades `min` e `max`, cada uma contendo uma lista de intervalos.
 */
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
