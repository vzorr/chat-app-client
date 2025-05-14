import React from 'react';

const MessageItem = ({ message, isOwnMessage }) => {
  return (
    <div className={`flex mb-4 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs px-4 py-2 rounded-lg ${
        isOwnMessage ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white'
      }`}>
        <p>{message.text}</p>
        <p className="text-xs mt-1 opacity-70">
          {new Date(message.timestamp).toLocaleTimeString()} · {message.status}
        </p>
      </div>
    </div>
  );
};

export default MessageItem;
