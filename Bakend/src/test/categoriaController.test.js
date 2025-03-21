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
      // Crear una categoría de prueba con un nombre único
      testCategoria = await Categoria.create({
        nombre_categoria: `Categoría de prueba ${Date.now()}`, // Nombre único
        descripcion_categoria: "Descripción de prueba",
        imagen: "imagen_unica.jpg", // Cambia esto a un valor único
      });
    } catch (error) {
      console.error("Error en el hook before:", error);
      console.error("Detalles del error:", error.errors); // Imprime los errores de validación
      throw error; // Relanza el error para que Mocha lo capture
    }
  });

  // Después de las pruebas: Eliminar la categoría de prueba y limpiar archivos
  after(async () => {
    if (testCategoria && testCategoria.num_categoria) {
      // Eliminar la imagen si existe
      if (testCategoria.imagen) {
        const imagePath = path.join(uploadDir, testCategoria.imagen);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }

      // Eliminar la categoría de prueba
      await Categoria.destroy({ where: { num_categoria: testCategoria.num_categoria } });
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
      const response = await request(app).get(
        `/api/v1/categorias/${testCategoria.num_categoria}`
      );

      // Verificaciones
      expect(response.status).to.equal(200); // Código de estado 200 (OK)
      expect(response.body).to.have.property("num_categoria", testCategoria.num_categoria); // Verifica que la categoría devuelta tenga el mismo ID
      expect(response.body).to.have.property("nombre_categoria", testCategoria.nombre_categoria); // Verifica el nombre
      expect(response.body).to.have.property("descripcion_categoria", testCategoria.descripcion_categoria); // Verifica la descripción
      expect(response.body).to.have.property("imagen"); // Verifica que la propiedad "imagen" esté presente
    });

    it("debería devolver un error 404 si la categoría no existe", async () => {
      const idInexistente = 9999;
      const response = await request(app).get(
        `/api/v1/categorias/${idInexistente}`
      );

      // Verificaciones
      expect(response.status).to.equal(404); // Código de estado 404 (No encontrado)
      expect(response.body).to.have.property("message", "Categoría no encontrada"); // Verifica el mensaje de error
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
        .put(`/api/v1/categorias/${testCategoria.num_categoria}`)
        .send(datosActualizados);

      // Verificaciones
      expect(response.status).to.equal(200); // Código de estado 200 (OK)
      expect(response.body).to.have.property("num_categoria", testCategoria.num_categoria); // Verifica que la categoría devuelta tenga el mismo ID
      expect(response.body).to.have.property("nombre_categoria", datosActualizados.nombre_categoria); // Verifica que el nombre se haya actualizado
      expect(response.body).to.have.property("descripcion_categoria", datosActualizados.descripcion_categoria); // Verifica que la descripción se haya actualizado
      expect(response.body).to.have.property("imagen"); // Verifica que la propiedad "imagen" esté presente
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
      const response = await request(app).delete(
        `/api/v1/categorias/${testCategoria.num_categoria}`
      );
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property(
        "message",
        "Categoría eliminada correctamente"
      );
    });

    it("debería devolver un error 404 si la categoría no existe", async () => {
      const idInexistente = 9999;
      const response = await request(app).delete(
        `/api/v1/categorias/${idInexistente}`
      );
      expect(response.status).to.equal(404);
      expect(response.body).to.have.property(
        "message",
        "Categoría no encontrada"
      );
    });
  });
});