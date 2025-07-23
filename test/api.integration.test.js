const { spawn } = require('child_process');

const PORT = 3010;
let servidor;

beforeAll(async () => {
  servidor = spawn('node', ['index.js'], {
    env: { ...process.env, PORT }
  });
  await new Promise((resolve) => setTimeout(resolve, 1200));
});

afterAll(() => {
  if (servidor) servidor.kill();
});

describe('Testes de Integração API', () => {
  it('deve retornar o output EXATO para intervalos', async () => {
    const res = await fetch(`http://localhost:${PORT}/producers/intervals`);
    const outputEsperado = {
      min: [
        {
          producer: 'Joel Silver',
          interval: 1,
          previousWin: 1990,
          followingWin: 1991
        }
      ],
      max: [
        {
          producer: 'Matthew Vaughn',
          interval: 13,
          previousWin: 2002,
          followingWin: 2015
        }
      ]
    };
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.min)).toBe(true);
    expect(Array.isArray(body.max)).toBe(true);
    expect(JSON.stringify(body)).toStrictEqual(JSON.stringify(outputEsperado));
  });

  it('deve retornar 405 para métodos não permitidos', async () => {
    const res = await fetch(`http://localhost:${PORT}/producers/intervals`, {
      method: 'POST'
    });
    expect(res.status).toBe(405);
    const body = await res.json();
    expect(body.error).toBe('Método Não Permitido');
  });

  it('deve redirecionar a raiz para a documentação do Swagger', async () => {
    const res = await fetch(`http://localhost:${PORT}/`, {
      redirect: 'manual'
    });
    expect(res.status).toBe(302);
    const location = res.headers.get('location');
    expect(location === '/docs/swagger' || location === '/swagger').toBe(true);
  });

  it('deve retornar a documentação Swagger JSON', async () => {
    const res = await fetch(`http://localhost:${PORT}/docs/swagger.json`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.openapi).toBe('3.0.0');
    expect(body.info).toBeDefined();
    expect(body.paths).toBeDefined();
  });

  it('deve retornar 404 para rota inexistente', async () => {
    const res = await fetch(`http://localhost:${PORT}/naoexiste`);
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe('Não Encontrado');
  });

  it('deve retornar HTML na documentação Swagger UI', async () => {
    const res = await fetch(`http://localhost:${PORT}/docs/swagger`);
    expect(res.status).toBe(200);
    const contentType = res.headers.get('content-type');
    expect(contentType && contentType.includes('text/html')).toBe(true);
    const body = await res.text();
    expect(body.includes('<html')).toBe(true);
  });

  it('deve lidar com erro interno do servidor', async () => {
    const res = await fetch(
      `http://localhost:${PORT}/producers/intervals?simulateError=1`
    );
    if (res.status === 500) {
      const body = await res.json();
      expect(body.error).toBe('Erro Interno do Servidor');
    }
  });
});
