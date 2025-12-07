import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Login.css'

const Login = () => {
  const [formData, setFormData] = useState({
    enrollmentId: '',
    password: '',
    role: 'student'
  })
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await login(formData)
    if (result.success && result.path) {
      navigate(result.path)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>FYP Management System</h1>
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="student">Student</option>
              <option value="supervisor">Supervisor</option>
              <option value="coordinator">Coordinator</option>
              <option value="panel">Panel Member</option>
              <option value="hod">HOD</option>
            </select>
          </div>
          <div className="form-group">
            <label>
              {formData.role === 'student' ? 'Enrollment ID' : 'Email/ID'}
            </label>
            <input
              type="text"
              name="enrollmentId"
              value={formData.enrollmentId}
              onChange={handleChange}
              required
              placeholder={
                formData.role === 'student'
                  ? 'Enter Enrollment ID'
                  : 'Enter Email/ID'
              }
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter Password"
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block">
            Login
          </button>
        </form>
        <div className="login-info">
          <p>
            <strong>Demo Credentials:</strong>
          </p>
          <p>Student: ENR001 / password123</p>
          <p>Supervisor: SUP001 / password123</p>
          <p>Coordinator: COORD001 / password123</p>
        </div>
      </div>
    </div>
  )
}

export default Login

