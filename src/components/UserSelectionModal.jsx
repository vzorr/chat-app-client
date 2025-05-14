import React from 'react';
import { USERS } from '../utils/constants';

const UserSelectionModal = ({ onUserSelect }) => (
  <div style={{
    minHeight: '100vh',
    backgroundColor: '#111b21',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  }}>
    <div style={{
      backgroundColor: '#202c33',
      padding: '2rem',
      borderRadius: '12px',
      minWidth: '400px'
    }}>
      <h2 style={{
        color: '#e9edef',
        textAlign: 'center',
        marginBottom: '2rem'
      }}>
        Select User to Login
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {USERS.map(user => (
          <button
            key={user.id}
            onClick={() => onUserSelect(user)}
            style={{
              backgroundColor: '#2a3942',
              border: 'none',
              borderRadius: '8px',
              padding: '1rem',
              color: '#e9edef',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <div style={{ fontWeight: 'bold' }}>{user.name}</div>
            <div style={{ fontSize: '0.875rem', color: '#8696a0' }}>{user.email}</div>
          </button>
        ))}
      </div>
    </div>
  </div>
);

export default UserSelectionModal;
