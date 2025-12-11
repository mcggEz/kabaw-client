# Kabaw Chat - React Frontend Application

![Kabaw Logo](./src/assets/logokabaw.png)

A modern, real-time chat application built with React, TypeScript, and Tailwind CSS that connects to a WebSocket server for live messaging functionality.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Implementation Details](#implementation-details)
- [Requirements Coverage](#requirements-coverage)
- [Technologies Used](#technologies-used)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

This React application is a single-page chat interface that connects to a WebSocket server running on `localhost:8080`. It provides real-time messaging capabilities with a clean, modern UI that adapts to both desktop and mobile devices.

The application demonstrates:
- WebSocket connection management with proper state handling
- Real-time message streaming and display
- User identification and message ownership
- Responsive design with mobile-first approach
- Error handling and connection state management

## ✨ Features

### Core Functionality
- ✅ **WebSocket Connection Management** - Connect/disconnect with username and channel selection
- ✅ **Real-time Message Display** - Live message updates without page refresh
- ✅ **Message Sending** - Send messages via input field or Enter key
- ✅ **Connection Status Indicator** - Visual feedback for connection states
- ✅ **User ID Display** - Shows assigned user ID from server
- ✅ **Message History** - Scrollable message container with auto-scroll to latest
- ✅ **Message Types Support** - Handles `message`, `system`, and `user_connected` types
- ✅ **Error Handling** - Displays connection errors and handles disconnections gracefully

### UI/UX Features
- ✅ **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- ✅ **Modern Chat Interface** - Clean, debossed chat container with white background
- ✅ **Message Bubbles** - Distinct styling for own messages vs. others
- ✅ **Channel Tags** - Visual channel indicators on messages
- ✅ **Timestamp Display** - Formatted timestamps for all messages
- ✅ **Auto-scroll** - Automatically scrolls to latest message
- ✅ **Loading States** - Visual feedback during connection attempts
- ✅ **Debossed Effects** - Modern UI with inset shadows for depth

## 📦 Prerequisites

Before running this application, ensure you have:

- **Node.js** (version 18 or higher recommended)
- **npm** or **yarn** package manager
- **WebSocket Server** running on `localhost:8080` (see main repository README for server setup)

### Verify Prerequisites

```bash
# Check Node.js version
node --version
# Should output: v18.x.x or higher

# Check npm version
npm --version
# Should output: 9.x.x or higher
```

## 🚀 Installation

### Step 1: Navigate to Frontend Directory

```bash
cd frontend
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required dependencies including:
- React 19.2.0
- TypeScript 5.9.3
- Tailwind CSS 4.1.18
- Vite 7.2.4
- And other development dependencies

### Step 3: Verify Installation

```bash
# Check if dependencies are installed
npm list --depth=0
```

## 🏃 Running the Application

### Development Mode

1. **Start the WebSocket Server** (in the main repository directory):
   ```bash
   # From the root directory
   go run main.go
   ```
   You should see: `Server starting on port :8080`

2. **Start the React Development Server**:
   ```bash
   # From the frontend directory
   npm run dev
   ```

3. **Open in Browser**:
   - The application will be available at `http://localhost:5173` (or the port shown in terminal)
   - Open this URL in your web browser

### Production Build

To create a production build:

```bash
npm run build
```

The built files will be in the `dist/` directory. To preview the production build:

```bash
npm run preview
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── App.tsx              # Main application component
│   ├── main.tsx             # React entry point
│   ├── index.css            # Global styles (Tailwind imports)
│   └── assets/
│       ├── logokabaw.png    # Application logo
│       └── logo.jpeg        # Alternative logo
├── public/                  # Static assets
├── package.json             # Dependencies and scripts
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
└── README.md                # This file
```

## 🔧 Implementation Details

### WebSocket Connection Management

The application uses React hooks (`useState`, `useEffect`, `useRef`) to manage WebSocket connections:

```typescript
// Connection state management
const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected')
const wsRef = useRef<WebSocket | null>(null)

// Connection function
const connectWebSocket = () => {
  const wsUrl = `ws://localhost:8080/ws?username=${username}&channel=${channel}`
  const ws = new WebSocket(wsUrl)
  wsRef.current = ws
  
  // Event handlers for open, message, error, close
}
```

**Key Features:**
- **Connection States**: `disconnected`, `connecting`, `connected`, `error`
- **URL Encoding**: Username and channel are properly encoded in the WebSocket URL
- **Ref Management**: Uses `useRef` to maintain WebSocket instance across renders
- **Error Handling**: Catches and displays connection errors

### Real-time Message Display

Messages are stored in React state and automatically update when new messages arrive:

```typescript
const [messages, setMessages] = useState<Message[]>([])

ws.onmessage = (event) => {
  const message: Message = JSON.parse(event.data)
  setMessages((prev) => [...prev, message])
}
```

**Message Types Handled:**
- `message`: Regular chat messages from users
- `system`: System notifications (welcome messages, etc.)
- `user_connected`: Special message containing the assigned user ID

### User ID Management

The application extracts and stores the user ID from `user_connected` messages:

```typescript
if (message.type === 'user_connected' && message.user_id) {
  setCurrentUserID(message.user_id)
}
```

The user ID is:
- Displayed in the header
- Used to identify own messages (for styling)
- Cleared on disconnect

### Message Sending

Messages are sent via the WebSocket connection:

```typescript
const sendMessage = () => {
  const message = {
    type: 'message',
    content: inputMessage.trim(),
  }
  wsRef.current.send(JSON.stringify(message))
  setInputMessage('')
}
```

**Features:**
- Input validation (non-empty messages)
- Enter key support (Shift+Enter for new line)
- Automatic input clearing after send
- Connection state checking before sending

### Auto-scroll Functionality

The application automatically scrolls to the latest message:

```typescript
const messagesEndRef = useRef<HTMLDivElement>(null)

useEffect(() => {
  scrollToBottom()
}, [messages])
```

### Responsive Design

The UI adapts to different screen sizes:

- **Mobile View** (< 640px):
  - 2-line header layout
  - Logo and status on first line
  - User ID on second line
  - Compact message bubbles
  - Full-width buttons

- **Desktop View** (≥ 640px):
  - Single-line header
  - Logo with subtitle
  - Horizontal layout for status and controls
  - Larger message bubbles
  - Optimized spacing

### Styling Approach

The application uses **Tailwind CSS** for styling with:
- Custom color palette (light green `#5A9B6F` for primary actions)
- Debossed effects using inset box-shadows
- Responsive breakpoints (`sm:`, `md:`, `lg:`)
- Modern UI elements (rounded corners, shadows, transitions)

## ✅ Requirements Coverage

This implementation addresses all requirements from the main README:

### 1. WebSocket Connection Management ✅

- ✅ Connects to `ws://localhost:8080/ws?username=YourName&channel=general`
- ✅ Handles connection states: `connecting`, `connected`, `disconnected`, `error`
- ✅ **Reconnection Logic**: While not automatic, users can easily reconnect via the Connect button
- ✅ Proper URL encoding for username and channel parameters

**Implementation:**
```typescript
const connectWebSocket = () => {
  const wsUrl = `ws://localhost:8080/ws?username=${encodeURIComponent(username)}&channel=${encodeURIComponent(channel)}`
  const ws = new WebSocket(wsUrl)
  // ... event handlers
}
```

### 2. Real-time Message Display ✅

- ✅ Shows incoming messages in real-time without page refresh
- ✅ Displays message metadata:
  - Username
  - Timestamp (formatted as "HH:MM AM/PM")
  - User ID (full 32-character hexadecimal)
  - Channel (as colored tags)
- ✅ Handles different message types:
  - `message`: Regular chat messages
  - `system`: System notifications
  - `user_connected`: User ID assignment

**Implementation:**
```typescript
ws.onmessage = (event) => {
  const message: Message = JSON.parse(event.data)
  setMessages((prev) => [...prev, message])
}
```

### 3. Message Sending ✅

- ✅ Input field for typing messages
- ✅ Send button functionality
- ✅ Enter key support (Enter to send, Shift+Enter for new line)
- ✅ Input validation (prevents empty messages)

**Implementation:**
```typescript
const sendMessage = () => {
  if (!inputMessage.trim() || !wsRef.current) return
  wsRef.current.send(JSON.stringify({ type: 'message', content: inputMessage.trim() }))
  setInputMessage('')
}
```

### 4. User Interface Requirements ✅

- ✅ **Clean, modern chat interface**: Debossed white chat container on beige background
- ✅ **Message history display**: Scrollable container with all messages
- ✅ **Connection status indicator**: Visual status badge with color coding:
  - Green: Connected
  - Yellow: Connecting
  - Red: Error
  - Gray: Disconnected
- ✅ **User identification**: Displays assigned user ID in header

**UI Features:**
- Responsive design for mobile and desktop
- Message bubbles with distinct styling for own messages
- Channel tags with color coding
- Formatted timestamps
- Auto-scroll to latest message

### 5. Error Handling ✅

- ✅ **Connection errors**: Displays error messages when connection fails
- ✅ **WebSocket disconnections**: Handles graceful disconnections
- ✅ **Loading states**: Shows "Connecting..." status during connection attempts
- ✅ **Input validation**: Prevents sending empty messages
- ✅ **Connection state checking**: Verifies WebSocket is open before sending

**Error Handling Implementation:**
```typescript
ws.onerror = (event) => {
  setConnectionStatus('error')
  setError('Connection error. Make sure the server is running on port 8080.')
}

ws.onclose = (event) => {
  setConnectionStatus('disconnected')
  if (event.code !== 1000) {
    setError('Connection closed unexpectedly')
  }
}
```

## 🛠 Technologies Used

### Core Technologies
- **React 19.2.0** - UI library for building the interface
- **TypeScript 5.9.3** - Type-safe JavaScript
- **Vite 7.2.4** - Build tool and development server

### Styling
- **Tailwind CSS 4.1.18** - Utility-first CSS framework
- **@tailwindcss/vite** - Vite plugin for Tailwind

### Development Tools
- **ESLint** - Code linting
- **TypeScript ESLint** - TypeScript-specific linting rules

## 🐛 Troubleshooting

### Common Issues

#### 1. WebSocket Connection Refused

**Problem**: Cannot connect to WebSocket server

**Solution**:
- Ensure the Go WebSocket server is running: `go run main.go`
- Verify server is on port 8080
- Check browser console for detailed error messages

#### 2. CORS Issues

**Problem**: Cross-origin connection blocked

**Solution**:
- The server is configured to allow all origins
- Ensure you're connecting to `ws://localhost:8080/ws`
- Check server logs for connection attempts

#### 3. Messages Not Appearing

**Problem**: Messages sent but not displayed

**Solution**:
- Check browser console for `[FRONTEND-MESSAGE]` logs
- Verify WebSocket connection status is "Connected"
- Ensure you're connected to the correct channel

#### 4. User ID Not Showing

**Problem**: User ID not displayed in header

**Solution**:
- Wait for `user_connected` message from server
- Check browser console for `[FRONTEND-USER-ID]` log
- Verify connection is established

#### 5. Build Errors

**Problem**: `npm run build` fails

**Solution**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 6. Port Already in Use

**Problem**: Vite dev server port is already in use

**Solution**:
- Vite will automatically try the next available port
- Or specify a different port: `npm run dev -- --port 3000`

## 📝 Console Logging

The application provides detailed console logging for debugging:

- **`[FRONTEND-CONNECT]`**: Connection attempts and successful connections
- **`[FRONTEND-MESSAGE]`**: All incoming messages (pretty-printed JSON)
- **`[FRONTEND-SEND]`**: Outgoing messages before sending
- **`[FRONTEND-USER-ID]`**: User ID assignment and clearing
- **`[FRONTEND-DISCONNECT]`**: Disconnection events
- **`[FRONTEND-ERROR]`**: Connection errors and failures

To view logs, open browser Developer Tools (F12) and check the Console tab.

## 🎨 Design Decisions

### Why React + TypeScript?
- **Type Safety**: TypeScript catches errors at compile time
- **Component-based Architecture**: Easier to maintain and extend
- **Modern Ecosystem**: Access to latest React features and libraries

### Why Tailwind CSS?
- **Rapid Development**: Utility classes speed up styling
- **Responsive Design**: Built-in breakpoint system
- **Consistency**: Design system enforced through utilities
- **Small Bundle Size**: Only used classes are included in production

### Why Vite?
- **Fast Development**: Instant server start and HMR
- **Optimized Builds**: Efficient production builds
- **Modern Tooling**: ES modules and native ESM support

## 📄 License

This project is part of a technical evaluation. See the main repository README for details.

## 🙏 Acknowledgments

- WebSocket server implementation provided in the main repository
- Design inspiration from kabaw.ai website
- Built with modern web technologies and best practices

---

**Note**: This application requires the WebSocket server to be running on `localhost:8080`. Make sure to start the server before running the frontend application.
#   k a b a w - c l i e n t  
 