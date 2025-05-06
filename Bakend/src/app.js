import express from 'express';
import usuariosR from './router/Usuario.routes.js';
import productosR from './router/Producto.routes.js';
import categoriasR from './router/Categoria.routes.js';
import carritosR from './router/Carrito.routes.js';
import TallaR from './router/Talla.routes.js';
import sequelize from './baseDatos/connection.js';
import TallaController from './Controller/TallaController.js'
import facturaR from './router/Factura.route.js';
import ConfRelaciones from './model/Relaciones.js';
import sessionMiddleware  from './Middleware/sessionConfig.js'
import 'dotenv/config';
import cors from 'cors';
import path from 'path';
import Factura from './model/FacturaModel.js';

const app = express();
//console.log("Cargando middleware de sesión..."); // Agrega esto para depuración
app.use(sessionMiddleware);
app.use((req, res, next) => {
    console.log("Sesión actual:", req.session);
    console.log("ID de sesión:", req.sessionID);
    next();
});


app.use(cors({
    origin: "http://localhost:5173", // ⚡ Cambia esto según el puerto de tu frontend
    credentials: true // 💡 Permite que se envíen cookies y sesiones en la petición
}));
app.use(express.json());

app.get("/test-session", (req, res) => {
    req.session.test = "Funciona!";
    res.send("Sesión guardada en el servidor.");
});

app.get("/check-session", (req, res) => {
    res.json({ session: req.session });
});

app.get("/api/v1/cart/debug", (req, res) => {
    res.json({ cart: req.session.cart || "Carrito vacío en sesión" });
});


const __dirname = path.resolve();
const staticFilesPath = path.join(__dirname, 'public'); // Ruta base para archivos estáticos

// Configuración de rutas estáticas
app.use("/imagenes", express.static(path.join(staticFilesPath, "ImgCategorias")));
app.use('/ImgProductos', express.static(path.join(staticFilesPath, 'ImgProductos')));

// Rutas de la API
app.use('/api/v1', usuariosR);
app.use('/api/v1', productosR);
app.use('/api/v1', categoriasR);
app.use('/api/v1', TallaR);
app.use('/api/v1', carritosR);
app.use('/api/v1',facturaR);




await sequelize.sync({ force: false });
ConfRelaciones();


export default app;
