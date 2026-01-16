import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: { bodyParser: false }, // Necessary for handling file streams
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const form = new IncomingForm();
  // Files will be temporarily stored here before being moved
  const uploadDir = path.join(process.cwd(), '/public/uploads');

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  form.uploadDir = uploadDir;
  form.keepExtensions = true;

  form.parse(req, (err, fields, files) => {
    if (err) return res.status(500).json({ error: "Upload failed" });
    
    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    const fileName = path.basename(file.filepath);
    
    // This is the URL that will be saved in the database
    const publicUrl = `/uploads/${fileName}`;

    return res.status(200).json({ ok: true, url: publicUrl });
  });
}