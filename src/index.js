import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import ChatApp from './App';
import UserSelectionModal from './components/UserSelectionModal';
import { USERS } from './utils/constants';
import './App.css';

const AppWrapper = () => {
  const [selectedUser, setSelectedUser] = useState(null);

  if (!selectedUser) {
    return (
      <UserSelectionModal onUserSelect={(user) => setSelectedUser(user)} />
    );
  }

  return (
    <ChatApp
      currentUser={selectedUser}
      allUsers={USERS}
      onLogout={() => setSelectedUser(null)}
    />
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AppWrapper />
  </React.StrictMode>
);
