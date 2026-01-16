import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({
      ok: false,
      message: "User ID is required",
    });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: {
        id: Number(userId),
      },
      data: {
        isSubscribed: true,
        paymentRequested: false,
        // subscriptionDate: new Date(), // optional
      },
    });

    return res.status(200).json({
      ok: true,
      message: "Subscription activated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Subscription Activation Error:", error);
    return res.status(500).json({
      ok: false,
      message: "Internal server error",
    });
  }
}
