import express from 'express'
import { authenticate, authorize } from '../middleware/auth.js'
import { db } from '../database/init.js'

const router = express.Router()
router.use(authenticate)
router.use(authorize('supervisor'))

router.get('/dashboard/stats', (req, res) => {
  db.get(
    `SELECT 
      (SELECT COUNT(*) FROM proposals p JOIN groups g ON g.id = p.groupId WHERE g.supervisorId = (SELECT id FROM supervisors WHERE userId = ?) AND p.status = 'pending') as pendingProposals,
      (SELECT COUNT(*) FROM srs sr JOIN groups g ON g.id = sr.groupId WHERE g.supervisorId = (SELECT id FROM supervisors WHERE userId = ?) AND sr.status = 'pending') as pendingSRS,
      (SELECT COUNT(*) FROM meetings WHERE supervisorId = (SELECT id FROM supervisors WHERE userId = ?) AND status = 'pending') as upcomingMeetings,
      (SELECT COUNT(*) FROM groups WHERE supervisorId = (SELECT id FROM supervisors WHERE userId = ?)) as groupsCount`,
    [req.user.id, req.user.id, req.user.id, req.user.id],
    (err, row) => {
      if (err) return res.status(500).json({ message: 'Database error' })
      res.json(row)
    }
  )
})

router.get('/groups', (req, res) => {
  db.all(
    `SELECT g.*, 
     (SELECT COUNT(*) FROM students WHERE groupId = g.id) as memberCount
     FROM groups g
     WHERE g.supervisorId = (SELECT id FROM supervisors WHERE userId = ?)`,
    [req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json({ message: 'Database error' })
      
      // Get members for each group
      const groupsWithMembers = rows.map(group => {
        return new Promise((resolve) => {
          db.all(
            `SELECT u.id, u.name, u.enrollmentId, u.email 
             FROM students s 
             JOIN users u ON u.id = s.userId 
             WHERE s.groupId = ?`,
            [group.id],
            (err, members) => {
              if (err) {
                resolve({ ...group, members: [] })
              } else {
                resolve({ ...group, members: members || [] })
              }
            }
          )
        })
      })
      
      Promise.all(groupsWithMembers).then(groups => {
        res.json(groups)
      })
    }
  )
})

router.get('/proposals', (req, res) => {
  db.all(
    `SELECT p.*, g.name as groupName, g.id as groupId
     FROM proposals p 
     JOIN groups g ON g.id = p.groupId
     WHERE g.supervisorId = (SELECT id FROM supervisors WHERE userId = ?)
     ORDER BY p.id DESC`,
    [req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json({ message: 'Database error' })
      res.json(rows)
    }
  )
})

router.post('/proposals/:id/review', (req, res) => {
  const { action, comments } = req.body
  db.run(
    'UPDATE proposals SET status = ?, comments = ?, reviewedAt = CURRENT_TIMESTAMP WHERE id = ?',
    [action === 'approve' ? 'approved' : 'rejected', comments, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ message: 'Database error' })
      res.json({ message: 'Review submitted successfully' })
    }
  )
})

router.get('/srs', (req, res) => {
  db.all(
    `SELECT sr.*, g.name as groupName, g.id as groupId
     FROM srs sr 
     JOIN groups g ON g.id = sr.groupId
     WHERE g.supervisorId = (SELECT id FROM supervisors WHERE userId = ?)
     ORDER BY sr.id DESC`,
    [req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json({ message: 'Database error' })
      res.json(rows)
    }
  )
})

router.post('/srs/:id/review', (req, res) => {
  const { action, comments } = req.body
  db.run(
    'UPDATE srs SET status = ?, comments = ?, reviewedAt = CURRENT_TIMESTAMP WHERE id = ?',
    [action === 'approve' ? 'approved' : 'rejected', comments, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ message: 'Database error' })
      res.json({ message: 'Review submitted successfully' })
    }
  )
})

router.get('/meetings', (req, res) => {
  db.all(
    `SELECT m.*, g.name as groupName
     FROM meetings m 
     JOIN groups g ON g.id = m.groupId
     WHERE m.supervisorId = (SELECT id FROM supervisors WHERE userId = ?)
     ORDER BY m.date DESC`,
    [req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json({ message: 'Database error' })
      res.json(rows)
    }
  )
})

router.post('/meetings/:id/confirm', (req, res) => {
  db.run(
    'UPDATE meetings SET status = ? WHERE id = ?',
    ['confirmed', req.params.id],
    (err) => {
      if (err) return res.status(500).json({ message: 'Database error' })
      res.json({ message: 'Meeting confirmed' })
    }
  )
})

router.post('/meetings/:id/notes', (req, res) => {
  const { notes } = req.body
  db.run(
    'UPDATE meetings SET notes = ? WHERE id = ?',
    [notes, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ message: 'Database error' })
      res.json({ message: 'Notes saved' })
    }
  )
})

router.get('/chat/messages/:groupId', (req, res) => {
  db.all(
    `SELECT cm.*, 
     CASE WHEN cm.senderRole = 'student' THEN 'student' ELSE 'supervisor' END as sender
     FROM chat_messages cm
     WHERE cm.groupId = ?
     ORDER BY cm.createdAt ASC`,
    [req.params.groupId],
    (err, rows) => {
      if (err) return res.status(500).json({ message: 'Database error' })
      const messages = rows.map(msg => ({
        ...msg,
        sender: msg.senderId === req.user.id ? 'supervisor' : msg.senderRole
      }))
      res.json(messages)
    }
  )
})

router.post('/chat/messages', (req, res) => {
  const { groupId, message } = req.body
  
  // Verify supervisor has access to this group
  db.get(
    'SELECT id FROM groups WHERE id = ? AND supervisorId = (SELECT id FROM supervisors WHERE userId = ?)',
    [groupId, req.user.id],
    (err, group) => {
      if (err || !group) {
        return res.status(403).json({ message: 'Access denied' })
      }
      
      db.run(
        'INSERT INTO chat_messages (groupId, senderId, senderRole, message) VALUES (?, ?, ?, ?)',
        [groupId, req.user.id, 'supervisor', message],
        function(err) {
          if (err) return res.status(500).json({ message: 'Database error' })
          res.json({ id: this.lastID })
        }
      )
    }
  )
})

router.get('/progress', (req, res) => {
  db.all(
    `SELECT pr.*, g.name as groupName
     FROM progress_reports pr 
     JOIN groups g ON g.id = pr.groupId
     WHERE g.supervisorId = (SELECT id FROM supervisors WHERE userId = ?)
     ORDER BY pr.id DESC`,
    [req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json({ message: 'Database error' })
      res.json(rows)
    }
  )
})

export default router
