import express from 'express';
import usuariosR from './router/Usuario.routes.js';
import productosR from './router/Producto.routes.js';
import categoriasR from './router/Categoria.routes.js';
import carritosR from './router/Carrito.routes.js';
import TallaR from './router/Talla.routes.js';
import sequelize from './baseDatos/connection.js';
import ConfRelaciones from './model/Relaciones.js';
import 'dotenv/config';
import cors from 'cors';
import path from 'path';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/imagenes', express.static(path.join(process.cwd(), 'public', 'ImgCategorias')));

// Rutas
app.use('/api/v1', usuariosR);
app.use('/api/v1', productosR);
app.use('/api/v1', categoriasR);
app.use('/api/v1', TallaR);
app.use('/api/v1', carritosR);

await sequelize.sync({ force: false });
ConfRelaciones();


export default app;
