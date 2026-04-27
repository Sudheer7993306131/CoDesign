import axios from 'axios'

export const AuthService = {
  register: async (userData) => {
    // userData = { name, email, password, role }
    const response = await axios.post('http://localhost:8000/api/auth/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    // credentials = { email, password }
    const response = await axios.post('http://localhost:8000/api/auth/login', credentials);
    if (response.data.access_token) {
      // Store user data for session persistence
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user_role', response.data.role);
      localStorage.setItem('user_name', response.data.name);
      
      // Attach token to all future axios requests
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
    }
    return response.data;
  },

  logout: () => {
    localStorage.clear();
    delete api.defaults.headers.common['Authorization'];
    window.location.href = '/login';
  }
};