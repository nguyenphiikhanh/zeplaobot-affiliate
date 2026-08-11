import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from '@/api/axios'; // Or standard axios if API setup is different

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token') || null);
  const user = ref<any>(null);

  const loginWithGoogle = async (payload: { id_token?: string, code?: string, ref?: string }) => {
    try {
      const storedRef = localStorage.getItem('saffi_ref_code');
      const reqPayload = { ...payload };
      if (storedRef && !reqPayload.ref) {
        reqPayload.ref = storedRef;
      }
      const response = await axios.post('/auth/google', reqPayload);
      // Axios puts the JSON response in response.data.
      // If the API returns { data: { token: '...', user: {...} } }
      const resData = response.data.data || response.data;
      if (resData && resData.token) {
        token.value = resData.token;
        localStorage.setItem('token', resData.token);
        
        // Fetch latest user info right after login
        await fetchUser();
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (token.value) {
        await axios.post('/auth/logout');
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      token.value = null;
      user.value = null;
      localStorage.removeItem('token');
    }
  };

  const fetchUser = async () => {
    if (!token.value) return;
    try {
      const response = await axios.get('/auth/user');
      const resData = response.data.data || response.data;
      user.value = resData;
    } catch (error) {
      console.error('Fetch user error:', error);
      logout();
    }
  };

  const loginWithPassword = async (payload: { email: string; password: string }) => {
    try {
      const response = await axios.post('/auth/login', payload);
      const resData = response.data.data || response.data;
      if (resData && resData.token) {
        token.value = resData.token;
        localStorage.setItem('token', resData.token);
        await fetchUser();
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Password login error:', error);
      throw error;
    }
  };

  return { token, user, loginWithGoogle, loginWithPassword, logout, fetchUser };
});
