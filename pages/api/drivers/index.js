import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const drivers = await prisma.driver.findMany({
        include: { reviews: true },
        orderBy: { createdAt: "desc" },
      });

      return res.status(200).json({ ok: true, drivers });
    } catch (err) {
      console.error("API GET Error:", err);
      return res.status(500).json({ ok: false, error: err.message });
    }
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}
