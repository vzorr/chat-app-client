import axios from 'axios';

const TOKEN_SERVER_URL = 'http://localhost:4000/api/token';

class AuthService {
  static async fetchTokenForUser(user) {
    try {
      console.log(`🔐 Requesting token for user: ${user.email}`);
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
        throw new Error('Invalid token response');
      }
    } catch (error) {
      console.error(`❌ Failed to fetch token for user ${user.email}:`, error);
      throw error;
    }
  }
}

export default AuthService;
