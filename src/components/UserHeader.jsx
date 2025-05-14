import React, { useState, useRef } from 'react';
import { Circle, Wifi, WifiOff } from 'lucide-react';
import SocketService from '../services/SocketService';
import { USERS } from '../utils/constants';

const UserHeader = ({ user, isCurrentUser, isOtherUserOnline, isOtherUserTyping }) => {
  const [isConnected, setIsConnected] = useState(true);
  const socketRef = useRef(new SocketService());

  const handleConnectionToggle = () => {
    if (isConnected) {
      socketRef.current.emit('set_presence', { status: 'offline' });
      setTimeout(() => socketRef.current.disconnect(), 100);
    } else {
      const currentUser = USERS.find(u => u.id === user.id);
      if (currentUser) {
        socketRef.current.connect(
          currentUser.token,
          () => socketRef.current.emit('set_presence', { status: 'online' }),
          () => {}
        );
      }
    }
    setIsConnected(!isConnected);
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
              ? (isConnected ? 'Online' : 'Offline') 
              : (isOtherUserTyping ? 'Typing...' : (isOtherUserOnline ? 'Online' : 'Offline'))}
          </p>
        </div>
      </div>
      {isCurrentUser && (
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
