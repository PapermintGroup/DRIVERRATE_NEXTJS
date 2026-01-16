import prisma from '../../../lib/prisma';
import jwt from 'jsonwebtoken';
const cookie = require("cookie");

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

export default async function handler(req, res) {
  if (req.method !== 'PUT') return res.status(405).end();

  const { token } = cookie.parse(req.headers.cookie || '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  let user;
  try {
    user = jwt.verify(token, JWT_SECRET);
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const { 
    id, 
    name, 
    companyName, 
    serviceAreas, 
    routes, 
    email, 
    phone,
    facebook,
    instagram,
    twitter,
    whatsapp,
    profilePhoto,
    vehiclePics,
    idPic
  } = req.body;

  try {
    const existing = await prisma.driver.findUnique({ where: { id: parseInt(id) } });
    
    // Allow update if the user is the owner OR an admin
    if (!existing || (existing.userId !== user.id && user.role !== "admin")) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updatedDriver = await prisma.driver.update({
      where: { id: parseInt(id) },
      data: {
        name,
        companyName: companyName || null,
        email: email || null,
        phone: phone || null,
        serviceAreas: serviceAreas || null,
        routes: routes || null,
        facebook: facebook || null,
        instagram: instagram || null,
        twitter: twitter || null,
        whatsapp: whatsapp || null,
        profilePhoto: profilePhoto || null,
        vehiclePics: vehiclePics || null,
        idPic: idPic || null
      }
    });

    return res.status(200).json({ ok: true, driver: updatedDriver });
  } catch (err) {
    console.error('UPDATE ERROR:', err);
    return res.status(500).json({ error: err.message });
  }
}