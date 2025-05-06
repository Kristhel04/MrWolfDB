import Talla from '../model/TallaModel.js';
import sequelize from '../baseDatos/connection.js';


const TallaController ={

    async getAllTallas(req, res) {
        try {
            const tallas = await Talla.findAll();
            res.json(tallas);
        } catch (error) {
            res.status(500).json({ message: "Error al obtener las tallas", error });
        }
    },
    async syncAndInsertTallas() { // Quitar req, res
        try {
            await sequelize.sync(); 

            const tallasPredeterminadas = ['XS', 'S', 'M', 'L', 'XL', 'unitalla', ...Array.from({ length: 11 }, (_, i) => (28 + i).toString())];;
            await Promise.all(
                tallasPredeterminadas.map(async (talla) => {
                    await Talla.findOrCreate({
                        where: { nombre: talla },
                    });
                })
            );

            console.log("Base de datos sincronizada y tallas insertadas correctamente");
        } catch (error) {
            console.error("Error al sincronizar la base de datos:", error);
        }
    }
}
export default TallaController;