// backend/middleware/uploadMiddleware.js
const multer = require('multer');

// Configura multer para guardar el archivo en memoria
const storage = multer.memoryStorage();

const upload = multer({ 
    storage: storage,
    // Opcional: limitar el tamaño del archivo a 5MB
    limits: { fileSize: 5 * 1024 * 1024 }, 
    fileFilter: (req, file, cb) => {
        // Aceptar solo archivos de Excel
        if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.mimetype === 'application/vnd.ms-excel') {
            cb(null, true);
        } else {
            cb(new Error('Formato de archivo no válido. Solo se aceptan archivos de Excel (.xlsx, .xls)'), false);
        }
    }
});

module.exports = upload;