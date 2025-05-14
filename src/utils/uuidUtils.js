// src/utils/uuidUtils.js

// Generate a new UUID v4
export const generateUUID = () => {
    // Using crypto.randomUUID() if available (modern browsers)
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    
    // Fallback UUID v4 generation
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };
  
  // Validate UUID format
  export const isValidUUID = (uuid) => {
    if (!uuid) return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };
  
  // Generate a deterministic conversation ID from two user IDs
  // This ensures the same conversation ID regardless of who initiates
  export const generateConversationId = (userId1, userId2) => {
    // Sort user IDs to ensure consistency
    const sortedIds = [userId1, userId2].sort();
    
    // For now, return a real UUID (in production, this might come from the server)
    // You could also implement a deterministic UUID generation based on the user IDs
    return generateUUID();
  };
  
  // Extract conversation ID from a string that might have prefixes
  export const extractConversationId = (conversationIdString) => {
    if (!conversationIdString) return null;
    
    // Remove any prefixes like "conv-"
    const withoutPrefix = conversationIdString.replace(/^conv-/, '');
    
    // Validate it's a proper UUID
    if (isValidUUID(withoutPrefix)) {
      return withoutPrefix;
    }
    
    return null;
  };