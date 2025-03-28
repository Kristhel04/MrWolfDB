import multer from "multer";
import path from "path";
import fs from "fs";

// Ruta donde se guardarán las imágenes
const uploadDir = "public/ImgProductos";

// Verificar si la carpeta existe, si no, crearla
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// Crear el middleware de multer
const upload = multer({ storage: storage }); 

// Exportar el middleware
export default upload;