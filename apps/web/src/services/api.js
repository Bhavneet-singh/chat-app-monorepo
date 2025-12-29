import { API_ENDPOINTS } from '@chat/shared';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const getAuthToken = () => {
  return localStorage.getItem('token');
};

const setAuthToken = (token) => {
  localStorage.setItem('token', token);
};

export const clearAuthToken = () => {
  localStorage.removeItem('token');
};

async function fetchApi(endpoint, options = {}) {
  const token = getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

export const authApi = {
  register: async (username, email, password) => {
    const response = await fetchApi(API_ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
    
    if (response.data && response.data.token) {
      setAuthToken(response.data.token);
    }
    
    return response;
  },

  login: async (email, password) => {
    const response = await fetchApi(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.data && response.data.token) {
      setAuthToken(response.data.token);
    }
    
    return response;
  },

  getProfile: async () => {
    return fetchApi(API_ENDPOINTS.AUTH.ME);
  },
};

export const userApi = {
  getUsers: async () => {
    return fetchApi(API_ENDPOINTS.USERS.LIST);
  },

  getUserById: async (id) => {
    return fetchApi(API_ENDPOINTS.USERS.BY_ID(id));
  },
};

export const conversationApi = {
  getConversations: async () => {
    return fetchApi(API_ENDPOINTS.CONVERSATIONS.LIST);
  },

  getConversation: async (id) => {
    return fetchApi(API_ENDPOINTS.CONVERSATIONS.BY_ID(id));
  },

  createConversation: async (participantId) => {
    return fetchApi(API_ENDPOINTS.CONVERSATIONS.CREATE, {
      method: 'POST',
      body: JSON.stringify({ participantId }),
    });
  },
};

export const messageApi = {
  getMessages: async (conversationId, page = 1, limit = 20) => {
    return fetchApi(`${API_ENDPOINTS.MESSAGES.LIST(conversationId)}?page=${page}&limit=${limit}`);
  },

  sendMessage: async (conversationId, receiverId, content) => {
    return fetchApi(API_ENDPOINTS.MESSAGES.SEND(conversationId), {
      method: 'POST',
      body: JSON.stringify({ receiverId, content }),
    });
  },

  markMessagesAsRead: async (conversationId) => {
    return fetchApi(API_ENDPOINTS.MESSAGES.MARK_READ(conversationId), {
      method: 'POST',
    });
  },
};

export { getAuthToken };

