import multer from "multer";
import path from "path";

const tempDir = path.resolve("temp");

const multerConfig = multer.diskStorage({
    destination: tempDir,
    filename: (req, file, cb) => {
        const uniqueName = `${req.user.id}_${Date.now()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({ storage: multerConfig });

export default upload
