import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), 'uploads', 'word');
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage });

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { file } = req;
    if (!file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const documentRecord = {
      id: 'doc-' + Date.now(),
      title: file.originalname,
      path: file.path,
      uploadedAt: new Date().toISOString()
    };

    const metadataPath = path.join(process.cwd(), 'uploads', 'word', 'metadata.json');
    let metadata = [];
    if (fs.existsSync(metadataPath)) {
      metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    }
    metadata.push(documentRecord);
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

    res.status(201).json({ success: true, document: documentRecord });
  } catch (error) {
    console.error('Error uploading Word document:', error);
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
});

export default router;
