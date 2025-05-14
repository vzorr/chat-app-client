import axios from 'axios';

const TOKEN_SERVER_URL = 'http://localhost:4000/api/token';

class AuthService {
  static async fetchTokenForUser(user) {
    try {
      console.log(`🔐 Requesting token for user: ${user.email} (ID: ${user.id})`);
      
      // Create unique payload for this specific user
      const requestPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone
      };
      
      console.log('📤 Token request payload:', requestPayload);
      
      const response = await axios.post(TOKEN_SERVER_URL, requestPayload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data?.token) {
        const token = response.data.token;
        
        // Decode token to verify it contains the correct user data
        try {
          const tokenPayload = this.decodeToken(token);
          console.log(`✅ Token received for ${user.email}`, {
            tokenPreview: token.substring(0, 50) + '...',
            payload: tokenPayload,
            expiresAt: new Date(tokenPayload.exp * 1000).toLocaleString()
          });
          
          // Verify the token is for the correct user
          if (tokenPayload.id !== user.id) {
            console.error(`⚠️ Token user ID mismatch! Expected: ${user.id}, Got: ${tokenPayload.id}`);
          }
        } catch (decodeError) {
          console.warn('Unable to decode token for verification:', decodeError);
        }
        
        return token;
      } else {
        throw new Error('Invalid token response - no token received');
      }
    } catch (error) {
      console.error(`❌ Failed to fetch token for user ${user.email}:`, error);
      throw error;
    }
  }
  
  // Helper method to decode JWT token for debugging
  static decodeToken(token) {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }
      
      const payload = JSON.parse(atob(parts[1]));
      return payload;
    } catch (error) {
      console.error('Error decoding token:', error);
      throw error;
    }
  }
  
  // Optional: Method to verify token is still valid
  static isTokenValid(token) {
    try {
      const payload = this.decodeToken(token);
      const now = Date.now() / 1000;
      return payload.exp > now;
    } catch {
      return false;
    }
  }
}

export default AuthService;