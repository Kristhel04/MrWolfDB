import express from 'express'
import usuariosR from "./router/Usuario.routes.js"
import productosR from "./router/Producto.routes.js"
import categoriasR from './router/Categoria.routes.js';
import carritosR from "./router/Carrito.routes.js";
import 'dotenv/config';
import cors from 'cors';
import path from "path";

const app = express()
app.use(cors());
app.use(express.json());
app.use("/imagenes", express.static(path.join(process.cwd(), "public", "ImgCategorias")));

app.use('/api/v1', usuariosR);
app.use('/api/v1', productosR);
app.use('/api/v1', categoriasR);
app.use('/api/v1', carritosR);
export default app