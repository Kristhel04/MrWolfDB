import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

export const crearPagoTilopay = async (factura) => {
  const tokenRes = await axios.post("https://app.tilopay.com/api/v1/login", {
    apiuser: process.env.TILOPAY_APIUSER,
    password: process.env.TILOPAY_PASSWORD,
  });

  const accessToken = tokenRes.data.access_token;

  const nameParts = factura.nombre_completo.split(" ");
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(" ") || "-";

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
      billToCity: "San José",
      billToState: "CR-SJ",
      billToZipPostCode: "10101",
      billToCountry: "CR",
      billToTelephone: factura.telefono,
      billToEmail: factura.email_usuario,
      orderNumber: factura.codigo_factura,
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

  return paymentRes.data.url;
};
