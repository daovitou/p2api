import { S3Client } from "@aws-sdk/client-s3";
import multer from "multer";
import multerS3 from "multer-s3";
import path from "path";

const s3 = new S3Client({
    endpoint: `${process.env.MINIO_ENDPOINT}`,
    credentials: {
        accessKeyId: `${process.env.MINIO_ACCESS_KEY}`, // Replace with your access key
        secretAccessKey: `${process.env.MINIO_SECRET_KEY}` // Replace with your secret key
    },
    forcePathStyle: true, // Required for MinIO
    region: "us-east-1"
})

export const uploadProfile = multer({
    storage: multerS3({
        s3,
        bucket: `${process.env.MINIO_BUCKET}`,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        metadata(req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key(req, file, cb) {
            const key = Date.now().toString();
            const ext = path.extname(file.originalname)
            cb(null, key + ext);
        },
    })
}).single('file')

const fileFilter = (req:any, file:any, cb:any) => {
    if (file.fieldName == "image") {
        (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') ? cb(null, true) : cb(null, false)
    }else if (file.fieldName == "ebook"){
        (file.mimetype === 'application/pdf') ? cb(null, true) : cb(null, false)
    }
}

export const uploadMultiple = multer({
    storage: multerS3({
        s3,
        bucket: "profiles",
        contentType: multerS3.AUTO_CONTENT_TYPE,
        metadata(req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key(req, file, cb) {
            const key = Date.now().toString();
            const ext = path.extname(file.originalname)
            cb(null, key + ext);
        },
    }),
}).fields([{name:'ebook'},{name:"image"}])