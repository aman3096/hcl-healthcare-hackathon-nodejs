var express = require('express');
var router = express.Router();

// --- 8. MARK ATTENDANCE ---
router.post('/api/attendance', authenticateToken, async (req, res) => {
  const { assignmentId, status, remarks } = req.body;
  if (!assignmentId || !['present', 'absent'].includes(status)) {
    return res.status(400).json({ error: 'assignmentId and valid status ("present" or "absent") are required' });
  }

  try {
    // Check if attendance record exists
    const { rows: existing } = await pool.query(
      'SELECT * FROM attendance WHERE assignment_id = $1',
      [assignmentId]
    );

    if (existing.length > 0) {
      // Update existing attendance
      const { rows } = await pool.query(
        'UPDATE attendance SET status = $1, remarks = $2 WHERE assignment_id = $3 RETURNING *',
        [status, remarks || null, assignmentId]
      );
      res.json(rows[0]);
    } else {
      // Insert new attendance
      const { rows } = await pool.query(
        'INSERT INTO attendance (assignment_id, status, remarks) VALUES ($1, $2, $3) RETURNING *',
        [assignmentId, status, remarks || null]
      );
      res.status(201).json(rows[0]);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- 9. GET WEEKLY CONFLICT ALERTS ---
router.get('/api/alerts/conflicts', authenticateToken, async (req, res) => {
  const { weekOf } = req.query;
  if (!weekOf) return res.status(400).json({ error: 'weekOf query parameter is required' });

  try {
    // Get conflicts: staff assigned to multiple shifts on same day in the week
    const { rows } = await pool.query(
      `SELECT s.id as staff_id, s.name as staff_name, sh.date, ARRAY_AGG(sh.type) AS shifts
       FROM shift_assignments sa
       JOIN staff s ON sa.staff_id = s.id
       JOIN shifts sh ON sa.shift_id = sh.id
       WHERE sh.date >= $1 AND sh.date < ($1::date + interval '7 days')
       GROUP BY s.id, s.name, sh.date
       HAVING COUNT(sa.id) > 1
       ORDER BY s.name, sh.date`,
      [weekOf]
    );

    // Format conflicts grouped by staff
    const conflictsByStaff = {};
    rows.forEach(r => {
      if (!conflictsByStaff[r.staff_id]) {
        conflictsByStaff[r.staff_id] = {
          staffId: r.staff_id,
          staffName: r.staff_name,
          conflicts: []
        };
      }
      conflictsByStaff[r.staff_id].conflicts.push({
        date: r.date.toISOString().split('T')[0],
        shifts: r.shifts
      });
    });

    res.json(Object.values(conflictsByStaff));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


module.exports = router;
