import Talla from '../model/TallaModel.js';

const TallaController ={

    async getAllTallas(req, res) {
        try {
            const tallas = await Talla.findAll();
            res.json(tallas);
        } catch (error) {
            res.status(500).json({ message: "Error al obtener las tallas", error });
        }
    }

}
export default TallaController;