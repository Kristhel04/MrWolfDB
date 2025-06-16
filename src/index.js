import app from './app.js';
import sequelize from './baseDatos/connection.js';
import TallaController from './Controller/TallaController.js';
import CodigoRecuperacion from './model/CodigoRecuperacion.js';
import ConfRelaciones from './model/Relaciones.js';
import { Op } from 'sequelize';
import cron from 'node-cron';
import 'dotenv/config';

// Inicialización de la base de datos
const initDB = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync({ force: false });
        ConfRelaciones();
        await TallaController.syncAndInsertTallas();
        console.log('✅ Base de datos conectada y modelos sincronizados');
    } catch (error) {
        console.error('❌ Error al conectar con la base de datos:', error);
        process.exit(1);
    }
};

// Configuración del cron job para limpieza
const setupCronJob = () => {
    const job = cron.schedule(
        "0 2 * * *",
        async () => {
            console.log('🔍 Iniciando limpieza de códigos a las ${new Date().toLocaleString()}');
            try {
                const result = await CodigoRecuperacion.destroy({
                    where: { expiracion: { [Op.lt]: new Date() } },
                });
                console.log('♻ Códigos eliminados: ${result}');
            } catch (err) {
                console.error('❌ Error en cron job:', err);
            }
        },
        {
            scheduled: true,
            timezone: "America/Costa_Rica",
        }
    );

    process.on("SIGTERM", () => {
        job.stop();
        console.log("⏹ Cron job detenido");
    });
};

// Inicio del servidor
const startServer = () => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log('🚀 Servidor corriendo en puerto ${PORT}');
    });
};

// Inicialización completa
(async () => {
    await initDB();
    setupCronJob();
    startServer();
})();
