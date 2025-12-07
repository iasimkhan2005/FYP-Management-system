import express from 'express'
import { authenticate, authorize } from '../middleware/auth.js'
import { db } from '../database/init.js'

const router = express.Router()
router.use(authenticate)
router.use(authorize('coordinator', 'hod'))

router.get('/dashboard/stats', (req, res) => {
  db.get(
    `SELECT 
      (SELECT COUNT(*) FROM students) as totalStudents,
      (SELECT COUNT(*) FROM groups) as totalGroups,
      (SELECT COUNT(*) FROM supervisors) as totalSupervisors,
      (SELECT COUNT(*) FROM schedules WHERE status = 'scheduled') as pendingSchedules,
      (SELECT COUNT(DISTINCT panelId) FROM schedules WHERE status = 'scheduled') as activePanels`,
    (err, row) => {
      if (err) return res.status(500).json({ message: 'Database error' })
      res.json(row)
    }
  )
})

// Get all groups with their members
router.get('/groups', (req, res) => {
  db.all(
    `SELECT g.*, 
     (SELECT name FROM users WHERE id = (SELECT userId FROM supervisors WHERE id = g.supervisorId)) as supervisorName,
     (SELECT status FROM proposals WHERE groupId = g.id ORDER BY id DESC LIMIT 1) as proposalStatus,
     (SELECT status FROM srs WHERE groupId = g.id ORDER BY id DESC LIMIT 1) as srsStatus
     FROM groups g`,
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

// Get all students (for creating groups)
router.get('/students', (req, res) => {
  db.all(
    `SELECT u.id, u.name, u.enrollmentId, u.email,
     s.groupId, g.name as groupName
     FROM users u 
     JOIN students s ON s.userId = u.id
     LEFT JOIN groups g ON g.id = s.groupId`,
    (err, rows) => {
      if (err) return res.status(500).json({ message: 'Database error' })
      res.json(rows)
    }
  )
})

// Create a new group
router.post('/groups', (req, res) => {
  const { name, studentIds, supervisorId } = req.body
  
  if (!name || !studentIds || studentIds.length !== 2) {
    return res.status(400).json({ message: 'Group must have exactly 2 students' })
  }
  
  db.run('INSERT INTO groups (name, supervisorId) VALUES (?, ?)', [name, supervisorId || null], function(err) {
    if (err) return res.status(500).json({ message: 'Database error' })
    const groupId = this.lastID
    
    // Assign students to group
    studentIds.forEach(studentId => {
      db.run('UPDATE students SET groupId = ? WHERE userId = ?', [groupId, studentId])
    })
    
    res.json({ id: groupId, message: 'Group created successfully' })
  })
})

// Assign supervisor to group
router.post('/groups/:id/assign-supervisor', (req, res) => {
  const { supervisorId } = req.body
  
  // Check if supervisor already has 2 groups
  db.get(
    'SELECT COUNT(*) as count FROM groups WHERE supervisorId = ?',
    [supervisorId],
    (err, row) => {
      if (err) return res.status(500).json({ message: 'Database error' })
      if (row.count >= 2) {
        return res.status(400).json({ message: 'Supervisor already has 2 groups assigned' })
      }
      
      db.run(
        'UPDATE groups SET supervisorId = ? WHERE id = ?',
        [supervisorId, req.params.id],
        (err) => {
          if (err) return res.status(500).json({ message: 'Database error' })
          res.json({ message: 'Supervisor assigned successfully' })
        }
      )
    }
  )
})

router.get('/supervisors', (req, res) => {
  db.all(
    `SELECT u.id, u.name, u.email,
     (SELECT COUNT(*) FROM groups WHERE supervisorId = s.id) as groupsCount
     FROM users u 
     JOIN supervisors s ON s.userId = u.id`,
    (err, rows) => {
      if (err) return res.status(500).json({ message: 'Database error' })
      res.json(rows)
    }
  )
})

router.get('/panels', (req, res) => {
  db.all(
    `SELECT p.*, 
     GROUP_CONCAT(u.name) as members,
     (SELECT COUNT(*) FROM schedules WHERE panelId = p.id AND status = 'scheduled') as activeEvaluations
     FROM panels p
     LEFT JOIN panel_members pm ON pm.panelId = p.id
     LEFT JOIN users u ON u.id = pm.userId
     GROUP BY p.id`,
    (err, rows) => {
      if (err) return res.status(500).json({ message: 'Database error' })
      res.json(rows.map(row => ({
        ...row,
        members: row.members ? row.members.split(',') : []
      })))
    }
  )
})

router.post('/panels', (req, res) => {
  const { name, members } = req.body
  db.run('INSERT INTO panels (name) VALUES (?)', [name], function(err) {
    if (err) return res.status(500).json({ message: 'Database error' })
    const panelId = this.lastID
    members.forEach(memberId => {
      db.run('INSERT INTO panel_members (panelId, userId) VALUES (?, ?)', [panelId, memberId])
    })
    res.json({ id: panelId, message: 'Panel created successfully' })
  })
})

router.get('/panel-members', (req, res) => {
  db.all(
    `SELECT id, name, email FROM users WHERE role = 'panel'`,
    (err, rows) => {
      if (err) return res.status(500).json({ message: 'Database error' })
      res.json(rows)
    }
  )
})

router.get('/schedules', (req, res) => {
  db.all(
    `SELECT sc.*, g.name as groupName, p.name as panelName
     FROM schedules sc
     JOIN groups g ON g.id = sc.groupId
     JOIN panels p ON p.id = sc.panelId
     ORDER BY sc.date DESC`,
    (err, rows) => {
      if (err) return res.status(500).json({ message: 'Database error' })
      res.json(rows)
    }
  )
})

router.post('/schedules', (req, res) => {
  const { groupId, panelId, type, date, time, venue } = req.body
  db.get('SELECT id FROM groups WHERE id = ?', [groupId], (err, group) => {
    if (err || !group) return res.status(500).json({ message: 'Group not found' })
    db.run(
      'INSERT INTO schedules (groupId, panelId, type, date, time, venue) VALUES (?, ?, ?, ?, ?, ?)',
      [groupId, panelId, type, date, time, venue],
      function(err) {
        if (err) return res.status(500).json({ message: 'Database error' })
        db.run(
          'INSERT INTO evaluations (scheduleId, groupId, panelId, type) VALUES (?, ?, ?, ?)',
          [this.lastID, groupId, panelId, type]
        )
        res.json({ id: this.lastID, message: 'Schedule created successfully' })
      }
    )
  })
})

router.get('/evaluations', (req, res) => {
  db.all(
    `SELECT e.*, g.name as groupName, p.name as panelName,
     (SELECT COUNT(*) FROM panel_members WHERE panelId = e.panelId) as panelSize,
     (SELECT COUNT(*) FROM evaluation_marks WHERE evaluationId = e.id) as marksSubmitted
     FROM evaluations e
     JOIN groups g ON g.id = e.groupId
     JOIN panels p ON p.id = e.panelId
     ORDER BY e.id DESC`,
    (err, rows) => {
      if (err) return res.status(500).json({ message: 'Database error' })
      res.json(rows)
    }
  )
})

router.post('/evaluations/:id/publish', (req, res) => {
  db.get('SELECT * FROM evaluations WHERE id = ?', [req.params.id], (err, evaluation) => {
    if (err) return res.status(500).json({ message: 'Database error' })
    db.get('SELECT AVG(marks) as avgMarks FROM evaluation_marks WHERE evaluationId = ?', [req.params.id], (err, result) => {
      if (err) return res.status(500).json({ message: 'Database error' })
      db.run(
        'UPDATE evaluations SET status = ?, totalMarks = ?, publishedAt = CURRENT_TIMESTAMP WHERE id = ?',
        ['published', result.avgMarks, req.params.id],
        (err) => {
          if (err) return res.status(500).json({ message: 'Database error' })
          res.json({ message: 'Marks published successfully' })
        }
      )
    })
  })
})

export default router

