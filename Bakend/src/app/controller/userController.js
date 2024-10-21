const UserModel = require("../models/user");

const userController = {
    create: (req, res) => {
        const usuario = req.body;
        UserModel.create(usuario, (err, result) => {
            if (err) {
                return res.status(500).json({ message: "Error creando usuario", error: err });
            }
            res.status(201).json({ message: "Usuario creado exitosamente", result });
        });
    },

    getAll: (req, res) => {
        UserModel.getAll((err, rows) => {
            if (err) {
                return res.status(500).json({ message: "Error obteniendo usuarios", error: err });
            }
            res.status(200).json(rows);
        });
    },

    getById: (req, res) => {
        const { idUsuario } = req.params;
        UserModel.getById(idUsuario, (err, row) => {
            if (err || row.length === 0) {
                return res.status(404).json({ message: "Usuario no encontrado", error: err });
            }
            res.status(200).json(row[0]);
        });
    },

    update: (req, res) => {
        const { idUsuario } = req.params;
        const usuario = req.body;
        UserModel.update(idUsuario, usuario, (err, result) => {
            if (err) {
                return res.status(500).json({ message: "Error actualizando usuario", error: err });
            }
            res.status(200).json({ message: "Usuario actualizado exitosamente", result });
        });
    },

    delete: (req, res) => {
        const { idUsuario } = req.params;
        UserModel.delete(idUsuario, (err, result) => {
            if (err) {
                return res.status(500).json({ message: "Error eliminando usuario", error: err });
            }
            res.status(200).json({ message: "Usuario eliminado exitosamente", result });
        });
    }
};

module.exports = userController;
