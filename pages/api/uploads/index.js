import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
export const config = { api: { bodyParser: false } };

export default async function handler(req,res){
  if(req.method !== 'POST') return res.status(405).end();
  const form = formidable({ multiples: false, uploadDir: './public/uploads', keepExtensions: true });
  form.parse(req, (err, fields, files) => {
    if(err) return res.status(500).json({error: String(err)});
    const file = files.file;
    const url = '/uploads/' + path.basename(file.filepath || file.path);
    res.json({ok:true, url});
  });
}
