import express from 'express'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import { authenticate, authorize } from '../middleware/auth.js'
import { db } from '../database/init.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'))
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|zip/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype) || file.mimetype === 'application/zip'
    
    if (extname && mimetype) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and ZIP files are allowed.'))
    }
  }
})

// All routes require authentication
router.use(authenticate)
router.use(authorize('student'))

// Helper function to get student's group
const getStudentGroup = (userId, callback) => {
  db.get(
    'SELECT s.groupId, g.name as groupName FROM students s JOIN groups g ON g.id = s.groupId WHERE s.userId = ?',
    [userId],
    callback
  )
}

// Dashboard stats
router.get('/dashboard/stats', (req, res) => {
  getStudentGroup(req.user.id, (err, group) => {
    if (err || !group) {
      return res.status(500).json({ message: 'Group not found' })
    }
    
    db.get(
      `SELECT 
        (SELECT status FROM proposals WHERE groupId = ? ORDER BY id DESC LIMIT 1) as proposalStatus,
        (SELECT status FROM srs WHERE groupId = ? ORDER BY id DESC LIMIT 1) as srsStatus,
        (SELECT COUNT(*) FROM meetings WHERE groupId = ?) as meetingsCount,
        0 as unreadMessages`,
      [group.groupId, group.groupId, group.groupId],
      (err, row) => {
        if (err) {
          return res.status(500).json({ message: 'Database error' })
        }
        res.json({
          proposalStatus: row.proposalStatus || 'pending',
          srsStatus: row.srsStatus || 'pending',
          meetingsCount: row.meetingsCount || 0,
          unreadMessages: row.unreadMessages || 0
        })
      }
    )
  })
})

// Get group info
router.get('/group', (req, res) => {
  getStudentGroup(req.user.id, (err, group) => {
    if (err || !group) {
      return res.status(500).json({ message: 'Group not found' })
    }
    
    // Get group members
    db.all(
      `SELECT u.id, u.name, u.enrollmentId, u.email 
       FROM students s 
       JOIN users u ON u.id = s.userId 
       WHERE s.groupId = ?`,
      [group.groupId],
      (err, members) => {
        if (err) {
          return res.status(500).json({ message: 'Database error' })
        }
        res.json({
          id: group.groupId,
          name: group.groupName,
          members: members
        })
      }
    )
  })
})

// Proposals
router.get('/proposals', (req, res) => {
  getStudentGroup(req.user.id, (err, group) => {
    if (err || !group) {
      return res.status(500).json({ message: 'Group not found' })
    }
    
    db.all(
      `SELECT * FROM proposals WHERE groupId = ? ORDER BY id DESC`,
      [group.groupId],
      (err, rows) => {
        if (err) {
          return res.status(500).json({ message: 'Database error' })
        }
        res.json(rows)
      }
    )
  })
})

router.post('/proposals', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' })
  }

  getStudentGroup(req.user.id, (err, group) => {
    if (err || !group) {
      return res.status(500).json({ message: 'Group not found' })
    }

    db.run(
      'INSERT INTO proposals (groupId, filePath, status) VALUES (?, ?, ?)',
      [group.groupId, req.file.filename, 'pending'],
      function(err) {
        if (err) {
          return res.status(500).json({ message: 'Database error' })
        }
        res.json({ id: this.lastID, message: 'Proposal uploaded successfully' })
      }
    )
  })
})

// SRS
router.get('/srs', (req, res) => {
  getStudentGroup(req.user.id, (err, group) => {
    if (err || !group) {
      return res.status(500).json({ message: 'Group not found' })
    }
    
    db.get(
      `SELECT * FROM srs WHERE groupId = ? ORDER BY id DESC LIMIT 1`,
      [group.groupId],
      (err, row) => {
        if (err) {
          return res.status(500).json({ message: 'Database error' })
        }
        if (!row) {
          return res.status(404).json({ message: 'SRS not found' })
        }
        res.json(row)
      }
    )
  })
})

router.post('/srs', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' })
  }

  getStudentGroup(req.user.id, (err, group) => {
    if (err || !group) {
      return res.status(500).json({ message: 'Group not found' })
    }

    db.run(
      'INSERT INTO srs (groupId, filePath, status) VALUES (?, ?, ?)',
      [group.groupId, req.file.filename, 'pending'],
      function(err) {
        if (err) {
          return res.status(500).json({ message: 'Database error' })
        }
        res.json({ id: this.lastID, message: 'SRS uploaded successfully' })
      }
    )
  })
})

// Progress reports
router.get('/progress', (req, res) => {
  getStudentGroup(req.user.id, (err, group) => {
    if (err || !group) {
      return res.status(500).json({ message: 'Group not found' })
    }
    
    db.all(
      `SELECT * FROM progress_reports WHERE groupId = ? ORDER BY id DESC`,
      [group.groupId],
      (err, rows) => {
        if (err) {
          return res.status(500).json({ message: 'Database error' })
        }
        res.json(rows)
      }
    )
  })
})

