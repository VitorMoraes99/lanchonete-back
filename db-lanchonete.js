const sqlite3 = require("sqlite3");
const path = require("path");

const folder = "data";
const fileName = "lanchonete.db";
const dbPath = path.resolve(__dirname, folder, fileName);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("A conexão com o banco falhou", err);
  } else {
    console.log("Conexão bem sucedida");
  }
});

db.serialize(() => {
  db.run(`
        CREATE TABLE IF NOT EXISTS Lanches (
            id          INTEGER     PRIMARY KEY AUTOINCREMENT,
            nome        VARCHAR(60) NOT NULL,
            ingredientes   TEXT        NOT NULL,
            preco       DECIMAL(6,2) NOT NULL,
            categoria   VARCHAR(60),
            imagem      VARCHAR(255)
        );
    `);

  db.run(`
        CREATE TABLE IF NOT EXISTS Pedidos (
            id           INTEGER      PRIMARY KEY AUTOINCREMENT,
            id_lanche    INTEGER      NOT NULL,
            quantidade   INTEGER      NOT NULL,
            status       VARCHAR(20)  DEFAULT 'Pendente',
            created_at   DATETIME     DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (id_lanche) REFERENCES Lanches(id)
        );
    `);
});

module.exports = db;
