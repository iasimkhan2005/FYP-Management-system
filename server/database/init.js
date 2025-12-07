import sqlite3 from 'sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'
import bcrypt from 'bcryptjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dbPath = path.join(__dirname, '../../fyp.db')

export const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err)
  } else {
    console.log('Connected to SQLite database')
  }
})

export const initDatabase = async () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Users table
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        enrollmentId TEXT UNIQUE,
        email TEXT UNIQUE,
        password TEXT,
        name TEXT,
        role TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )`)

      // Groups table
      db.run(`CREATE TABLE IF NOT EXISTS groups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        supervisorId INTEGER,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (supervisorId) REFERENCES supervisors(id)
      )`)

      // Students table
      db.run(`CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        enrollmentId TEXT UNIQUE,
        groupId INTEGER,
        FOREIGN KEY (userId) REFERENCES users(id),
        FOREIGN KEY (groupId) REFERENCES groups(id)
      )`)

      // Supervisors table
      db.run(`CREATE TABLE IF NOT EXISTS supervisors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        FOREIGN KEY (userId) REFERENCES users(id)
      )`)

      // Proposals table
      db.run(`CREATE TABLE IF NOT EXISTS proposals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        groupId INTEGER,
        filePath TEXT,
        status TEXT DEFAULT 'pending',
        comments TEXT,
        submittedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        reviewedAt DATETIME,
        FOREIGN KEY (groupId) REFERENCES groups(id)
      )`)

      // SRS table
      db.run(`CREATE TABLE IF NOT EXISTS srs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        groupId INTEGER,
        filePath TEXT,
        status TEXT DEFAULT 'pending',
        comments TEXT,
        submittedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        reviewedAt DATETIME,
        FOREIGN KEY (groupId) REFERENCES groups(id)
      )`)

      // Progress reports table
      db.run(`CREATE TABLE IF NOT EXISTS progress_reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        groupId INTEGER,
        month TEXT,
        filePath TEXT,
        submittedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (groupId) REFERENCES groups(id)
      )`)

      // Meetings table
      db.run(`CREATE TABLE IF NOT EXISTS meetings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        groupId INTEGER,
        supervisorId INTEGER,
        date DATE,
        time TIME,
        agenda TEXT,
        status TEXT DEFAULT 'pending',
        notes TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (groupId) REFERENCES groups(id),
        FOREIGN KEY (supervisorId) REFERENCES supervisors(id)
      )`)

      // Chat messages table
      db.run(`CREATE TABLE IF NOT EXISTS chat_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        groupId INTEGER,
        senderId INTEGER,
        senderRole TEXT,
        message TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (groupId) REFERENCES groups(id),
        FOREIGN KEY (senderId) REFERENCES users(id)
      )`)

      // Panels table
      db.run(`CREATE TABLE IF NOT EXISTS panels (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )`)

      // Panel members table
      db.run(`CREATE TABLE IF NOT EXISTS panel_members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        panelId INTEGER,
        userId INTEGER,
        FOREIGN KEY (panelId) REFERENCES panels(id),
        FOREIGN KEY (userId) REFERENCES users(id)
      )`)

      // Schedules table
      db.run(`CREATE TABLE IF NOT EXISTS schedules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        groupId INTEGER,
        panelId INTEGER,
        type TEXT,
        date DATE,
        time TIME,
        venue TEXT,
        status TEXT DEFAULT 'scheduled',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (groupId) REFERENCES groups(id),
        FOREIGN KEY (panelId) REFERENCES panels(id)
      )`)

      // Evaluations table
      db.run(`CREATE TABLE IF NOT EXISTS evaluations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        scheduleId INTEGER,
        groupId INTEGER,
        panelId INTEGER,
        type TEXT,
        status TEXT DEFAULT 'pending',
        totalMarks REAL,
        publishedAt DATETIME,
        FOREIGN KEY (scheduleId) REFERENCES schedules(id),
        FOREIGN KEY (groupId) REFERENCES groups(id),
        FOREIGN KEY (panelId) REFERENCES panels(id)
      )`)

      // Evaluation marks table
      db.run(`CREATE TABLE IF NOT EXISTS evaluation_marks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        evaluationId INTEGER,
        panelMemberId INTEGER,
        marks REAL,
        comments TEXT,
        submittedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (evaluationId) REFERENCES evaluations(id),
        FOREIGN KEY (panelMemberId) REFERENCES users(id)
      )`)

      // Notifications table
      db.run(`CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        message TEXT,
        type TEXT,
        read INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id)
      )`)

      // Insert demo data
      db.get('SELECT COUNT(*) as count FROM users', async (err, row) => {
        if (err) {
          console.error('Error checking users:', err)
          reject(err)
          return
        }

        console.log('Current user count:', row.count)
        
        if (row.count === 0) {
          console.log('Initializing demo data...')
          const hashedPassword = await bcrypt.hash('password123', 10)
          
          // Insert users sequentially
          try {
            // Insert coordinator first (needed for login)
            db.run(
              'INSERT INTO users (enrollmentId, email, password, name, role) VALUES (?, ?, ?, ?, ?)',
              ['COORD001', 'coordinator@example.com', hashedPassword, 'Coordinator', 'coordinator'],
              function(err) {
                if (err) {
                  console.error('Error inserting coordinator:', err)
                  reject(err)
                  return
                }
                
                // Insert supervisor
                db.run(
                  'INSERT INTO users (enrollmentId, email, password, name, role) VALUES (?, ?, ?, ?, ?)',
                  ['SUP001', 'supervisor1@example.com', hashedPassword, 'Dr. Jane Supervisor', 'supervisor'],
                  function(err) {
                    if (err) {
                      console.error('Error inserting supervisor:', err)
                      reject(err)
                      return
                    }
                    const supervisorUserId = this.lastID
                    
                    db.run('INSERT INTO supervisors (userId) VALUES (?)', [supervisorUserId], function(err) {
                      if (err) {
                        console.error('Error creating supervisor record:', err)
                        reject(err)
                        return
                      }
                      const supervisorId = this.lastID
                      
                      // Insert students first (without groups)
                      db.run(
                        'INSERT INTO users (enrollmentId, email, password, name, role) VALUES (?, ?, ?, ?, ?)',
                        ['ENR001', 'student1@example.com', hashedPassword, 'John Student', 'student'],
                        function(err) {
                          if (err) {
                            console.error('Error inserting student 1:', err)
                            reject(err)
                            return
                          }
                          const student1UserId = this.lastID
                          db.run('INSERT INTO students (userId, enrollmentId) VALUES (?, ?)', 
                            [student1UserId, 'ENR001'])
                          
                          db.run(
                            'INSERT INTO users (enrollmentId, email, password, name, role) VALUES (?, ?, ?, ?, ?)',
                            ['ENR002', 'student2@example.com', hashedPassword, 'Jane Student', 'student'],
                            function(err) {
                              if (err) {
                                console.error('Error inserting student 2:', err)
                                reject(err)
                                return
                              }
                              const student2UserId = this.lastID
                              db.run('INSERT INTO students (userId, enrollmentId) VALUES (?, ?)', 
                                [student2UserId, 'ENR002'])
                              
                              db.run(
                                'INSERT INTO users (enrollmentId, email, password, name, role) VALUES (?, ?, ?, ?, ?)',
                                ['ENR003', 'student3@example.com', hashedPassword, 'Bob Student', 'student'],
                                function(err) {
                                  if (err) {
                                    console.error('Error inserting student 3:', err)
                                    reject(err)
                                    return
                                  }
                                  const student3UserId = this.lastID
                                  db.run('INSERT INTO students (userId, enrollmentId) VALUES (?, ?)', 
                                    [student3UserId, 'ENR003'])
                                  
                                  db.run(
                                    'INSERT INTO users (enrollmentId, email, password, name, role) VALUES (?, ?, ?, ?, ?)',
                                    ['ENR004', 'student4@example.com', hashedPassword, 'Alice Student', 'student'],
                                    function(err) {
                                      if (err) {
                                        console.error('Error inserting student 4:', err)
                                        reject(err)
                                        return
                                      }
                                      const student4UserId = this.lastID
                                      db.run('INSERT INTO students (userId, enrollmentId) VALUES (?, ?)', 
                                        [student4UserId, 'ENR004'])
                                      
                                      // Insert panel members
                                      db.run(
                                        'INSERT INTO users (enrollmentId, email, password, name, role) VALUES (?, ?, ?, ?, ?)',
                                        ['PANEL001', 'panel1@example.com', hashedPassword, 'Panel Member 1', 'panel'])
                                      db.run(
                                        'INSERT INTO users (enrollmentId, email, password, name, role) VALUES (?, ?, ?, ?, ?)',
                                        ['PANEL002', 'panel2@example.com', hashedPassword, 'Panel Member 2', 'panel'],
                                        function(err) {
                                          if (err) {
                                            console.error('Error inserting panel member:', err)
                                          }
                                          console.log('Demo data initialization complete!')
                                          console.log('Students and supervisors are ready. Use coordinator portal to create groups.')
                                          resolve()
                                        })
                                    })
                                })
                            })
                        })
                    })
                  })
              })
          } catch (error) {
            reject(error)
          }
        } else {
          console.log('Database already has data. Skipping demo data initialization.')
          resolve()
        }
      })
    })
  })
}

