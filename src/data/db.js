const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

let dbPromise;

async function initDatabase(csvFile) {
  const SQL = await initSqlJs();
  const db = new SQL.Database();
  db.run(`CREATE TABLE movies (
    year INTEGER NOT NULL,
    producer TEXT NOT NULL,
    winner INTEGER NOT NULL
  )`);

  const linhas = fs
    .readFileSync(path.resolve(csvFile), 'utf8')
    .trim()
    .split(/\r?\n/)
    .slice(1);

  for (let idx = 0; idx < linhas.length; idx++) {
    const linha = linhas[idx];
    // Validação do delimitador e quantidade de colunas
    if (!linha.includes(';')) {
      console.error(
        `[Linha ${
          idx + 2
        }] Ignorada: delimitador ";" não encontrado. Conteúdo: ${linha}`
      );
      continue;
    }
    const partes = linha.split(';');
    if (partes.length < 5) {
      console.error(
        `[Linha ${idx + 2}] Ignorada: menos de 5 colunas. Conteúdo: ${linha}`
      );
      continue;
    }
    if (partes.length > 5) {
      console.warn(
        `[Linha ${
          idx + 2
        }] Atenção: mais de 5 colunas encontradas. Usando apenas as 5 primeiras. Conteúdo: ${linha}`
      );
    }
    // Extrai os campos (ignorando extras)
    const [ano, , , produtores, vencedor] = partes
      .slice(0, 5)
      .map((p) => p.trim());
    // Validação de campos obrigatórios
    if (!ano || !produtores || !vencedor) {
      console.error(
        `[Linha ${
          idx + 2
        }] Ignorada: campo(s) vazio(s). Ano: "${ano}", Produtores: "${produtores}", Vencedor: "${vencedor}". Conteúdo: ${linha}`
      );
      continue;
    }
    // Validação do ano
    const anoNum = parseInt(ano, 10);
    if (Number.isNaN(anoNum) || anoNum < 1900 || anoNum > 2100) {
      console.error(
        `[Linha ${idx + 2}] Ignorada: ano inválido "${ano}". Conteúdo: ${linha}`
      );
      continue;
    }
    // Validação do campo 'vencedor'
    const vencedorLimpo = vencedor.toLowerCase();
    if (
      vencedorLimpo !== 'yes' &&
      vencedorLimpo !== 'no' &&
      vencedorLimpo !== ''
    ) {
      console.error(
        `[Linha ${
          idx + 2
        }] Ignorada: valor inválido para 'winner' ("${vencedor}"). Esperado "yes" ou "no". Conteúdo: ${linha}`
      );
      continue;
    }
    const win = vencedorLimpo === 'yes' ? 1 : 0;
    // Processa múltiplos produtores (pode estar separados por ',' ou ' and ')
    const produtoresArr = produtores
      .split(/,| and /)
      .map((p) => p.trim())
      .filter(Boolean);
    if (produtoresArr.length === 0) {
      console.error(
        `[Linha ${
          idx + 2
        }] Ignorada: nenhum produtor válido. Conteúdo: ${linha}`
      );
      continue;
    }
    // Inserção no banco
    for (const prod of produtoresArr) {
      if (!prod) continue;
      try {
        db.run('INSERT INTO movies (year, producer, winner) VALUES (?, ?, ?)', [
          anoNum,
          prod,
          win
        ]);
      } catch (err) {
        console.error(
          `[Linha ${
            idx + 2
          }] Erro ao inserir no banco: Produtor="${prod}", Ano=${anoNum}, Winner=${win}. Erro: ${
            err.message
          }`
        );
      }
    }
  }
  dbPromise = Promise.resolve(db);
  return db;
}

// Retorna registros vencedores ordenados por ano
async function selectWinners() {
  const db = await dbPromise;
  const res = db.exec(
    'SELECT year, producer FROM movies WHERE winner = 1 ORDER BY year'
  );
  if (!res.length) return [];
  const [columns, rows] = [res[0].columns, res[0].values];
  return rows.map((row) =>
    Object.fromEntries(row.map((v, i) => [columns[i], v]))
  );
}

module.exports = { initDatabase, selectWinners };
