import express from 'express'
import { authenticate, authorize } from '../middleware/auth.js'
import { db } from '../database/init.js'

const router = express.Router()
router.use(authenticate)
router.use(authorize('panel'))

router.get('/dashboard/stats', (req, res) => {
  db.get(
    `SELECT 
      (SELECT COUNT(*) FROM evaluations e JOIN panel_members pm ON pm.panelId = e.panelId WHERE pm.userId = ? AND e.status = 'pending') as pendingEvaluations,
      (SELECT COUNT(*) FROM evaluation_marks WHERE panelMemberId = ?) as completedEvaluations`,
    [req.user.id, req.user.id],
    (err, row) => {
      if (err) return res.status(500).json({ message: 'Database error' })
      res.json(row)
    }
  )
})

router.get('/evaluations', (req, res) => {
  db.all(
    `SELECT sc.*, g.name as groupName, e.id as evaluationId, e.status,
     (SELECT COUNT(*) FROM evaluation_marks WHERE evaluationId = e.id AND panelMemberId = ?) as hasSubmitted
     FROM schedules sc
     JOIN evaluations e ON e.scheduleId = sc.id
     JOIN groups g ON g.id = sc.groupId
     JOIN panel_members pm ON pm.panelId = sc.panelId
     WHERE pm.userId = ? AND sc.status = 'scheduled'
     ORDER BY sc.date DESC`,
    [req.user.id, req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json({ message: 'Database error' })
      res.json(rows.map(row => ({
        ...row,
        status: row.hasSubmitted > 0 ? 'completed' : 'pending'
      })))
    }
  )
})

router.post('/evaluations/:id/marks', (req, res) => {
  const { marks, comments } = req.body
  db.get('SELECT id FROM evaluations WHERE id = ?', [req.params.id], (err, evaluation) => {
    if (err || !evaluation) return res.status(500).json({ message: 'Evaluation not found' })
    db.run(
      'INSERT INTO evaluation_marks (evaluationId, panelMemberId, marks, comments) VALUES (?, ?, ?, ?)',
      [req.params.id, req.user.id, marks, comments],
      function(err) {
        if (err) return res.status(500).json({ message: 'Database error' })
        db.get('SELECT COUNT(*) as count FROM evaluation_marks WHERE evaluationId = ?', [req.params.id], (err, result) => {
          if (err) return res.status(500).json({ message: 'Database error' })
          db.get('SELECT COUNT(*) as count FROM panel_members pm JOIN evaluations e ON e.panelId = pm.panelId WHERE e.id = ?', [req.params.id], (err, panelSize) => {
            if (result.count === panelSize.count) {
              db.run('UPDATE evaluations SET status = ? WHERE id = ?', ['completed', req.params.id])
            }
            res.json({ message: 'Marks submitted successfully' })
          })
        })
      }
    )
  })
})

export default router

