const connectDB = require('../config/connectDB');
const { RoadmapSchema, RoadmapUpdateSchema } = require('../Schema/roadmapSchema');
const moment = require('moment-timezone');

const db = connectDB();

function toISTIso() {
  return moment().tz('Asia/Kolkata').toISOString();
}

async function createRoadmap(req, res) {
  try {
    const parsed = RoadmapSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: 'Invalid payload', details: parsed.error.flatten() });
    }
    const data = parsed.data;
    const payload = { 
      ...data, 
      email: req.body.email || data.email, 
      userId: req.body.userId || data.userId, 
      ownerName: req.body.name || data.ownerName, 
      createdAt: toISTIso(), 
      updatedAt: toISTIso()
    };
    const ref = await db.collection('roadmaps').add(payload);
    const snap = await ref.get();
    return res.status(201).json({ success: true, data: { id: ref.id, ...snap.data() } });
  } catch (err) {
    console.error('createRoadmap error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

async function listRoadmaps(req, res) {
  try {
    const email = req.body.email || req.query.email;
    let query = db.collection('roadmaps');
    if (email) query = query.where('email', '==', email);
    const snap = await query.get();
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return res.json({ success: true, data: items });
  } catch (err) {
    console.error('listRoadmaps error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

async function getRoadmap(req, res) {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, error: 'id is required' });
    const ref = db.collection('roadmaps').doc(id);
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ success: false, error: 'Roadmap not found' });
    const doc = { id: snap.id, ...snap.data() };
    if (doc.email && req.body.email && doc.email !== req.body.email) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }
    return res.json({ success: true, data: doc });
  } catch (err) {
    console.error('getRoadmap error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

async function updateRoadmap(req, res) {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, error: 'id is required' });

    const parsed = RoadmapUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: 'Invalid payload', details: parsed.error.flatten() });
    }

    const update = parsed.data;
    if (Object.prototype.hasOwnProperty.call(update, 'createdAt')) delete update.createdAt;

    update.updatedAt = toISTIso();

    const ref = db.collection('roadmaps').doc(id);
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ success: false, error: 'Roadmap not found' });
    const existing = snap.data();
    if (existing.email && req.body.email && existing.email !== req.body.email) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    await ref.set(update, { merge: true });
    const fresh = await ref.get();
    return res.json({ success: true, data: { id: fresh.id, ...fresh.data() } });
  } catch (err) {
    console.error('updateRoadmap error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

async function deleteRoadmap(req, res) {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, error: 'id is required' });

    const ref = db.collection('roadmaps').doc(id);
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ success: false, error: 'Roadmap not found' });
    const existing = snap.data();
    if (existing.email && req.body.email && existing.email !== req.body.email) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    await ref.delete();
    return res.json({ success: true, message: 'Roadmap deleted' });
  } catch (err) {
    console.error('deleteRoadmap error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = { createRoadmap, listRoadmaps, getRoadmap, updateRoadmap, deleteRoadmap };
