import * as express from 'express';
var router = express.Router();

// --- 2. GET STAFF LIST ---
router.get('/api/staff', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, name, role, contact FROM staff ORDER BY name ASC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- 3. ADD STAFF ---
router.post('/api/staff', async (req, res) => {
  const { name, role, contact } = req.body;
  if (!name || !role) return res.status(400).json({ error: 'Name and role are required' });

  try {
    const { rows } = await pool.query(
      'INSERT INTO staff (name, role, contact) VALUES ($1, $2, $3) RETURNING id, name, role, contact',
      [name, role, contact || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;