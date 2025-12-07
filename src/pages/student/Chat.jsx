import { useState, useEffect, useRef } from 'react'
import { toast } from 'react-toastify'
import api from '../../utils/api'
import { formatDate } from '../../utils/auth'
import './Chat.css'

const StudentChat = () => {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [supervisor, setSupervisor] = useState(null)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    fetchChatData()
    // Poll for new messages every 2 seconds
    const interval = setInterval(fetchMessages, 2000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchChatData = async () => {
    try {
      const [supervisorRes, messagesRes] = await Promise.all([
        api.get('/students/supervisor'),
        api.get('/students/chat/messages')
      ])
      setSupervisor(supervisorRes.data)
      setMessages(messagesRes.data)
    } catch (error) {
      console.error('Error fetching chat data:', error)
    }
  }

  const fetchMessages = async () => {
    try {
      const response = await api.get('/students/chat/messages')
      setMessages(response.data)
    } catch (error) {
      // Silently fail for polling
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    try {
      await api.post('/students/chat/messages', { message: newMessage })
      setNewMessage('')
      fetchMessages()
    } catch (error) {
      toast.error('Failed to send message')
    }
  }

  return (
    <div className="chat-container">
      <h1>Chat with Supervisor</h1>
      {supervisor && (
        <div className="chat-header">
          <p>
            <strong>Supervisor:</strong> {supervisor.name} ({supervisor.email})
          </p>
        </div>
      )}

      <div className="chat-messages">
        {messages.length === 0 ? (
          <p className="no-messages">No messages yet. Start a conversation!</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`message ${msg.sender === 'student' ? 'sent' : 'received'}`}
            >
              <div className="message-content">
                <p>{msg.message}</p>
                <span className="message-time">
                  {formatDate(msg.createdAt)}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="chat-input-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="chat-input"
        />
        <button type="submit" className="btn btn-primary">
          Send
        </button>
      </form>
    </div>
  )
}

export default StudentChat

