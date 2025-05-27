import formidable from 'formidable';
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

    const file = files.file; // your input field name is "file"

    if (!file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const fileName = path.basename(file.filepath);
    const downloadUrl = `${process.env.BASE_URL}/uploads/${fileName}`;

    return res.status(200).json({
      success: true,
      downloadUrl,
    });
  });
}
