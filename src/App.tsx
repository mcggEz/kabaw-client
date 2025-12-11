import { useState, useEffect, useRef } from 'react'
import logoImage from './assets/logokabaw.png'

interface Message {
  type: string
  username: string
  user_id?: string
  content: string
  timestamp: string
  channel: string
}

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

const App = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [username, setUsername] = useState('')
  const [channel, setChannel] = useState('general')
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected')
  const [currentUserID, setCurrentUserID] = useState<string>('')
  const [error, setError] = useState<string>('')
  const wsRef = useRef<WebSocket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const connectWebSocket = () => {
    if (!username.trim()) {
      setError('Please enter a username')
      return
    }

    setConnectionStatus('connecting')
    setError('')

    const wsUrl = `ws://localhost:8080/ws?username=${encodeURIComponent(username)}&channel=${encodeURIComponent(channel)}`
    console.log('[FRONTEND-CONNECT] Attempting to connect to:', wsUrl)

    try {
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        console.log(`[FRONTEND-CONNECT] Connected to WebSocket as ${username} in channel ${channel}`)
        setConnectionStatus('connected')
        setError('')
      }

      ws.onmessage = (event) => {
        try {
          const message: Message = JSON.parse(event.data)
          console.log('[FRONTEND-MESSAGE]', JSON.stringify(message, null, 2))
          
          // Handle user_connected message to get user ID
          if (message.type === 'user_connected' && message.user_id) {
            console.log(`[FRONTEND-USER-ID] Assigned user ID: ${message.user_id}`)
            setCurrentUserID(message.user_id)
          }

          setMessages((prev) => [...prev, message])
        } catch (err) {
          console.error('[FRONTEND-ERROR] Failed to parse message:', err)
        }
      }

      ws.onerror = (event) => {
        console.error('[FRONTEND-ERROR] WebSocket error:', event)
        setConnectionStatus('error')
        setError('Connection error. Make sure the server is running on port 8080.')
      }

      ws.onclose = (event) => {
        console.log(`[FRONTEND-DISCONNECT] Connection closed. Code: ${event.code}, Reason: ${event.reason}`)
        setConnectionStatus('disconnected')
        setCurrentUserID('')
        if (event.code !== 1000) {
          setError('Connection closed unexpectedly')
        }
      }
    } catch (err) {
      console.error('[FRONTEND-ERROR] Failed to create WebSocket:', err)
      setConnectionStatus('error')
      setError('Failed to create WebSocket connection')
    }
  }

  const disconnectWebSocket = () => {
    if (wsRef.current) {
      console.log('[FRONTEND-DISCONNECT] User initiated disconnect')
      wsRef.current.close(1000, 'User disconnected')
      wsRef.current = null
      setConnectionStatus('disconnected')
      setCurrentUserID('')
      setMessages([])
    }
  }

  const sendMessage = () => {
    if (!inputMessage.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return
    }

    const message = {
      type: 'message',
      content: inputMessage.trim(),
    }

    console.log('[FRONTEND-SEND]', JSON.stringify(message, null, 2))
    wsRef.current.send(JSON.stringify(message))
    setInputMessage('')
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    } catch {
      return ''
    }
  }

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'bg-[#5A9B6F]'
      case 'connecting':
        return 'bg-yellow-500'
      case 'error':
        return 'bg-red-500'
      default:
        return 'bg-gray-400'
    }
  }

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected'
      case 'connecting':
        return 'Connecting...'
      case 'error':
        return 'Error'
      default:
        return 'Disconnected'
    }
  }

  const getStatusBgColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'bg-green-50 text-[#5A9B6F] border-green-200'
      case 'connecting':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200'
      case 'error':
        return 'bg-red-50 text-red-800 border-red-200'
      default:
        return 'bg-gray-50 text-gray-800 border-gray-200'
    }
  }

  const isOwnMessage = (message: Message) => {
    return message.user_id === currentUserID && message.type === 'message'
  }

  return (
    <div className="h-screen flex flex-col bg-[#faf9f6] font-sans overflow-hidden">
      {/* Header with Teal Accents */}
      <div className="bg-[#faf9f6] text-gray-900 relative overflow-hidden flex-shrink-0 border-b border-gray-200">
        <div className="relative max-w-6xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3">
          {/* Mobile: 2 lines layout */}
          <div className="flex flex-col sm:hidden gap-2">
            {/* Line 1: Logo and Status/Disconnect */}
            <div className="flex items-center justify-between gap-2">
              <img 
                src={logoImage} 
                alt="Kabaw Chat" 
                className="h-7 w-auto object-contain"
              />
              <div className="flex items-center gap-2">
                <div className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${getStatusBgColor()}`}>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor()}`}></div>
                    <span>{getStatusText()}</span>
                  </div>
                </div>
                {connectionStatus === 'connected' && (
                  <button
                    onClick={disconnectWebSocket}
                    className="px-3 py-1.5 bg-gray-700 hover:bg-gray-800 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer shadow-sm hover:shadow-md whitespace-nowrap"
                  >
                    Disconnect
                  </button>
                )}
              </div>
            </div>
            {/* Line 2: User ID */}
            {currentUserID && (
              <div className="text-xs">
                <span className="text-gray-600">User ID: </span>
                  <span className="text-[#5A9B6F] font-mono text-[10px]">{currentUserID}</span>
              </div>
            )}
          </div>
          
          {/* Desktop: Original single line layout */}
          <div className="hidden sm:flex items-center justify-between flex-wrap gap-3">
            <div className="flex flex-col">
              <img 
                src={logoImage} 
                alt="Kabaw Chat" 
                className="h-8 w-auto object-contain mb-0.5"
              />
              <p className="text-xs text-gray-600">WebSocket Real-time Messaging</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {currentUserID && (
                <div className="text-sm">
                  <span className="text-gray-600">User ID: </span>
                  <span className="text-[#5A9B6F] font-mono text-xs">{currentUserID}</span>
                </div>
              )}
              <div className={`px-4 py-2 rounded-lg border text-sm font-semibold ${getStatusBgColor()}`}>
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor()}`}></div>
                  <span>{getStatusText()}</span>
                </div>
              </div>
              {connectionStatus === 'connected' && (
                <button
                  onClick={disconnectWebSocket}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer shadow-sm hover:shadow-md whitespace-nowrap"
                >
                  Disconnect
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area - Flex container */}
      <div className="flex-1 flex flex-col overflow-hidden max-w-4xl mx-auto w-full px-3 sm:px-4 py-3 sm:py-4">
        {/* Connection Form */}
        {connectionStatus === 'disconnected' && (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="w-full max-w-md">
              <div className="bg-white rounded-2xl p-8 border border-gray-200" style={{
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.1)'
              }}>
                <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Connect to Chat</h2>
                <p className="text-sm text-gray-600 mb-8 text-center">Enter your details to start chatting</p>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5A9B6F] focus:border-[#5A9B6F] focus:bg-white transition-all"
                      onKeyPress={(e) => e.key === 'Enter' && connectWebSocket()}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Channel</label>
                    <input
                      type="text"
                      value={channel}
                      onChange={(e) => setChannel(e.target.value)}
                      placeholder="general"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5A9B6F] focus:border-[#5A9B6F] focus:bg-white transition-all"
                      onKeyPress={(e) => e.key === 'Enter' && connectWebSocket()}
                    />
                  </div>
                  <button
                    onClick={connectWebSocket}
                    className="w-full px-6 py-3.5 bg-[#5A9B6F] hover:bg-[#3D7351] text-white rounded-xl text-base font-semibold transition-all cursor-pointer shadow-sm hover:shadow-md"
                  >
                    Connect
                  </button>
                </div>
                {error && (
                  <div className="mt-5 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Messages Container - Takes remaining space - Only show when connected */}
        {connectionStatus === 'connected' && (
        <div className="flex-1 flex flex-col bg-white rounded-lg sm:rounded-xl border border-gray-200 overflow-hidden min-h-0" style={{
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.1)'
        }}>
          {/* Messages Area - Scrollable */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 bg-white min-h-0">
            {messages.length === 0 && connectionStatus === 'connected' && (
              <div className="text-center text-gray-500 py-12">
                <p className="text-lg text-gray-600">No messages yet. Start chatting!</p>
              </div>
            )}
            {messages.map((message, index) => (
              <div
                key={index}
                className={`mb-2 sm:mb-3 ${
                  message.type === 'system'
                    ? 'flex justify-center'
                    : isOwnMessage(message)
                    ? 'flex justify-end'
                    : 'flex justify-start'
                }`}
              >
                {message.type === 'system' ? (
                  <div className="inline-block px-4 py-2.5 sm:px-5 sm:py-3 bg-white rounded-lg sm:rounded-xl border border-gray-200 max-w-[90%] sm:max-w-md">
                    <div className="mb-2 text-center">
                      {/* Username and Time on same line */}
                      <div className="flex items-center justify-between mb-0">
                        <span className="font-bold text-sm sm:text-base text-gray-900">
                          {message.username}
                        </span>
                        <span className="text-xs sm:text-sm text-gray-600">{formatTimestamp(message.timestamp)}</span>
                      </div>
                      {/* User ID - Smaller and closer to username */}
                      {message.user_id && (
                        <div className="-mt-0.5 mb-1">
                          <span className="text-[10px] sm:text-xs text-gray-400 font-mono tracking-tight">
                            {message.user_id}
                          </span>
                        </div>
                      )}
                      {/* Channel tag below ID */}
                      {message.channel && (
                        <div>
                            <span className="text-[10px] sm:text-xs text-white bg-[#5A9B6F] px-1.5 sm:px-2 py-0.5 rounded-full font-medium shadow-sm">
                            #{message.channel}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-sm sm:text-base text-gray-800 leading-relaxed text-center mt-2">
                        {message.content}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className={`inline-block max-w-[85%] sm:max-w-[75%] ${isOwnMessage(message) ? 'ml-auto' : ''}`}>
                    <div className={`px-4 py-2.5 sm:px-5 sm:py-3 rounded-lg sm:rounded-xl text-left ${
                      isOwnMessage(message)
                        ? 'bg-[#5A9B6F] text-white'
                        : 'bg-white border border-gray-200 text-gray-800'
                    }`}>
                      {/* Metadata - Username and Time on top, ID and Channel below */}
                      <div className="mb-2">
                        {/* Username and Timestamp on same line - spaced apart */}
                        <div className="flex items-center justify-between mb-0">
                          <span className={`font-bold text-sm sm:text-base ${
                            isOwnMessage(message) ? 'text-white' : 'text-gray-900'
                          }`}>
                            {message.username}
                          </span>
                          <span className={`text-xs sm:text-sm ${
                            isOwnMessage(message) ? 'text-white/90' : 'text-gray-600'
                          }`}>
                            {formatTimestamp(message.timestamp)}
                          </span>
                        </div>
                        {/* User ID - Smaller and closer to username */}
                        {message.user_id && (
                          <div className="-mt-0.5 mb-1">
                            <span className={`text-[10px] sm:text-xs font-mono tracking-tight ${
                              isOwnMessage(message) ? 'text-white/60' : 'text-gray-400'
                            }`}>
                              {message.user_id}
                            </span>
                          </div>
                        )}
                        {/* Channel tag below ID */}
                        {message.channel && (
                          <div>
                              <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-medium ${
                                isOwnMessage(message)
                                  ? 'bg-[#3D7351] text-white shadow-sm'
                                  : 'bg-[#5A9B6F] text-white shadow-sm'
                              }`}>
                              #{message.channel}
                            </span>
                          </div>
                        )}
                      </div>
                      {/* Message Content - Clear Separation */}
                      <div className={`pt-2 border-t ${
                        isOwnMessage(message) ? 'border-white/25' : 'border-gray-200'
                      }`}>
                        <p className={`text-sm sm:text-base leading-relaxed mt-2 ${
                          isOwnMessage(message) ? 'text-white' : 'text-gray-700'
                        }`}>
                          {message.content}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area - Fixed at bottom */}
          {connectionStatus === 'connected' && (
            <div className="p-2 sm:p-3 md:p-4 bg-white border-t border-gray-200 flex-shrink-0">
              <div className="flex gap-2 sm:gap-3">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message... (Press Enter to send)"
                  className="flex-1 px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-300 rounded-lg sm:rounded-xl text-sm sm:text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5A9B6F] focus:border-[#5A9B6F] transition-all shadow-sm"
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim()}
                  className="px-4 py-2 sm:px-5 sm:py-2.5 bg-[#5A9B6F] hover:bg-[#3D7351] disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg sm:rounded-xl text-sm sm:text-base font-medium transition-colors cursor-pointer shadow-sm hover:shadow-md whitespace-nowrap"
                >
                  Send
                </button>
              </div>
            </div>
          )}
        </div>
        )}

        {/* Error Display */}
        {error && connectionStatus !== 'disconnected' && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm flex-shrink-0">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