router.post('/progress', upload.single('file'), (req, res) => {
  if (!req.file || !req.body.month) {
    return res.status(400).json({ message: 'File and month are required' })
  }

  getStudentGroup(req.user.id, (err, group) => {
    if (err || !group) {
      return res.status(500).json({ message: 'Group not found' })
    }

    db.run(
      'INSERT INTO progress_reports (groupId, month, filePath) VALUES (?, ?, ?)',
      [group.groupId, req.body.month, req.file.filename],
      function(err) {
        if (err) {
          return res.status(500).json({ message: 'Database error' })
        }
        res.json({ id: this.lastID, message: 'Progress report uploaded successfully' })
      }
    )
  })
})

// Meetings
router.get('/meetings', (req, res) => {
  getStudentGroup(req.user.id, (err, group) => {
    if (err || !group) {
      return res.status(500).json({ message: 'Group not found' })
    }
    
    db.all(
      `SELECT * FROM meetings WHERE groupId = ? ORDER BY date DESC`,
      [group.groupId],
      (err, rows) => {
        if (err) {
          return res.status(500).json({ message: 'Database error' })
        }
        res.json(rows)
      }
    )
  })
})

router.post('/meetings/request', (req, res) => {
  const { date, time, agenda } = req.body

  getStudentGroup(req.user.id, (err, group) => {
    if (err || !group) {
      return res.status(500).json({ message: 'Group not found' })
    }
    
    // Get supervisor from group
    db.get('SELECT supervisorId FROM groups WHERE id = ?', [group.groupId], (err, groupData) => {
      if (err || !groupData) {
        return res.status(500).json({ message: 'Supervisor not found' })
      }

      db.run(
        'INSERT INTO meetings (groupId, supervisorId, date, time, agenda, status) VALUES (?, ?, ?, ?, ?, ?)',
        [group.groupId, groupData.supervisorId, date, time, agenda, 'pending'],
        function(err) {
          if (err) {
            return res.status(500).json({ message: 'Database error' })
          }
          res.json({ id: this.lastID, message: 'Meeting request sent successfully' })
        }
      )
    })
  })
})

// Chat
router.get('/supervisor', (req, res) => {
  getStudentGroup(req.user.id, (err, group) => {
    if (err || !group) {
      return res.status(500).json({ message: 'Group not found' })
    }
    
    db.get(
      `SELECT u.id, u.name, u.email FROM users u
       JOIN supervisors s ON s.userId = u.id
       JOIN groups g ON g.supervisorId = s.id
       WHERE g.id = ?`,
      [group.groupId],
      (err, row) => {
        if (err) {
          return res.status(500).json({ message: 'Database error' })
        }
        res.json(row || {})
      }
    )
  })
})

router.get('/chat/messages', (req, res) => {
  getStudentGroup(req.user.id, (err, group) => {
    if (err || !group) {
      return res.status(500).json({ message: 'Group not found' })
    }
    
    db.all(
      `SELECT cm.*, 
       CASE WHEN cm.senderRole = 'student' THEN 'student' ELSE 'supervisor' END as sender
       FROM chat_messages cm
       WHERE cm.groupId = ?
       ORDER BY cm.createdAt ASC`,
      [group.groupId],
      (err, rows) => {
        if (err) {
          return res.status(500).json({ message: 'Database error' })
        }
        // Map sender based on current user
        const messages = rows.map(msg => ({
          ...msg,
          sender: msg.senderId === req.user.id ? 'student' : msg.senderRole
        }))
        res.json(messages)
      }
    )
  })
})

router.post('/chat/messages', (req, res) => {
  const { message } = req.body

  getStudentGroup(req.user.id, (err, group) => {
    if (err || !group) {
      return res.status(500).json({ message: 'Group not found' })
    }

    db.run(
      'INSERT INTO chat_messages (groupId, senderId, senderRole, message) VALUES (?, ?, ?, ?)',
      [group.groupId, req.user.id, 'student', message],
      function(err) {
        if (err) {
          return res.status(500).json({ message: 'Database error' })
        }
        res.json({ id: this.lastID, message: 'Message sent successfully' })
      }
    )
  })
})

// Marks
router.get('/marks', (req, res) => {
  getStudentGroup(req.user.id, (err, group) => {
    if (err || !group) {
      return res.status(500).json({ message: 'Group not found' })
    }
    
    db.get(
      `SELECT e.*, em.marks as proposalDefense, em2.marks as midterm, em3.marks as final
       FROM evaluations e
       LEFT JOIN evaluation_marks em ON em.evaluationId = e.id AND e.type = 'proposal'
       LEFT JOIN evaluation_marks em2 ON em2.evaluationId = e.id AND e.type = 'midterm'
       LEFT JOIN evaluation_marks em3 ON em3.evaluationId = e.id AND e.type = 'final'
       WHERE e.groupId = ?
       AND e.status = 'published'
       LIMIT 1`,
      [group.groupId],
      (err, row) => {
        if (err) {
          return res.status(500).json({ message: 'Database error' })
        }
        if (!row) {
          return res.status(404).json({ message: 'Marks not available' })
        }
        res.json(row)
      }
    )
  })
})

export default router
