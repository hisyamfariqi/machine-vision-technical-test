require('dotenv').config()
const uploadFile = require('../../middleware/file-middleware')

const upload = async (req, res) => {
    try {
        await uploadFile(req, res)

        res.status(200).json({
            url: `${process.env.BASE_URL}:${process.env.PORT}/files/${req.file.filename}`,
            filename: req.file.filename,
            mimetype: req.file.mimetype
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
            data: null
        })
    }
}

module.exports = { upload }