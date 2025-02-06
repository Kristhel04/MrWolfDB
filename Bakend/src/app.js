import express from 'express'
import usuariosR from "./router/Usuario.routes.js"
import productosR from "./router/Producto.routes.js"
import categoriasR from './router/Categoria.routes.js';
import 'dotenv/config';
import cors from 'cors';

const app = express()
app.use(cors());
app.use(express.json());

app.use('/api/v1', usuariosR);
app.use('/api/v1', productosR);
app.use('/api/v1', categoriasR);
export default app