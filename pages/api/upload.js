import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false, // Important: disable built-in body parser
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const form = new formidable.IncomingForm({
    uploadDir: '/tmp',  // temporary folder for files
    keepExtensions: true,
  });

  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error('Form parse error:', err);
      return res.status(500).json({ success: false, error: 'Upload failed' });
    }

    // Example: get uploaded file path and name
    const file = files.file; // your input field name is "file"

    if (!file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    // Construct a public URL assuming you serve files from /public/uploads
    // WARNING: files in /tmp don't persist, so this URL won't actually work for downloads
    // For production, upload to S3 or similar

    const fileName = path.basename(file.filepath);
    const downloadUrl = `${process.env.BASE_URL}/uploads/${fileName}`;

    // For demo, just respond with success and dummy URL
    return res.status(200).json({
      success: true,
      downloadUrl,
    });
  });
}
