import express from 'express'
import usuariosR from "./router/Usuario.routes.js"
import productosR from "./router/Producto.routes.js"
import categoriasR from './router/Categoria.routes.js';
import carritosR from "./router/Carrito.routes.js";
import Talla from './model/TallaModel.js';

import sequelize from './baseDatos/connection.js';
import ConfAsociaciones from './model/Asociaciones.js';
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

ConfAsociaciones();


(async () => {
    try {
        await sequelize.sync(); 

        const tallasPredeterminadas = ['Xs','S', 'M', 'L', 'XL'];

        for (const talla of tallasPredeterminadas) {
            await Talla.findOrCreate({
                where: { nombre: talla }
            });
        }

        console.log('Tallas predeterminadas insertadas correctamente');
    } catch (error) {
        console.error('Error al insertar tallas predeterminadas:', error);
    }
})();


export default app