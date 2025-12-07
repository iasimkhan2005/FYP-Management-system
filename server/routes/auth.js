import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db } from '../database/init.js'

const router = express.Router()

router.post('/login', (req, res) => {
  const { enrollmentId, password, role } = req.body

  db.get(
    'SELECT * FROM users WHERE (enrollmentId = ? OR email = ?) AND role = ?',
    [enrollmentId, enrollmentId, role],
    async (err, user) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' })
      }

      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' })
      }

      const isValidPassword = await bcrypt.compare(password, user.password)
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' })
      }

      const token = jwt.sign(
        { id: user.id, role: user.role, email: user.email, name: user.name },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      )

      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      })
    }
  )
})

export default router

