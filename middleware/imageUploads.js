const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create the uploads/images directory if it doesn't exist
const uploadDir = './uploads/images';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Set storage engine
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const timestamp = Date.now();
    let filenamePrefix = '';
console.log(file)
    if (file.fieldname === 'TitleImage') {
      filenamePrefix = 'Title-Image';
    } else if (file.fieldname === 'SubImages') {
      filenamePrefix = 'Sub-Images';
    } else {
      filenamePrefix = 'File';
    }

    // Ensure extension is retained
    const extname = path.extname(file.originalname);
    cb(null, `${filenamePrefix}-${timestamp}${extname}`);
  },
});

// Check file type
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
}

// Initialize upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit per file
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  },
}).fields([
  { name: 'TitleImage', maxCount: 1 },
  { name: 'SubImages', maxCount: 10 }
]);

module.exports = upload;
