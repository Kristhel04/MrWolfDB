import express from 'express';
import usuariosR from './router/Usuario.routes.js';
import productosR from './router/Producto.routes.js';
import categoriasR from './router/Categoria.routes.js';
import carritosR from './router/Carrito.routes.js';
import Talla from './model/TallaModel.js';
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
app.use('/api/v1', carritosR);

// Configurar relaciones de Sequelize
ConfRelaciones();

// Sincronizar base de datos y luego iniciar el servidor
const startServer = async () => {
    try {
        await sequelize.sync(); // Sincroniza la base de datos antes de continuar

        // Insertar tallas predeterminadas si no existen
        const tallasPredeterminadas = ['XS', 'S', 'M', 'L', 'XL'];
        await Promise.all(
            tallasPredeterminadas.map(async (talla) => {
                await Talla.findOrCreate({
                    where: { nombre: talla },
                });
            })
        );

        console.log('Tallas predeterminadas insertadas correctamente');
        console.log('Base de datos sincronizada');

    } catch (error) {
        console.error('Error al sincronizar la base de datos:', error);
    }
};

// Ejecutar la función de inicio
startServer();

export default app;
