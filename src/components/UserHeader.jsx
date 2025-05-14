import React, { useState, useEffect } from 'react';
import { Circle, Wifi, WifiOff } from 'lucide-react';

const UserHeader = ({ user, isCurrentUser, isOtherUserOnline, isOtherUserTyping, socket }) => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (socket) {
      setIsConnected(socket.isConnected());
      
      // Listen for connection status changes
      const handleConnect = () => setIsConnected(true);
      const handleDisconnect = () => setIsConnected(false);
      
      socket.on('connect', handleConnect);
      socket.on('disconnect', handleDisconnect);
      
      return () => {
        socket.off('connect', handleConnect);
        socket.off('disconnect', handleDisconnect);
      };
    }
  }, [socket]);

  const handleConnectionToggle = () => {
    if (isConnected) {
      socket.emit('set_presence', { status: 'offline' });
      setTimeout(() => socket.disconnect(), 100);
    } else {
      socket.reconnect();
    }
  };

  return (
    <div className="bg-gray-800 text-white p-4 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="relative">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            {user.name[0].toUpperCase()}
          </div>
          <Circle 
            className={`absolute -bottom-1 -right-1 w-3 h-3 ${
              isCurrentUser 
                ? (isConnected ? 'text-green-500' : 'text-gray-500') 
                : (isOtherUserOnline ? 'text-green-500' : 'text-gray-500')
            } fill-current`} 
          />
        </div>
        <div>
          <h3 className="font-semibold">{user.name}</h3>
          <p className="text-xs text-gray-400">
            {isCurrentUser 
              ? (isConnected ? 'Connected' : 'Disconnected') 
              : (isOtherUserTyping ? 'Typing...' : (isOtherUserOnline ? 'Online' : 'Offline'))}
          </p>
        </div>
      </div>
      {isCurrentUser && socket && (
        <button 
          onClick={handleConnectionToggle}
          className={`p-2 rounded ${
            isConnected ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'
          } transition-colors`}
        >
          {isConnected ? <Wifi size={20} /> : <WifiOff size={20} />}
        </button>
      )}
    </div>
  );
};

export default UserHeader;