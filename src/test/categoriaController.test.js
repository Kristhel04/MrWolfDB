import request from "supertest";
import { expect } from "chai";
import { Sequelize } from "sequelize";
import app from "../../src/app.js";
import Categoria from "../model/CategoriaModel.js";
import fs from "fs";
import path from "path";

// 1. Configuración de la base de datos de prueba
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: ':memory:', // Base de datos en memoria
  logging: false // Desactivar logs para mayor claridad en los tests
});

describe("CategoriaController", () => {
  let testCategoria;

  // 2. Configuración antes de todas las pruebas
  before(async () => {
    try {
      // Sincronizar modelos con la base de datos de prueba
      await sequelize.sync({ force: true });
      
      // Crear categoría de prueba
      testCategoria = await Categoria.create({
        nombre_categoria: `Categoría de prueba ${Date.now()}`,
        descripcion_categoria: "Descripción de prueba",
        imagen: "imagen_unica.jpg",
      });
    } catch (error) {
      console.error("Error en el hook before:", error);
      throw error;
    }
  });

  // 3. Configuración después de todas las pruebas
  after(async () => {
    // Cerrar la conexión a la base de datos
    await sequelize.close();
  });

  // 4. Limpieza antes de cada prueba (opcional)
  beforeEach(async () => {
    // Limpiar la tabla de categorías antes de cada test si es necesario
    await Categoria.destroy({ where: {} });
    
    // Volver a crear la categoría de prueba
    testCategoria = await Categoria.create({
      nombre_categoria: `Categoría de prueba ${Date.now()}`,
      descripcion_categoria: "Descripción de prueba",
      imagen: "imagen_unica.jpg",
    });
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