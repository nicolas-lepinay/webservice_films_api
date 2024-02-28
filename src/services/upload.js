const multer = require("multer"); // For image uploading

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/media");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '__' + file.originalname);
      },
});

const upload = multer({ storage: storage });

module.exports.upload = upload;