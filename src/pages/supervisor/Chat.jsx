import { useState, useEffect, useRef } from 'react'
import { toast } from 'react-toastify'
import api from '../../utils/api'
import { formatDate } from '../../utils/auth'
import '../../pages/student/Chat.css'

const SupervisorChat = () => {
  const [groups, setGroups] = useState([])
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    fetchGroups()
  }, [])

  useEffect(() => {
    if (selectedGroup) {
      fetchMessages()
      const interval = setInterval(fetchMessages, 2000)
      return () => clearInterval(interval)
    }
  }, [selectedGroup])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchGroups = async () => {
    try {
      const response = await api.get('/supervisors/groups')
      setGroups(response.data)
      if (response.data.length > 0 && !selectedGroup) {
        setSelectedGroup(response.data[0])
      }
    } catch (error) {
      console.error('Error fetching groups:', error)
    }
  }

  const fetchMessages = async () => {
    if (!selectedGroup) return
    try {
      const response = await api.get(`/supervisors/chat/messages/${selectedGroup.id}`)
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
    if (!newMessage.trim() || !selectedGroup) return

    try {
      await api.post('/supervisors/chat/messages', {
        groupId: selectedGroup.id,
        message: newMessage
      })
      setNewMessage('')
      fetchMessages()
    } catch (error) {
      toast.error('Failed to send message')
    }
  }

  return (
    <div className="chat-container">
      <h1>Chat with Students</h1>
      
      <div style={{ display: 'flex', gap: '20px', height: 'calc(100vh - 250px)' }}>
        <div style={{ width: '250px', background: 'white', borderRadius: '8px', padding: '16px', overflowY: 'auto' }}>
          <h3>Groups</h3>
          {groups.map((group) => (
            <div
              key={group.id}
              onClick={() => setSelectedGroup(group)}
              style={{
                padding: '12px',
                marginBottom: '8px',
                borderRadius: '6px',
                cursor: 'pointer',
                background: selectedGroup?.id === group.id ? '#eff6ff' : '#f9fafb'
              }}
            >
              <strong>{group.name}</strong>
              <br />
              <small>{group.memberCount} members</small>
            </div>
          ))}
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {selectedGroup && (
            <>
              <div className="chat-header">
                <p>
                  <strong>Group:</strong> {selectedGroup.name}
                  <br />
                  <small>Members: {selectedGroup.members?.map(m => m.name).join(', ')}</small>
                </p>
              </div>

              <div className="chat-messages">
                {messages.length === 0 ? (
                  <p className="no-messages">No messages yet. Start a conversation!</p>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`message ${msg.sender === 'supervisor' ? 'sent' : 'received'}`}
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
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default SupervisorChat

