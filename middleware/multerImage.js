import multer from "multer";

const storage  =  multer.diskStorage({
    filename: function(req,file,callback){
        callback(null, file.originalname)
    }
})

const imageUpload = multer({storage})

// export default upload

export default imageUpload;


// import multer from "multer";

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/"); // Make sure this directory exists
//   },
//   filename: (req, file, cb) => {
//     cb(null, `${Date.now()}-${file.originalname}`);
//   },
// });

// const imageUpload = multer({ storage });

// export default imageUpload;