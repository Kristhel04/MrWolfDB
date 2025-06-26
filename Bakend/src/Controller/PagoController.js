import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const PagoController = {
  crearPago: async (req, res) => {
    const {
      amount,
      billToFirstName,
      billToLastName,
      billToAddress,
      billToCity,
      billToState,
      billToZipPostCode,
      billToCountry,
      billToTelephone,
      billToEmail,
      orderNumber,
    } = req.body;

    try {
      // Paso 1: Obtener token
      const tokenRes = await axios.post("https://app.tilopay.com/api/v1/login", {
        apiuser: process.env.TILOPAY_APIUSER,
        password: process.env.TILOPAY_PASSWORD,
      });

      const accessToken = tokenRes.data.access_token;

      // Paso 2: Crear orden de pago
      const paymentRes = await axios.post(
        "https://app.tilopay.com/api/v1/processPayment",
        {
          key: process.env.TILOPAY_CLIENT_KEY,
          amount,
          currency: "CRC",
          redirect: process.env.TILOPAY_REDIRECT,
          billToFirstName,
          billToLastName,
          billToAddress,
          billToAddress2: billToAddress,
          billToCity,
          billToState,
          billToZipPostCode,
          billToCountry,
          billToTelephone,
          billToEmail,
          orderNumber,
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
      res.status(200).json({ checkout_url: checkoutUrl });
    } catch (error) {
      console.error("❌ Error en crearPago:", error?.response?.data || error.message);
      res.status(500).json({ error: "No se pudo procesar el pago con Tilopay" });
    }
  },

  webhookTilopay: async (req, res) => {
    try {
      const data = req.body;

      if (data.code === "1") {
        // Transacción aprobada
        console.log("✅ Pago aprobado:", data);
        // Aquí puedes actualizar estado de factura, guardar transacción, etc.
      } else {
        console.log("❌ Pago rechazado o fallido:", data);
      }

      res.sendStatus(200);
    } catch (error) {
      console.error("Error en webhookTilopay:", error.message);
      res.sendStatus(500);
    }
  },
};

export default PagoController;
