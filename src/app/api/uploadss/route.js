import { NextResponse } from 'next/server';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

// Disable default body parser (important!)
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req) {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');

  // Ensure uploads directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const form = formidable({
    multiples: false,
    uploadDir: uploadDir,
    keepExtensions: true,
  });

  return new Promise((resolve, reject) => {
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Form parsing error:', err);
        return reject(NextResponse.json({ success: false, error: 'Form parse error' }));
      }

      const file = files.file[0]; // Unity sends with name "file"
      const newPath = path.join(uploadDir, file.originalFilename);

      fs.rename(file.filepath, newPath, (renameErr) => {
        if (renameErr) {
          console.error('Rename error:', renameErr);
          return reject(NextResponse.json({ success: false, error: 'File save error' }));
        }

        const downloadUrl = `/uploads/${file.originalFilename}`;
        resolve(NextResponse.json({ success: true, downloadUrl }));
      });
    });
  });
}
