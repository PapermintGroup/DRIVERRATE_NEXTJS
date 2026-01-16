import prisma from '../../../../lib/prisma';
import { v4 as uuidv4 } from 'uuid';

function computeScores(driverId){
  const rows = db.prepare('SELECT * FROM reviews WHERE driver_id = ?').all(driverId);
  if(!rows || rows.length===0) return null;
  const cats = ['punctuality','cleanliness','trustworthiness','safety','communication','reliability'];
  const agg = {}; cats.forEach(c=>agg[c]=0);
  rows.forEach(r=> cats.forEach(c=> agg[c]+= (r[c]||0)));
  const counts = rows.length;
  const avg = {}; let total=0;
  cats.forEach(c=>{ avg[c] = +(agg[c]/counts).toFixed(2); total += avg[c];});
  const overall = +(total / cats.length).toFixed(2);
  return { counts, averages: avg, overall };
}

export default function handler(req,res){
  const { id } = req.query;
  if(req.method === 'GET'){
    const d = db.prepare('SELECT * FROM drivers WHERE id = ?').get(id);
    if(!d) return res.status(404).json({error:'Not found'});
    const reviews = db.prepare('SELECT * FROM reviews WHERE driver_id = ? ORDER BY created_at DESC').all(id);
    const scores = computeScores(id);
    d.service_areas = JSON.parse(d.service_areas||'[]');
    d.routes = JSON.parse(d.routes||'[]');
    res.json({ok:true, driver: d, reviews, scores});
  } else if(req.method === 'POST'){
    const body = req.body;
    const reviewId = uuidv4();
    const created_at = new Date().toISOString();
    db.prepare('INSERT INTO reviews (id,driver_id, punctuality, cleanliness, trustworthiness, safety, communication, reliability, comment, created_at) VALUES (?,?,?,?,?,?,?,?,?,?)')
      .run(reviewId, id, body.punctuality||0, body.cleanliness||0, body.trustworthiness||0, body.safety||0, body.communication||0, body.reliability||0, body.comment||'', created_at);
    const scores = computeScores(id);
    res.json({ok:true, review_id: reviewId, scores});
  } else res.status(405).end();
}
