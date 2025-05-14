import axios from 'axios';

const TOKEN_SERVER_URL = 'http://localhost:4000/api/token'; // Adjust to your token generator server address

const AuthService = {
  /**
   * Requests a signed JWT token for a given user from your token generator server.
   * @param {Object} user - The user object containing id, name, email, phone.
   * @returns {Promise<string>} - The signed JWT token.
   */
  async fetchTokenForUser(user) {
    try {
      const response = await axios.post(TOKEN_SERVER_URL, {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone
      });
      if (response.data?.token) {
        console.log(`✅ Token fetched for user ${user.email}`);
        return response.data.token;
      } else {
        console.error('❌ Token response missing:', response.data);
        throw new Error('Invalid token response');
      }
    } catch (error) {
      console.error(`❌ Failed to fetch token for user ${user.email}:`, error);
      throw error;
    }
  },

  /**
   * Sync the user to your backend or chat server (optional placeholder).
   * @param {string} token - The JWT token of the user.
   */
  async syncUser(token) {
    // This can be used to sync user to your chat server or log the activity
    // For now, this is a mock.
    console.log(`🔄 Syncing user with token: ${token}`);
    return Promise.resolve();
  }
};

export default AuthService;
