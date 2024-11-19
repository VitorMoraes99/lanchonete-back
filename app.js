const express = require("express");
const cors = require("cors");
const db = require("./db-lanchonete");
const multer = require("multer");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

app.get("/lanches", (req, res) => {
  db.all("SELECT * FROM Lanches", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ lanches: rows });
  });
});

app.get("/lanches/:id", (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM Lanches WHERE id = ?", [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ lanches: row });
  });
});

app.post("/lanches", upload.single("imagem"), (req, res) => {
  const { nome, ingredientes, preco, categoria } = req.body;
  const imagePath = req.file ? req.file.path : null;

  if (!nome || !ingredientes || !preco || !categoria || !imagePath) {
    res.status(400).json({
      message:
        "All fields (nome, ingredientes, preco, categoria, imagem) are required",
    });
    return;
  }

  db.run(
    "INSERT INTO Lanches (nome, ingredientes, preco, categoria, imagem) VALUES (?, ?, ?, ?, ?)",
    [nome, ingredientes, preco, categoria, imagePath],
    function (err) {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.json({
        id: this.lastID,
        nome,
        ingredientes,
        preco,
        categoria,
        imagem: imagePath,
      });
    }
  );
});

app.put("/lanches/:id", (req, res) => {
  const { id } = req.params;
  const { nome, ingredientes, preco, categoria } = req.body;

  if (!nome || !ingredientes || !preco || !categoria) {
    res.status(400).json({
      message: "All fields (nome, ingredientes, preco, categoria) are required",
    });
    return;
  }

  db.run(
    "UPDATE Lanches SET nome = ?, ingredientes = ?, preco = ?, categoria = ? WHERE id = ?",
    [nome, ingredientes, preco, categoria, id],
    function (err) {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ message: "Lanche not found" });
        return;
      }
      res.json({ message: `Lanche updated with ID ${id}` });
    }
  );
});

app.delete("/lanches/:id", (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM Lanches WHERE id = ?", id, function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ message: `Lanche deleted with ID ${id}` });
  });
});

app.get("/pedidos", (req, res) => {
  db.all("SELECT * FROM Pedidos", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ pedidos: rows });
  });
});

app.post("/pedidos", (req, res) => {
  const { id_lanche, quantidade } = req.body;

  if (!id_lanche || !quantidade) {
    res
      .status(400)
      .json({ message: "All fields (id_lanche, quantidade) are required" });
    return;
  }

  db.run(
    "INSERT INTO Pedidos (id_lanche, quantidade, status) VALUES (?, ?, ?)",
    [id_lanche, quantidade, "Pendente"],
    function (err) {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.json({
        id: this.lastID,
        id_lanche,
        quantidade,
        status: "Pendente",
        created_at: new Date().toISOString(),
      });
    }
  );
});

app.put("/pedidos/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    res.status(400).json({ message: "Field status is required" });
    return;
  }

  db.run(
    "UPDATE Pedidos SET status = ? WHERE id = ?",
    [status, id],
    function (err) {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ message: "Pedido not found" });
        return;
      }
      res.json({ message: `Pedido updated with ID ${id}` });
    }
  );
});

app.delete("/pedidos/:id", (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM Pedidos WHERE id = ?", id, function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ message: `Pedido deleted with ID ${id}` });
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
