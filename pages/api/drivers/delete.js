import prisma from '../../../lib/prisma';
import jwt from 'jsonwebtoken';
const cookie = require("cookie");

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') return res.status(405).end();

  // 1. Authenticate the User
  const { token } = cookie.parse(req.headers.cookie || '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  let user;
  try {
    user = jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const { id } = req.body;

  try {
    // 2. Security Check: Ensure this driver belongs to the user trying to delete it
    const driver = await prisma.driver.findUnique({ where: { id: parseInt(id) } });
    
    if (!driver) return res.status(404).json({ error: 'Driver not found' });
    if (driver.userId !== user.id) return res.status(403).json({ error: 'Forbidden' });

    // 3. Delete from DB
    await prisma.driver.delete({ where: { id: parseInt(id) } });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('DELETE ERROR:', err);
    return res.status(500).json({ error: 'Could not delete profile' });
  }
}