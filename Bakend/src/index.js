import app from "./app.js";
import express from "express";
import path from "path";
import fs from "fs";
import TallaController from "./Controller/TallaController.js";
import  CodigoRecuperacion  from "../src/model/CodigoRecuperacion.js";
import { Op } from "sequelize";
import cron from "node-cron";

const __dirname = path.resolve();

app.use("/public", express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

TallaController.syncAndInsertTallas();

// Configuración mejorada del cron job
const job = cron.schedule(
  "0 2 * * *",
  async () => {
    console.log(
      `🔍 Iniciando limpieza de códigos a las ${new Date().toLocaleString()}`
    );

    try {
      const result = await CodigoRecuperacion.destroy({
        where: { expiracion: { [Op.lt]: new Date() } },
      });

      fs.appendFileSync(
        "cleanup.log",
        `[${new Date().toISOString()}] Códigos eliminados: ${result}\n`
      );
    } catch (err) {
      fs.appendFileSync(
        "errors.log",
        `[${new Date().toISOString()}] ERROR: ${err.message}\n`
      );
    }
  },
  {
    scheduled: true,
    timezone: "America/Costa_Rica",
  }
);

// Detener el job cuando el servidor se apague
process.on("SIGTERM", () => {
  job.stop();
  console.log("Cron job detenido");
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
