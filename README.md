# Outsera Avaliação Backend

Este projeto foi desenvolvido como parte de uma avaliação técnica.  
O objetivo é expor uma API REST que retorna informações sobre os vencedores da categoria **Pior Filme** do Golden Raspberry Awards (Razzies).

---

## 🏗️ Tecnologias Utilizadas

- **JavaScript**
- **Node.js**
- **SQL.js**
- **OpenAPI/Swagger** para documentação
- **Jest** para testes de integração

---

## 📚 Sobre a API

- **Endpoint principal:**
  - `GET /producers/intervals`  
    Retorna dois arrays:
    - `min`: produtores com menor intervalo entre vitórias
    - `max`: produtores com maior intervalo entre vitórias

- **Outros endpoints:**
  - `/docs/swagger` — UI da documentação (Swagger)
  - `/docs/swagger.json` — OpenAPI em JSON
---

##  📂 Estrutura do Projeto
```
src/
├── data/
│ └── db.js # Inicialização e manipulação do banco de dados em memória
├── service/
│ └── service.js # Regras de negócio
├── docs/
│ ├── swagger.json # Documentação da API (OpenAPI/Swagger)
│ └── docs.html # Interface Swagger UI
index.js # Ponto de entrada da aplicação
test/
└── api.int.test.js # Testes de integração (Jest)
```

## ⚙️ Como rodar o projeto

### 1. **Pré-requisitos**
- Node.js 20 ou superior
- npm

### 2. **Clonar o projeto**
```bash
git clone https://github.com/gabrielmorara/outsera-avaliacao-backend.git
cd outsera-avaliacao-backend
```

### 3. **Instalar dependências**

```
npm install
```

### 4. **Executar a API**

```
npm run start
```

A aplicação será iniciada em http://localhost:3000 (ou na porta definida pela variável de ambiente PORT).

Você pode definir o caminho do arquivo CSV a ser carregado na inicialização informando a variável CSV_PATH no arquivo **.env**

Caso essa variável não seja definida, será utilizado o arquivo padrão localizado em **src/data/seeds/movielist.csv**


### 5. **Acessar a documentação**

Acesse http://localhost:3000/docs/swagger para visualizar a documentação interativa (Swagger UI).

O arquivo OpenAPI pode ser acessado em http://localhost:3000/docs/swagger.json.

## 🧪 Rodando os testes
Este projeto utiliza Jest para testes de integração.
```
npm test
```

## Observações Técnicas
O banco de dados é populado a partir de um arquivo CSV em memória ao iniciar o servidor.

## 👨‍💻 Autor
Gabriel Morara