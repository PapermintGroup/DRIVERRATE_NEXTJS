import prisma from '../../../../lib/prisma';

export default async function handler(req, res) {
  const { id } = req.query;
  
  // Ensure we have a valid numeric ID for the database query
  const driverId = parseInt(id);

  if (isNaN(driverId)) {
    return res.status(400).json({ ok: false, error: 'Invalid ID format' });
  }

  if (req.method === 'GET') {
    try {
      // Fetch driver and their reviews from Supabase
      const d = await prisma.driver.findUnique({
        where: { id: driverId },
        include: {
          reviews: {
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      if (!d) {
        return res.status(404).json({ ok: false, error: 'Not found' });
      }

      // Compute Scores logic converted from SQLite to Prisma arrays
      const reviews = d.reviews || [];
      let scores = null;

      if (reviews.length > 0) {
        const cats = ['punctuality', 'cleanliness', 'trustworthiness', 'safety', 'communication', 'reliability'];
        const agg = {};
        cats.forEach(c => agg[c] = 0);

        reviews.forEach(r => {
          cats.forEach(c => {
            agg[c] += (r[c] || 0);
          });
        });

        const counts = reviews.length;
        const avg = {};
        let total = 0;

        cats.forEach(c => {
          avg[c] = +(agg[c] / counts).toFixed(2);
          total += avg[c];
        });

        const overall = +(total / cats.length).toFixed(2);
        scores = { counts, averages: avg, overall };
      }

      // Format arrays for consistency with your previous layout
      const driverData = {
        ...d,
        service_areas: typeof d.serviceAreas === 'string' ? JSON.parse(d.serviceAreas || '[]') : d.serviceAreas,
        routes: typeof d.routes === 'string' ? JSON.parse(d.routes || '[]') : d.routes
      };

      res.json({ ok: true, driver: driverData, reviews, scores });

    } catch (error) {
      console.error("Database Error:", error);
      res.status(500).json({ ok: false, error: 'Server Error' });
    }

  } else if (req.method === 'POST') {
    try {
      const body = req.body;
      
      // Insert into Supabase using Prisma
      const newReview = await prisma.review.create({
        data: {
          driverId: driverId,
          userId: body.userId, 
          punctuality: body.punctuality || 0,
          cleanliness: body.cleanliness || 0,
          trustworthiness: body.trustworthiness || 0,
          safety: body.safety || 0,
          communication: body.communication || 0,
          reliability: body.reliability || 0,
          comment: body.comment || '',
        }
      });

      // Recalculate scores for the response
      const allReviews = await prisma.review.findMany({ where: { driverId } });
      
      // Simple score re-calc for the POST response
      const cats = ['punctuality', 'cleanliness', 'trustworthiness', 'safety', 'communication', 'reliability'];
      const avg = {};
      let total = 0;
      
      cats.forEach(c => {
        const sum = allReviews.reduce((acc, curr) => acc + (curr[c] || 0), 0);
        avg[c] = +(sum / allReviews.length).toFixed(2);
        total += avg[c];
      });

      res.json({ 
        ok: true, 
        review_id: newReview.id, 
        scores: { 
          counts: allReviews.length, 
          averages: avg, 
          overall: +(total / cats.length).toFixed(2) 
        } 
      });

    } catch (error) {
      console.error("POST Error:", error);
      res.status(500).json({ ok: false, error: 'Failed to save review' });
    }
  } else {
    res.status(405).end();
  }
}