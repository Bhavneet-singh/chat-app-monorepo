export const SOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  
  USER_ONLINE: 'user:online',
  USER_OFFLINE: 'user:offline',
  
  JOIN_CONVERSATION: 'conversation:join',
  LEAVE_CONVERSATION: 'conversation:leave',
  
  MESSAGE_SENT: 'message:sent',
  MESSAGE_RECEIVED: 'message:received',
  MESSAGE_DELIVERED: 'message:delivered',
  MESSAGE_READ: 'message:read',
  MESSAGES_READ: 'messages:read',
  
  TYPING_START: 'typing:start',
  TYPING_STOP: 'typing:stop',
  
  ERROR: 'error',
};

export const MESSAGE_STATUS = {
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read',
};

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    ME: '/api/auth/me',
  },
  USERS: {
    LIST: '/api/users',
    BY_ID: (id) => `/api/users/${id}`,
  },
  CONVERSATIONS: {
    LIST: '/api/conversations',
    BY_ID: (id) => `/api/conversations/${id}`,
    CREATE: '/api/conversations',
  },
  MESSAGES: {
    LIST: (conversationId) => `/api/conversations/${conversationId}/messages`,
    SEND: (conversationId) => `/api/conversations/${conversationId}/messages`,
    MARK_READ: (conversationId) => `/api/conversations/${conversationId}/messages/read`,
  },
};

export const DEFAULT_PAGINATION = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100,
};

