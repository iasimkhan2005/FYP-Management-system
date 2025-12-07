# FYP Management System

A comprehensive web application for managing Final Year Projects (FYP) with separate portals for Students, Supervisors, Coordinators, and Panel Members.

## Features

### Student Portal
- Upload proposals and SRS documents
- Submit monthly progress reports
- Request meetings with supervisors
- Chat with supervisors
- View evaluation marks
- Track proposal and SRS status

### Supervisor Portal
- Review and approve/reject proposals and SRS
- Schedule and manage meetings
- Chat with students
- Review progress reports
- Add meeting notes

### Coordinator Portal
- View all students and supervisors
- Schedule proposal defense, midterm, and final evaluations
- Create and manage evaluation panels
- Compile and publish marks
- Manage panel assignments

### Panel Portal
- View scheduled evaluations
- Submit evaluation marks
- Provide comments on presentations

## Tech Stack

- **Frontend**: React 18, React Router, Axios, React Query
- **Backend**: Node.js, Express.js
- **Database**: SQLite
- **Authentication**: JWT
- **File Upload**: Multer

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create uploads directory:
```bash
mkdir uploads
```

3. Start the development server:
```bash
npm run dev:full
```

This will start both the frontend (port 3000) and backend (port 5000) servers.

Or run them separately:
```bash
# Frontend only
npm run dev

# Backend only
npm run server
```

## Demo Credentials

### Student
- Enrollment ID: `ENR001`
- Password: `password123`

### Supervisor
- Email/ID: `SUP001`
- Password: `password123`

### Coordinator
- Email/ID: `COORD001`
- Password: `password123`

### Panel Member
- Email/ID: `PANEL001`
- Password: `password123`

## Project Structure

```
fyp-management-system/
├── src/
│   ├── components/       # Reusable components
│   ├── contexts/         # React contexts (Auth, Notifications)
│   ├── pages/            # Page components
│   │   ├── student/      # Student portal pages
│   │   ├── supervisor/   # Supervisor portal pages
│   │   ├── coordinator/  # Coordinator portal pages
│   │   └── panel/        # Panel portal pages
│   └── utils/            # Utility functions
├── server/
│   ├── routes/           # API routes
│   ├── middleware/       # Express middleware
│   └── database/         # Database initialization
└── uploads/              # Uploaded files storage
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Students
- `GET /api/students/dashboard/stats` - Dashboard statistics
- `GET /api/students/proposals` - Get proposals
- `POST /api/students/proposals` - Upload proposal
- `GET /api/students/srs` - Get SRS
- `POST /api/students/srs` - Upload SRS
- `GET /api/students/progress` - Get progress reports
- `POST /api/students/progress` - Upload progress report
- `GET /api/students/meetings` - Get meetings
- `POST /api/students/meetings/request` - Request meeting
- `GET /api/students/chat/messages` - Get chat messages
- `POST /api/students/chat/messages` - Send message
- `GET /api/students/marks` - Get marks

### Supervisors
- `GET /api/supervisors/dashboard/stats` - Dashboard statistics
- `GET /api/supervisors/proposals` - Get proposals to review
- `POST /api/supervisors/proposals/:id/review` - Review proposal
- `GET /api/supervisors/srs` - Get SRS to review
- `POST /api/supervisors/srs/:id/review` - Review SRS
- `GET /api/supervisors/meetings` - Get meetings
- `POST /api/supervisors/meetings/:id/confirm` - Confirm meeting
- `POST /api/supervisors/meetings/:id/notes` - Add meeting notes
- `GET /api/supervisors/chat/messages/:studentId` - Get chat messages
- `POST /api/supervisors/chat/messages` - Send message
- `GET /api/supervisors/progress` - Get progress reports

### Coordinators
- `GET /api/coordinators/dashboard/stats` - Dashboard statistics
- `GET /api/coordinators/students` - Get all students
- `GET /api/coordinators/supervisors` - Get all supervisors
- `GET /api/coordinators/panels` - Get all panels
- `POST /api/coordinators/panels` - Create panel
- `GET /api/coordinators/schedules` - Get schedules
- `POST /api/coordinators/schedules` - Create schedule
- `GET /api/coordinators/evaluations` - Get evaluations
- `POST /api/coordinators/evaluations/:id/publish` - Publish marks

### Panels
- `GET /api/panels/dashboard/stats` - Dashboard statistics
- `GET /api/panels/evaluations` - Get evaluations
- `POST /api/panels/evaluations/:id/marks` - Submit marks

### Notifications
- `GET /api/notifications` - Get notifications
- `PATCH /api/notifications/:id/read` - Mark as read
- `PATCH /api/notifications/read-all` - Mark all as read

## File Upload

- Supported formats: PDF, DOC, DOCX, ZIP
- Maximum file size: 20MB
- Files are stored in the `uploads/` directory

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- File type and size validation
- SQL injection protection (parameterized queries)

## Future Enhancements

- Email notifications
- Real-time chat with WebSockets
- Document version control
- AI plagiarism checking
- Mobile app
- Advanced reporting and analytics

## License

MIT

