// src/utils/userUtils.js

// Validate UUID format
export const isValidUUID = (uuid) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };
  
  // Ensure consistent user ID format
  export const normalizeUserId = (userId) => {
    if (!userId) return null;
    
    // Convert to string and trim
    const normalized = String(userId).trim().toLowerCase();
    
    // Validate it's a proper UUID
    if (!isValidUUID(normalized)) {
      console.error(`Invalid UUID format: ${userId}`);
      return null;
    }
    
    return normalized;
  };
  
  // Compare user IDs (case-insensitive)
  export const compareUserIds = (id1, id2) => {
    const normalized1 = normalizeUserId(id1);
    const normalized2 = normalizeUserId(id2);
    
    return normalized1 && normalized2 && normalized1 === normalized2;
  };
  
  // Validate and process user object
  export const validateUser = (user) => {
    if (!user || typeof user !== 'object') {
      console.error('Invalid user object:', user);
      return null;
    }
    
    const { id, name, email, phone } = user;
    
    // Validate required fields
    if (!id || !name || !email) {
      console.error('User missing required fields:', user);
      return null;
    }
    
    // Validate UUID
    const normalizedId = normalizeUserId(id);
    if (!normalizedId) {
      console.error('User has invalid UUID:', id);
      return null;
    }
    
    return {
      ...user,
      id: normalizedId, // Use normalized ID
    };
  };
  
  // Debug helper to log user IDs
  export const debugUserIds = (label, users) => {
    console.log(`🔍 ${label}:`);
    if (Array.isArray(users)) {
      users.forEach(user => {
        console.log(`  - ${user.name}: ${user.id} (valid: ${isValidUUID(user.id)})`);
      });
    } else if (typeof users === 'object') {
      Object.entries(users).forEach(([key, value]) => {
        console.log(`  - ${key}: ${value} (valid: ${isValidUUID(key)})`);
      });
    }
  };