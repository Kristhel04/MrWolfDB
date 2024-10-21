const express = require("express");
const bodyParser = require("body-parser");
const UsuarioController = require("./controller/userController");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

app.post("/usuarios", UsuarioController.create);
app.get("/usuarios", UsuarioController.getAll);
app.get("/usuarios/:idUsuario", UsuarioController.getById);
app.put("/usuarios/:idUsuario", UsuarioController.update);
app.delete("/usuarios/:idUsuario", UsuarioController.delete);

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
