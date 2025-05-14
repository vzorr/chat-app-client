# Chat Application

A real-time chat application built with React and Socket.IO.

## Features

- Real-time messaging
- User presence (online/offline status)
- Typing indicators
- Message delivery status
- Split screen for testing two users
- Connection toggle for each user

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Make sure your chat server is running on `http://localhost:3001`

3. Start the application:
   ```bash
   npm start
   ```

4. Open `http://localhost:3000` in your browser

## Usage

- The application shows two users side by side
- Each user can send messages to the other
- You can toggle connection status using the WiFi icon
- Typing indicators show when a user is typing
- Messages show delivery status

## Testing Features

- Send messages between users
- Toggle online/offline status
- Watch typing indicators
- See real-time message delivery

## Technologies

- React
- Socket.IO Client
- Tailwind CSS
- Lucide React Icons

## Project Structure

```
chat-app/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── ChatPanel.jsx
│   │   ├── MessageInput.jsx
│   │   ├── MessageItem.jsx
│   │   └── UserHeader.jsx
│   ├── services/
│   │   ├── AuthService.js
│   │   └── SocketService.js
│   ├── utils/
│   │   └── constants.js
│   ├── App.jsx
│   ├── App.css
│   └── index.js
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

## How It Works

1. On startup, the app syncs both users with the server using their JWT tokens
2. Each user establishes a WebSocket connection
3. Messages are sent in real-time between the two panels
4. The WiFi icon in each panel allows toggling the connection on/off
5. Typing status is shared when users are composing messages
6. Online/offline status is updated automatically

## Configuration

You can modify the server URL and user credentials in `src/utils/constants.js`

## Troubleshooting

### Server Connection Issues
- Ensure your chat server is running on `http://localhost:3001`
- Check that the tokens in `constants.js` are valid
- Look for connection errors in the browser console

### Message Not Sending
- Verify both users are connected (green status indicator)
- Check the browser console for error messages
- Ensure the server is properly handling the socket events

### Styling Issues
- Run `npm install` to ensure all dependencies are installed
- Make sure Tailwind CSS is properly configured
- Clear browser cache if styles aren't loading
