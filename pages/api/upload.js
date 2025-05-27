import { formidable } from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const uploadDir = path.join(process.cwd(), 'public', 'uploads');

  try {
    await fs.promises.mkdir(uploadDir, { recursive: true });
  } catch (mkdirErr) {
    console.error('Error creating upload directory:', mkdirErr);
    return res.status(500).json({ success: false, error: 'Could not create upload directory' });
  }

  const options = {
    multiples: false,
    uploadDir,
    keepExtensions: true,
  };

  const formParse = () =>
    new Promise((resolve, reject) => {
      formidable(options).parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

  try {
    const { files } = await formParse();

    const fileField = files.file;
    if (!fileField) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const file = Array.isArray(fileField) ? fileField[0] : fileField;

    const oldPath = file.filepath || file.path;
    const filename = file.originalFilename || file.name;

    if (!filename || !oldPath) {
      return res.status(400).json({ success: false, error: 'Invalid file upload' });
    }

    const newPath = path.join(uploadDir, filename);

    await fs.promises.rename(oldPath, newPath);

    const downloadUrl = `/uploads/${filename}`;

    return res.status(200).json({ success: true, downloadUrl });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ success: false, error: 'Upload failed' });
  }
}
