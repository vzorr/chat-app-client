import React from 'react';
import { Check, CheckCheck, Clock } from 'lucide-react';

const MessageItem = ({ message, isOwnMessage }) => {
  // Determine the status icon to display
  const getStatusIcon = () => {
    if (!isOwnMessage) return null;
    
    switch (message.status) {
      case 'pending':
        return <Clock size={12} className="text-gray-400" />;
      case 'sent':
        return <Check size={12} className="text-gray-400" />;
      case 'delivered':
        return <CheckCheck size={12} className="text-gray-400" />;
      case 'read':
        return <CheckCheck size={12} className="text-blue-400" />;
      default:
        return <Clock size={12} className="text-gray-400" />;
    }
  };

  const getStatusText = () => {
    if (!isOwnMessage) return null;
    
    switch (message.status) {
      case 'pending':
        return 'Sending...';
      case 'sent':
        return 'Sent';
      case 'delivered':
        return 'Delivered';
      case 'read':
        return 'Read';
      default:
        return 'Pending';
    }
  };

  return (
    <div className={`flex mb-4 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs px-4 py-2 rounded-lg ${
        isOwnMessage ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white'
      } ${message.status === 'pending' ? 'opacity-70' : ''}`}>
        <p>{message.text}</p>
        <div className="flex items-center gap-1 text-xs mt-1 opacity-70">
          <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
          {isOwnMessage && (
            <>
              <span>·</span>
              <span className="flex items-center gap-1">
                {getStatusText()}
                {getStatusIcon()}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageItem;