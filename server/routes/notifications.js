import express from 'express'
import { authenticate } from '../middleware/auth.js'
import { db } from '../database/init.js'

const router = express.Router()
router.use(authenticate)

router.get('/', (req, res) => {
  db.all(
    'SELECT * FROM notifications WHERE userId = ? ORDER BY createdAt DESC LIMIT 50',
    [req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json({ message: 'Database error' })
      res.json(rows)
    }
  )
})

router.patch('/:id/read', (req, res) => {
  db.run(
    'UPDATE notifications SET read = 1 WHERE id = ? AND userId = ?',
    [req.params.id, req.user.id],
    (err) => {
      if (err) return res.status(500).json({ message: 'Database error' })
      res.json({ message: 'Notification marked as read' })
    }
  )
})

router.patch('/read-all', (req, res) => {
  db.run(
    'UPDATE notifications SET read = 1 WHERE userId = ?',
    [req.user.id],
    (err) => {
      if (err) return res.status(500).json({ message: 'Database error' })
      res.json({ message: 'All notifications marked as read' })
    }
  )
})

export default router

