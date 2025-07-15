import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { DateTime } from "luxon";
import Factura from "../model/FacturaModel.js";
import DetalleFactura from "../model/DetalleFacturaModel.js";
import Usuario from "../model/UsuarioModel.js";
import Producto from "../model/ProductoModel.js";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';

import { crearPagoTilopay } from "../services/tilopayService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generarCodigoFactura = () => {
  const fechaBase36 = Date.now().toString(36);
  const aleatorio = Math.floor(Math.random() * 1000);
  return `FAC-${fechaBase36}-${aleatorio}`;
};

const FacturaController = {
  create: async (req, res) => {
    try {
      if (!req.user || !req.user.cedula) {
        return res.status(401).json({ message: "Debe iniciar sesión para continuar." });
      }

      const { cedula } = req.user;
      const productos = req.body.productos;

      if (!productos || !Array.isArray(productos) || productos.length === 0) {
        return res.status(400).json({ message: "Debe agregar productos para generar la factura." });
      }

      const user = await Usuario.findOne({
        where: { cedula },
        attributes: ['cedula', 'nombre_completo', 'email_facturacion', 'direccion_envio', 'telefono']
      });

      if (!user) {
        return res.status(404).json({ message: "Usuario no registrado." });
      }

      const subTotal = productos.reduce((acc, prod) => acc + (prod.precio * prod.quantity), 0);
      const precioEnvio = 3500;
      const total = subTotal + precioEnvio;

      const codigo_factura = 'ORD-' + uuidv4().slice(0, 8).toUpperCase();
      const fechaFormateada = moment.utc().format('YYYY-MM-DD');

      const nuevaFactura = await Factura.create({
        codigo_factura,
        cedula: user.cedula,
        nombre_completo: user.nombre_completo,
        email_usuario: user.email_facturacion,
        direccion_envio: user.direccion_envio,
        telefono: user.telefono,
        sub_total: subTotal,
        precio_envio: precioEnvio,
        total,
        estado: "Pendiente",
        nombre_pagina: "Mr.Wolf",
        fecha_emision: fechaFormateada
      });

      const idFactura = nuevaFactura.id;

      const detalles = await Promise.all(
        productos.map(prod => DetalleFactura.create({
          id_factura: idFactura,
          id_producto: prod.id,
          talla_id: prod.tallaId,
          nombre_producto: prod.nombre,
          precio_unitario: prod.precio,
          cantidad: prod.quantity,
          subtotal: prod.precio * prod.quantity
        }))
      );

      const checkout_url = await crearPagoTilopay(nuevaFactura);

      res.status(201).json({
        success: true,
        message: "Factura generada correctamente",
        factura: {
          id: nuevaFactura.id,
          codigo_factura,
          total,
          checkout_url,
        }
      });

    } catch (error) {
      console.error("Error en FacturaController.create:", error);
      res.status(500).json({
        success: false,
        message: "Error al crear la factura",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },
  async verFacturaPorId(req, res) {
    const facturaId = req.params.id;
    const userId = req.user.id; // Suponiendo que tienes el ID del usuario en el token JWT

    try {
      // Obtener la factura por ID, incluyendo los detalles de los productos relacionados
      const factura = await Factura.findByPk(facturaId, {
        include: [
          {
            model: DetalleFactura, // Relación con DetalleFactura
            as: 'detalles', // Suponiendo que 'detalles' es el alias
            include: [
              {
                model: Producto, // Relación con Producto
                as: 'producto', // Suponiendo que 'producto' es el alias
                attributes: ['nombre'] // Solo recuperar el nombre del producto
              }
            ]
          }
        ]
      });

      // Verificar si la factura existe
      if (!factura) {
        return res.status(404).json({ message: "Factura no encontrada" });
      }

      // Verifica que la factura pertenezca al usuario autenticado
      if (factura.userId !== userId) {
        return res.status(403).json({ message: "No tienes permiso para acceder a esta factura" });
      }

      // Responder con la factura y sus detalles
      res.status(200).json(factura);
    } catch (error) {
      console.error("Error al obtener factura:", error);
      res.status(500).json({ message: "Error al obtener factura", error });
    }
  },

  async getFacturasUsuario(req, res) {
    try {
      const usuario = req.user;
      const facturas = await Factura.findAll({
        where: { cedula: usuario.cedula },
        order: [['fecha_emision', 'DESC']],
      });
      res.status(200).json(facturas);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener facturas del usuario", error });
    }
  },

  async getAll(req, res) {
    try {
      if (req.user.rol !== "Administrador") {
        return res.status(403).json({ message: "No autorizado" });
      }
      const facturas = await Factura.findAll({ order: [['fecha_emision', 'DESC']] });
      res.status(200).json(facturas);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener todas las facturas", error });
    }
  },

  async generarFacturaPDF(req, res) {
    try {
      const { id } = req.params;
      const factura = await Factura.findByPk(id);
      const detalles = await DetalleFactura.findAll({ where: { id_factura: id } });

      if (!factura) {
        return res.status(404).json({ message: "Factura no encontrada" });
      }

      const doc = new PDFDocument({ margin: 50 });
      const fontPath = path.join(__dirname, "../../public/fonts/DejaVuSans.ttf");
      doc.registerFont("custom", fontPath);
      doc.font("custom");
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=factura_${factura.codigo_factura}.pdf`);
      doc.pipe(res);

      const fechaFormateada = moment().format('DD/MM/YYYY');

      // 🖼️ Insertar logo
      const logoPath = path.join(__dirname, "../../public/Tienda/Logo Circular Mr Wolf-Photoroom.png"); // ajusta esta ruta según tu estructura
      doc.image(logoPath, { fit: [100, 100], align: "center" });
      doc.moveDown(1);

      // 🧾 ENCABEZADO
      doc.fontSize(18).text("Factura Electrónica - Mr. Wolf", { align: "center" });
      doc.moveDown(0.5);
      doc.fontSize(10).text(`Fecha de emisión: ${fechaFormateada}`, { align: "center" });
      doc.fontSize(10).text(`Facebook: Mr.Wolf`, { align: "center" });
      doc.fontSize(10).text(`Instagram: @mrwolf.cr`, { align: "center" });
      doc.fontSize(10).text(`Tel: 2101-9480 / 8557-4555`, { align: "center" });
      doc.moveDown();

      // 🧍 DATOS DEL CLIENTE
      doc.fontSize(12).text(`Cliente: ${factura.nombre_completo}`);
      doc.text(`Email: ${factura.email_usuario}`);
      doc.text(`Dirección: ${factura.direccion_envio}`);
      doc.text(`Teléfono: ${factura.telefono}`);
      doc.moveDown();

      // 🛍️ DETALLES DE LA FACTURA
      doc.fontSize(12).text("Detalles de la factura:", { underline: true });
      doc.moveDown(0.5);
      doc.text("Producto                      Cantidad     Precio unitario     Subtotal");

      detalles.forEach((d) => {
        const subtotal = d.cantidad * d.precio_unitario;
        const linea = `${d.nombre_producto.padEnd(30)} ${String(d.cantidad).padEnd(10)} ₡${d.precio_unitario.toLocaleString("es-CR").padEnd(18)} ₡${subtotal.toLocaleString("es-CR")}`;
        doc.text(linea);
      });

      // 💰 RESUMEN
      doc.moveDown();
      doc.text(`Subtotal: ₡${factura.sub_total.toLocaleString("es-CR")}`);
      doc.text(`Envío: ₡${factura.precio_envio.toLocaleString("es-CR")}`);
      doc.text(`Total: ₡${factura.total.toLocaleString("es-CR")}`);

      doc.end();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al generar el PDF" });
    }
  },
  async eliminarFactura(req, res) {
    try {
      if (req.user.rol !== "Administrador") {
        return res.status(403).json({ message: "No autorizado" });
      }

      const { id } = req.params;
      const factura = await Factura.findByPk(id);
      if (!factura) {
        return res.status(404).json({ message: "Factura no encontrada" });
      }

      await DetalleFactura.destroy({ where: { id_factura: id } });
      await Factura.destroy({ where: { id } });

      return res.status(200).json({ message: "Factura y sus detalles eliminados correctamente" });
    } catch (error) {
      console.error("Error al eliminar la factura:", error);
      return res.status(500).json({ message: "Error interno al eliminar la factura" });
    }
  }
};

export default FacturaController;
