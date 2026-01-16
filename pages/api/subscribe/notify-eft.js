import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // Added popUrl to the destructuring
  const { userId, reference, popUrl } = req.body;

  if (!userId) {
    return res.status(400).json({ ok: false, message: "Missing User ID" });
  }

  try {
    // Update the database with BOTH the request flag and the image URL
    await prisma.user.update({
      where: { id: Number(userId) },
      data: { 
        paymentRequested: true,
        popUrl: popUrl || null // Saves the uploaded image link to the DB
      },
    });

    console.log(`Payment Notification Saved: User ${userId} used reference ${reference}. POP included: ${!!popUrl}`);

    return res.status(200).json({ 
      ok: true, 
      message: "Notification saved. Admin has been alerted." 
    });
  } catch (error) {
    console.error("EFT Notification Error:", error);
    return res.status(500).json({ ok: false, message: "Internal server error" });
  }
}