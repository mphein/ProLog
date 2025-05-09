import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/',
});

// const refreshToken = async () => {
//     const refresh = localStorage.getItem('refresh_token');
  
//     try {
//       const response = await axios.post('http://localhost:8000/api/token/refresh/', {
//         refresh: refresh,
//       });
  
//       const newAccess = response.data.access;
//       localStorage.setItem('access_token', newAccess);
//       return newAccess;
//     } catch (error) {
//       console.error('Refresh token failed:', error);
//       return null;
//     }
//   };

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refresh = localStorage.getItem('refresh_token');
      if (!refresh) {
        // No refresh token → logout
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/'; // Redirect to login
        return Promise.reject(error);
      }

      try {
        const res = await axios.post('http://localhost:8000/api/token/refresh/', {
          refresh,
        });

        const newAccess = res.data.access;
        localStorage.setItem('access_token', newAccess);
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed → logout
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/'; // Redirect to login page
      }
    }

    return Promise.reject(error);
  }
);

  
  

export default api;

