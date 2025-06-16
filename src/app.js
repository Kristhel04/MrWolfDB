import express from 'express';
import recuperacionR from './router/Recuperacion.routes.js';
import usuariosR from './router/Usuario.routes.js';
import productosR from './router/Producto.routes.js';
import categoriasR from './router/Categoria.routes.js';
import carritosR from './router/Carrito.routes.js';
import TallaR from './router/Talla.routes.js';
import resenasR from './router/Resena.routes.js';
import facturaR from './router/Factura.route.js';
import sessionMiddleware from './Middleware/sessionConfig.js';
import cors from 'cors';
import path from 'path';

const app = express();

// Configuración de middleware
app.use(sessionMiddleware);
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
}));
app.use(express.json());

// Configuración de archivos estáticos
const __dirname = path.resolve();
app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/imagenes", express.static(path.join(__dirname, "public/ImgCategorias")));
app.use('/ImgProductos', express.static(path.join(__dirname, 'public/ImgProductos')));

// Rutas de la API
app.use('/api/v1', usuariosR);
app.use('/api/v1', productosR);
app.use('/api/v1', categoriasR);
app.use('/api/v1', TallaR);
app.use('/api/v1', carritosR);
app.use('/api/v1', recuperacionR);
app.use('/api/v1', resenasR);
app.use('/api/v1', facturaR);

// Ruta raíz y manejo de robots.txt
app.get('/', (req, res) => {
    res.send('Backend-MrWolf está funcionando');
});

app.get('/robots.txt', (req, res) => {
    res.type('text/plain');
    res.send('User-agent: *\nDisallow: /');
});

// Middleware para manejar errores 404
app.use((req, res, next) => {
    if (req.ip.startsWith('169.254.')) {
        return res.status(200).end();
    }
    res.status(404).json({ error: 'Ruta no encontrada' });
});

export default app;
