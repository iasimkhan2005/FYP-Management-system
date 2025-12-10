import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AuthProvider } from './contexts/AuthContext'
import { NotificationProvider } from './contexts/NotificationContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'

// Auth Pages
import Login from './pages/Login'

// Student Pages
import StudentDashboard from './pages/student/Dashboard'
import StudentProposals from './pages/student/Proposals'
import StudentSRS from './pages/student/SRS'
import StudentProgress from './pages/student/Progress'
import StudentMeetings from './pages/student/Meetings'
import StudentChat from './pages/student/Chat'
import StudentMarks from './pages/student/Marks'

// Supervisor Pages
import SupervisorDashboard from './pages/supervisor/Dashboard'
import SupervisorProposals from './pages/supervisor/Proposals'
import SupervisorSRS from './pages/supervisor/SRS'
import SupervisorMeetings from './pages/supervisor/Meetings'
import SupervisorChat from './pages/supervisor/Chat'
import SupervisorProgress from './pages/supervisor/Progress'

// Coordinator Pages
import CoordinatorDashboard from './pages/coordinator/Dashboard'
import CoordinatorScheduling from './pages/coordinator/Scheduling'
import CoordinatorPanels from './pages/coordinator/Panels'
import CoordinatorMarks from './pages/coordinator/Marks'
import CoordinatorStudents from './pages/coordinator/Students'

// Panel Pages
import PanelDashboard from './pages/panel/Dashboard'
import PanelEvaluations from './pages/panel/Evaluations'

// HOD Pages
import HodDashboard from './pages/hod/Dashboard'
import HodMarks from './pages/hod/Marks'

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* Student Routes */}
            <Route
              path="/student/*"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <Layout>
                    <Routes>
                      <Route path="dashboard" element={<StudentDashboard />} />
                      <Route path="proposals" element={<StudentProposals />} />
                      <Route path="srs" element={<StudentSRS />} />
                      <Route path="progress" element={<StudentProgress />} />
                      <Route path="meetings" element={<StudentMeetings />} />
                      <Route path="chat" element={<StudentChat />} />
                      <Route path="marks" element={<StudentMarks />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Supervisor Routes */}
            <Route
              path="/supervisor/*"
              element={
                <ProtectedRoute allowedRoles={['supervisor']}>
                  <Layout>
                    <Routes>
                      <Route path="dashboard" element={<SupervisorDashboard />} />
                      <Route path="proposals" element={<SupervisorProposals />} />
                      <Route path="srs" element={<SupervisorSRS />} />
                      <Route path="meetings" element={<SupervisorMeetings />} />
                      <Route path="chat" element={<SupervisorChat />} />
                      <Route path="progress" element={<SupervisorProgress />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Coordinator Routes */}
            <Route
              path="/coordinator/*"
              element={
                <ProtectedRoute allowedRoles={['coordinator']}>
                  <Layout>
                    <Routes>
                      <Route path="dashboard" element={<CoordinatorDashboard />} />
                      <Route path="scheduling" element={<CoordinatorScheduling />} />
                      <Route path="panels" element={<CoordinatorPanels />} />
                      <Route path="marks" element={<CoordinatorMarks />} />
                      <Route path="students" element={<CoordinatorStudents />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Panel Routes */}
            <Route
              path="/panel/*"
              element={
                <ProtectedRoute allowedRoles={['panel']}>
                  <Layout>
                    <Routes>
                      <Route path="dashboard" element={<PanelDashboard />} />
                      <Route path="evaluations" element={<PanelEvaluations />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* HOD Routes */}
            <Route
              path="/hod/*"
              element={
                <ProtectedRoute allowedRoles={['hod']}>
                  <Layout>
                    <Routes>
                      <Route path="dashboard" element={<HodDashboard />} />
                      <Route path="marks" element={<HodMarks />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
          <ToastContainer position="top-right" autoClose={3000} />
        </NotificationProvider>
      </AuthProvider>
    </Router>
  )
}

export default App

