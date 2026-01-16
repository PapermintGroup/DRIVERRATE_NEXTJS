import prisma from '../../lib/prisma';
import jwt from 'jsonwebtoken';
const cookie = require('cookie');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

export default async function handler(req, res) {
  try {
    const cookies = cookie.parse(req.headers.cookie || '');
    const token = cookies.token;

    if (!token) return res.status(200).json({ ok: false, user: null });

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(200).json({ ok: false, user: null });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      // We MUST include the monetization fields in the selection
      select: { 
        id: true, 
        name: true, 
        email: true, 
        role: true,
        isSubscribed: true,      // Added for status bar
        paymentRequested: true   // Added for notification badge
      },
    });

    if (!user) return res.status(200).json({ ok: false, user: null });

    res.status(200).json({ ok: true, user });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Internal server error' });
  }
}