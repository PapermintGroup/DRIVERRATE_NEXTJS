import prisma from '../../../lib/prisma';
import jwt from 'jsonwebtoken';
const cookie = require("cookie");

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { token } = cookie.parse(req.headers.cookie || '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }

  // Destructure the new fields from req.body
  const { 
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
    const driver = await prisma.driver.create({
      data: {
        userId: parseInt(decoded.id),
        name,
        companyName: companyName || null,
        email: email || null,
        phone: phone || null,
        serviceAreas: serviceAreas || null,
        routes: routes || null,
        // Map the new fields to the database
        facebook: facebook || null,
        instagram: instagram || null,
        twitter: twitter || null,
        whatsapp: whatsapp || null,
        profilePhoto: profilePhoto || null,
        vehiclePics: vehiclePics || null,
        idPic: idPic || null
      }
    });

    return res.status(200).json({ ok: true, driver });
  } catch (err) {
    console.error('CREATE DRIVER ERROR:', err);
    return res.status(500).json({ error: err.message });
  }
}