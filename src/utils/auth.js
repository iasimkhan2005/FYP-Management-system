import { jwtDecode } from 'jwt-decode'

export const decodeToken = (token) => {
  try {
    return jwtDecode(token)
  } catch (error) {
    throw new Error('Invalid token')
  }
}

export const getRolePath = (role) => {
  const rolePaths = {
    student: '/student/dashboard',
    supervisor: '/supervisor/dashboard',
    coordinator: '/coordinator/dashboard',
    panel: '/panel/dashboard',
    hod: '/coordinator/dashboard'
  }
  return rolePaths[role] || '/login'
}

export const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

export const validateFileType = (file, allowedTypes = ['pdf', 'doc', 'docx', 'zip']) => {
  const extension = file.name.split('.').pop().toLowerCase()
  return allowedTypes.includes(extension)
}

export const validateFileSize = (file, maxSizeMB = 20) => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  return file.size <= maxSizeBytes
}

