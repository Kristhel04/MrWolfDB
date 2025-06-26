import Factura from '../model/FacturaModel.js';
import Usuario from '../model/UsuarioModel.js';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const PagoController = {
  crearPago: async (req, res) => {
    const { codigo_factura } = req.body;

    try {
      // Buscar factura
      const factura = await Factura.findOne({ where: { codigo_factura } });

      if (!factura) {
        return res.status(404).json({ error: "Factura no encontrada" });
      }

      // Buscar usuario para datos de facturación
      const user = await Usuario.findOne({ where: { cedula: factura.cedula } });

      if (!user) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      // Obtener token
      const tokenRes = await axios.post("https://app.tilopay.com/api/v1/login", {
        apiuser: process.env.TILOPAY_APIUSER,
        password: process.env.TILOPAY_PASSWORD,
      });

      const accessToken = tokenRes.data.access_token;

      // Armar datos para Tilopay
      const nameParts = factura.nombre_completo ? factura.nombre_completo.split(" ") : ["-", "-"];
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "-";

      // Crear orden de pago
      const paymentRes = await axios.post(
        "https://app.tilopay.com/api/v1/processPayment",
        {
          key: process.env.TILOPAY_CLIENT_KEY,
          amount: factura.total,
          currency: "CRC",
          redirect: process.env.TILOPAY_REDIRECT,
          billToFirstName: firstName,
          billToLastName: lastName,
          billToAddress: factura.direccion_envio,
          billToAddress2: factura.direccion_envio,
          billToCity: "San José",
          billToState: "CR-SJ",
          billToZipPostCode: "10101",
          billToCountry: "CR",
          billToTelephone: factura.telefono,
          billToEmail: factura.email_usuario,
          orderNumber: codigo_factura,
          capture: 1,
          subscription: 0,
          platform: process.env.TILOPAY_PLATFORM,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const checkoutUrl = paymentRes.data.url;

      res.status(200).json({
        checkout_url: checkoutUrl,
      });
    } catch (error) {
      console.error("Error en PagoController.crearPago:", error?.response?.data || error.message);
      res.status(500).json({ error: "No se pudo procesar el pago con Tilopay" });
    }
  },

  webhookTilopay: async (req, res) => {
    try {
      const data = req.body;

      if (data.code === "1") {
        // Transacción aprobada
        console.log("Pago aprobado:", data);
        // Actualizar factura
        const factura = await Factura.findOne({ where: { codigo_factura: data.order } });

        if (factura) {
          await factura.update({ estado: "Pagada" });
          console.log("Factura actualizada a Pagada:", data.order);
        } else {
          console.warn("Factura no encontrada para código:", data.order);
        }
      } else {
        console.log("Pago rechazado o fallido:", data);
      }

      res.sendStatus(200);
    } catch (error) {
      console.error("Error en webhookTilopay:", error.message);
      res.sendStatus(500);
    }
  }
};

export default PagoController;
