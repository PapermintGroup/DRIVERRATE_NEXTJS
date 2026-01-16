import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const { userId } = req.body;

  try {
    await prisma.user.update({
      where: { id: Number(userId) },
      data: { 
        paymentRequested: false, 
        popUrl: null // Clears the file so they can upload a new one
      },
    });

    return res.status(200).json({ ok: true, message: "Payment request cleared." });
  } catch (error) {
    return res.status(500).json({ ok: false, error: "Failed to clear request" });
  }
}