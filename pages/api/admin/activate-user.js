import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { userId, status } = req.body;

  try {
    await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { 
        isSubscribed: status,
        paymentRequested: false
      },
    });
    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({ ok: false });
  }
}