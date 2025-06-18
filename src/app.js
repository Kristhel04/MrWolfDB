import express from 'express';
import recuperacionR from './router/Recuperacion.routes.js';
import usuariosR from './router/Usuario.routes.js';
import productosR from './router/Producto.routes.js';
import categoriasR from './router/Categoria.routes.js';
import carritosR from './router/Carrito.routes.js';
import TallaR from './router/Talla.routes.js';
import resenasR from './router/Resena.routes.js';
import facturaR from './router/Factura.route.js';
import sessionMiddleware from './Middleware/sessionConfig.js';  // Asegúrate de que esto esté bien importado
import cors from 'cors';
import path from 'path';

const app = express();

// Configuración de CORS para permitir cookies
app.use(cors({
    origin: "https://thankful-coast-087ff680f.6.azurestaticapps.net",  // Origen autorizado (Frontend)
    credentials: true  // Permite el envío de cookies entre dominios
}));

// Configuración del middleware de sesión (ya con Redis)
app.use(sessionMiddleware);

app.use(express.json());  // Para manejar datos en formato JSON

// Configuración de archivos estáticos (solo debes ajustar si lo necesitas)
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

// Ruta raíz
app.get('/', (req, res) => {
    res.send('Backend-MrWolf está funcionando');
});

// Manejo del archivo robots.txt
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

export default app;
