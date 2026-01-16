import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { 
    driverId, 
    userId,
    punctuality, 
    cleanliness, 
    trustworthiness, 
    safety, 
    communication, 
    reliability, 
    comment 
  } = req.body;

  // Basic validation to ensure we have a user
  if (!userId) {
    return res.status(401).json({ error: 'You must be logged in to rate a driver' });
  }

  try {
    // 1. Check if this user has already rated this driver
    const existingReview = await prisma.review.findFirst({
      where: {
        driverId: parseInt(driverId),
        userId: parseInt(userId)
      }
    });

    if (existingReview) {
      return res.status(400).json({ ok: false, error: 'You have already rated this driver' });
    }

    // 2. If no existing review, create the new one
    const review = await prisma.review.create({
      data: {
        driverId: parseInt(driverId),
        userId: parseInt(userId),
        punctuality: parseInt(punctuality) || 5,
        cleanliness: parseInt(cleanliness) || 5,
        trustworthiness: parseInt(trustworthiness) || 5,
        safety: parseInt(safety) || 5,
        communication: parseInt(communication) || 5,
        reliability: parseInt(reliability) || 5,
        comment: comment || ""
      }
    });

    return res.status(200).json({ ok: true, review });
  } catch (err) {
    console.error("Review Submission Error:", err);
    return res.status(500).json({ error: 'Failed to submit review' });
  }
}