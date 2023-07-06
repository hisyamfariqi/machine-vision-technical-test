const util = require('util')
const multer = require('multer')
const path = require('path')
const maxSize = 10 * 1024 * 1024

let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/images/");
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
    }
});

let uploadFile = multer({
    storage: storage,
    limits: { fileSize: maxSize },
}).single("file");

let uploadFileMiddleware = util.promisify(uploadFile);

module.exports = uploadFileMiddleware;