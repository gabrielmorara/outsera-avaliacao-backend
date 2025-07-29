const path = require('path');
const fs = require('fs');
const http = require('http');
const { computeIntervals, calculateResult } = require('./service/service');
const { initDatabase } = require('./data/db');

// Carrega as variáveis de ambiente de um arquivo .env
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

// Inicia o servidor HTTP e expõe os endpoints da API
function startServer(result) {
  const DOCS_PATH = path.join(__dirname, 'docs');
  const SWAGGER_JSON = path.join(DOCS_PATH, 'swagger.json');
  const DOCS_HTML = path.join(DOCS_PATH, 'docs.html');

  const server = http.createServer((req, res) => {
    try {
      // Permite apenas GET
      if (req.method !== 'GET') {
        res.writeHead(405, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Método Não Permitido' }));
        return;
      }

      const url = new URL(req.url, `http://${req.headers.host}`);

      // Endpoint principal da API
      if (url.pathname === '/producers/intervals') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
        return;
      }

      // swagger.json (documentação OpenAPI)
      if (url.pathname === '/docs/swagger.json') {
        try {
          const spec = fs.readFileSync(SWAGGER_JSON);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(spec);
        } catch {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Swagger não encontrado' }));
        }
        return;
      }

      // interface do Swagger UI (docs.html)
      if (url.pathname === '/docs/swagger') {
        try {
          const html = fs.readFileSync(DOCS_HTML);
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(html);
        } catch {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Docs não encontrado' }));
        }
        return;
      }

      // Redireciona a raiz para a documentação
      if (url.pathname === '/') {
        res.writeHead(302, { Location: '/docs/swagger' });
        res.end();
        return;
      }

      // Qualquer outro endpoint
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Não Encontrado' }));
    } catch (err) {
      console.error('Erro interno do servidor:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Erro Interno do Servidor' }));
    }
  });

  const port = process.env.PORT || 3000;
  server.listen(port, () => console.log(`Servidor rodando na porta ${port}`));
  return server;
}

// Função principal de inicialização
async function start() {
  loadEnv();

  const csvFile = process.env.CSV_PATH
    ? path.resolve(process.env.CSV_PATH)
    : path.join(__dirname, 'data/seeds/movielist.csv');

  let result;
  try {
    await initDatabase(csvFile);
    const intervals = await computeIntervals();
    result = calculateResult(intervals);
  } catch (err) {
    console.error('Erro ao preparar dados:', err);
    result = { min: [], max: [] };
  }

  return startServer(result);
}

module.exports = { start, computeIntervals, startServer };

if (require.main === module) {
  (async () => {
    await start();
  })();
}
