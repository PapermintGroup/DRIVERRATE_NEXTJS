import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  try {
    // We include both paymentRequested and popUrl in the select block
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isSubscribed: true,
        paymentRequested: true, // Shows the warning icon
        popUrl: true,           // <--- ADDED THIS: This allows the Admin to see the POP link
      },
      orderBy: { 
        createdAt: 'desc' 
      }
    });

    return res.status(200).json({ ok: true, users });
  } catch (error) {
    console.error("Fetch Users Error:", error);
    return res.status(500).json({ ok: false, error: "Failed to fetch users" });
  }
}