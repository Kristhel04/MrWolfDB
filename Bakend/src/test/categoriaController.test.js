import request from "supertest";
import { expect } from "chai";
import app from "../../src/app.js"; // Asegúrate de exportar tu app Express
import Categoria from "../model/CategoriaModel.js";
import fs from "fs";
import path from "path";

describe("CategoriaController", () => {
  let testCategoria; // Variable para almacenar la categoría de prueba

  // Ruta de la carpeta de imágenes
  const uploadDir = path.join("public", "ImgCategorias");

  // Antes de las pruebas: Crear una categoría de prueba
  before(async () => {
    try {
      // Crear una categoría de prueba sin imagen
      testCategoria = await Categoria.create({
        nombre_categoria: "Categoría de prueba",
        descripcion_categoria: "Descripción de prueba",
        imagen: null,
      });
    } catch (error) {
      console.error("Error en el hook before:", error);
      throw error; // Relanza el error para que Mocha lo capture
    }
  });

  // Después de las pruebas: Eliminar la categoría de prueba y limpiar archivos
  after(async () => {
    if (testCategoria && testCategoria.id) {
      // Eliminar la imagen si existe
      if (testCategoria.imagen) {
        const imagePath = path.join(uploadDir, testCategoria.imagen);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }

      // Eliminar la categoría de prueba
      await Categoria.destroy({ where: { id: testCategoria.id } });
    }
  });

  // Pruebas para GET /categorias
  describe("GET /categorias", () => {
    it("debería devolver una lista de categorías", async () => {
      const response = await request(app).get("/api/v1/categorias");
      expect(response.status).to.equal(200);
      expect(response.body).to.be.an("array");
    });
  });

  // Pruebas para GET /categorias/:id
  describe("GET /categorias/:id", () => {
    it("debería devolver una categoría específica", async () => {
      const response = await request(app).get(`/api/v1/categorias/${testCategoria.id}`);
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property("id", testCategoria.id);
    });

    it("debería devolver un error 404 si la categoría no existe", async () => {
      const idInexistente = 9999;
      const response = await request(app).get(`/api/v1/categorias/${idInexistente}`);
      expect(response.status).to.equal(404);
      expect(response.body).to.have.property("message", "Categoría no encontrada");
    });
  });

  // Pruebas para POST /categorias
  describe("POST /categorias", () => {
    it("debería crear una nueva categoría sin imagen", async () => {
      const nuevaCategoria = {
        nombre_categoria: "Nueva Categoría",
        descripcion_categoria: "Descripción de la nueva categoría",
      };

      const response = await request(app)
        .post("/api/v1/categorias")
        .send(nuevaCategoria);

      expect(response.status).to.equal(201);
      expect(response.body).to.have.property("id");
      expect(response.body.nombre_categoria).to.equal(nuevaCategoria.nombre_categoria);

      // Limpiar la categoría creada
      await Categoria.destroy({ where: { id: response.body.id } });
    });

    it("debería devolver un error si faltan campos obligatorios", async () => {
      const categoriaIncompleta = {
        nombre_categoria: "Categoría Incompleta",
      };

      const response = await request(app)
        .post("/api/v1/categorias")
        .send(categoriaIncompleta);

      expect(response.status).to.equal(500);
      expect(response.body).to.have.property("message", "Error al crear la categoría");
    });
  });

  // Pruebas para PUT /categorias/:id
  describe("PUT /categorias/:id", () => {
    it("debería actualizar una categoría existente", async () => {
      const datosActualizados = {
        nombre_categoria: "Categoría Actualizada",
        descripcion_categoria: "Descripción actualizada",
      };

      const response = await request(app)
        .put(`/api/v1/categorias/${testCategoria.id}`)
        .send(datosActualizados);

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property("message", "Categoría actualizada");
      expect(response.body.categoria.nombre_categoria).to.equal(datosActualizados.nombre_categoria);
    });

    it("debería devolver un error 404 si la categoría no existe", async () => {
      const idInexistente = 9999;
      const response = await request(app)
        .put(`/api/v1/categorias/${idInexistente}`)
        .send({ nombre_categoria: "No existe" });

      expect(response.status).to.equal(404);
      expect(response.body).to.have.property("message", "Categoría no encontrada");
    });
  });

  // Pruebas para DELETE /categorias/:id
  describe("DELETE /categorias/:id", () => {
    it("debería eliminar una categoría existente", async () => {
      const response = await request(app).delete(`/api/v1/categorias/${testCategoria.id}`);
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property("message", "Categoría eliminada correctamente");
    });

    it("debería devolver un error 404 si la categoría no existe", async () => {
      const idInexistente = 9999;
      const response = await request(app).delete(`/api/v1/categorias/${idInexistente}`);
      expect(response.status).to.equal(404);
      expect(response.body).to.have.property("message", "Categoría no encontrada");
    });
  });
});