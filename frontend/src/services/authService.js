import axios from 'axios';

const API_URL = 'http://localhost:8000/api/';

const authService = {
  login: async (username, password) => {
    const response = await axios.post(`${API_URL}token/`, {
      username,
      password,
    });
    return response.data;
  },
  
  refreshToken: async (refreshToken) => {
    const response = await axios.post(`${API_URL}token/refresh/`, {
      refresh: refreshToken,
    });
    return response.data;
  },
};

export default authService;