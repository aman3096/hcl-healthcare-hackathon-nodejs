var express = require("express");
var router = express.Router();

// --- 4. LIST SHIFTS ---
router.get('/', async (req, res) => {
  const { date, type } = req.query;
  let query = 'SELECT s.id, s.date, s.type, s.capacity, COUNT(sa.id) AS assigned_count FROM shifts s LEFT JOIN shift_assignments sa ON s.id = sa.shift_id GROUP BY s.id ORDER BY s.date DESC, s.type ASC';
  const params = [];

  if (date && type) {
    query = 'SELECT s.id, s.date, s.type, s.capacity, COUNT(sa.id) AS assigned_count FROM shifts s LEFT JOIN shift_assignments sa ON s.id = sa.shift_id WHERE s.date = $1 AND s.type = $2 GROUP BY s.id';
    params.push(date, type);
  } else if (date) {
    query = 'SELECT s.id, s.date, s.type, s.capacity, COUNT(sa.id) AS assigned_count FROM shifts s LEFT JOIN shift_assignments sa ON s.id = sa.shift_id WHERE s.date = $1 GROUP BY s.id';
    params.push(date);
  } else if (type) {
    query = 'SELECT s.id, s.date, s.type, s.capacity, COUNT(sa.id) AS assigned_count FROM shifts s LEFT JOIN shift_assignments sa ON s.id = sa.shift_id WHERE s.type = $1 GROUP BY s.id';
    params.push(type);
  }

  try {
    const { rows } = await pool.query(query, params);
    res.json(rows.map(r => ({
      id: r.id,
      date: r.date,
      type: r.type,
      capacity: r.capacity,
      assignedCount: parseInt(r.assigned_count, 10),
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- 5. CREATE SHIFT ---
router.post('/',  async (req, res) => {
  const { date, type, capacity } = req.body;
  if (!date || !type || !capacity) return res.status(400).json({ error: 'Date, type and capacity required' });

  try {
    // Check if shift exists
    const { rows: existing } = await pool.query('SELECT * FROM shifts WHERE date = $1 AND type = $2', [date, type]);
    if (existing.length > 0) return res.status(400).json({ error: 'Shift for this date and type already exists' });

    const { rows } = await pool.query(
      'INSERT INTO shifts (date, type, capacity) VALUES ($1, $2, $3) RETURNING id, date, type, capacity',
      [date, type, capacity]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- 6. ASSIGN STAFF TO SHIFT ---
router.post('/:id/assignments', async (req, res) => {
  const shiftId = req.params.id;
  const { staffId } = req.body;

  if (!staffId) return res.status(400).json({ error: 'staffId is required' });

  try {
    // Check if shift exists
    const { rows: shiftRows } = await pool.query('SELECT * FROM shifts WHERE id = $1', [shiftId]);
    if (shiftRows.length === 0) return res.status(404).json({ error: 'Shift not found' });

    const shift = shiftRows[0];

    // Check if staff exists
    const { rows: staffRows } = await pool.query('SELECT * FROM staff WHERE id = $1', [staffId]);
    if (staffRows.length === 0) return res.status(404).json({ error: 'Staff not found' });

    // Check shift capacity
    const { rows: assignedCountRows } = await pool.query(
      'SELECT COUNT(*) FROM shift_assignments WHERE shift_id = $1',
      [shiftId]
    );
    const assignedCount = parseInt(assignedCountRows[0].count, 10);
    if (assignedCount >= shift.capacity) return res.status(409).json({ error: 'Shift capacity exceeded' });

    // Check if staff already assigned to any shift on same date
    const { rows: conflictRows } = await pool.query(
      `SELECT sa.* FROM shift_assignments sa
       JOIN shifts s ON sa.shift_id = s.id
       WHERE sa.staff_id = $1 AND s.date = $2`,
      [staffId, shift.date]
    );
    if (conflictRows.length > 0) return res.status(400).json({ error: 'Staff already assigned to a shift on this date' });

    // Assign staff
    const { rows } = await pool.query(
      'INSERT INTO shift_assignments (shift_id, staff_id) VALUES ($1, $2) RETURNING id',
      [shiftId, staffId]
    );

    res.status(201).json({
      assignmentId: rows[0].id,
      shiftId: Number(shiftId),
      staffId
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- 7. GET ASSIGNED STAFF FOR SHIFT ---
router.get('/:id/assignments', async (req, res) => {
  const shiftId = req.params.id;

  try {
    const { rows } = await pool.query(
      `SELECT sa.id AS assignment_id, s.id AS staff_id, s.name AS staff_name, s.role, s.contact
       FROM shift_assignments sa
       JOIN staff s ON sa.staff_id = s.id
       WHERE sa.shift_id = $1`,
      [shiftId]
    );

    res.json(rows.map(r => ({
      assignmentId: r.assignment_id,
      staffId: r.staff_id,
      staffName: r.staff_name,
      role: r.role,
      contact: r.contact
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});



export default router;