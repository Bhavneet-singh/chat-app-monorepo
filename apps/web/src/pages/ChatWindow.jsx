import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { messageApi, conversationApi } from '../services/api.js';
import { getSocket } from '../socket/index.js';
import { SOCKET_EVENTS, MESSAGE_STATUS } from '@chat/shared';
import { formatTimestamp } from '@chat/shared';

export default function ChatWindow() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const socket = getSocket();
  const currentUserId = localStorage.getItem('userId');

  useEffect(() => {
    loadConversation();
    loadMessages();

    if (socket) {
      socket.emit(SOCKET_EVENTS.JOIN_CONVERSATION, { conversationId });

      socket.on(SOCKET_EVENTS.MESSAGE_SENT, handleMessageReceived);
      socket.on(SOCKET_EVENTS.MESSAGE_RECEIVED, handleMessageReceived);
      socket.on(SOCKET_EVENTS.MESSAGE_DELIVERED, handleMessageDelivered);
      socket.on(SOCKET_EVENTS.MESSAGE_READ, handleMessageRead);
      socket.on(SOCKET_EVENTS.MESSAGES_READ, () => {
        loadMessages();
      });

      return () => {
        socket.emit(SOCKET_EVENTS.LEAVE_CONVERSATION, { conversationId });
        socket.off(SOCKET_EVENTS.MESSAGE_SENT, handleMessageReceived);
        socket.off(SOCKET_EVENTS.MESSAGE_RECEIVED, handleMessageReceived);
        socket.off(SOCKET_EVENTS.MESSAGE_DELIVERED, handleMessageDelivered);
        socket.off(SOCKET_EVENTS.MESSAGE_READ, handleMessageRead);
        socket.off(SOCKET_EVENTS.MESSAGES_READ);
      };
    }
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversation = async () => {
    try {
      const response = await conversationApi.getConversation(conversationId);
      if (response.data) {
        setConversation(response.data.conversation);
      }
    } catch (err) {
      setError(err.message || 'Failed to load conversation');
    }
  };

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await messageApi.getMessages(conversationId);
      if (response.data) {
        setMessages(response.data.messages);
        await messageApi.markMessagesAsRead(conversationId);
      }
    } catch (err) {
      setError(err.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleMessageReceived = ({ message }) => {
    setMessages((prev) => {
      const exists = prev.find((m) => m._id === message._id);
      if (exists) return prev;
      return [...prev, message];
    });
  };

  const handleMessageDelivered = ({ message }) => {
    if (message) {
      setMessages((prev) =>
        prev.map((m) => (m._id === message._id ? { ...m, status: message.status } : m))
      );
    }
  };

  const handleMessageRead = ({ message }) => {
    setMessages((prev) =>
      prev.map((m) => (m._id === message._id ? { ...m, status: message.status, readAt: message.readAt } : m))
    );
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || sending) return;

    const otherUser = conversation.participants.find(p => p._id !== currentUserId);

    try {
      setSending(true);
      
      if (socket && socket.connected) {
        socket.emit(SOCKET_EVENTS.MESSAGE_SENT, {
          conversationId,
          receiverId: otherUser._id,
          content: messageText.trim(),
        });
        setMessageText('');
      } else {
        const response = await messageApi.sendMessage(conversationId, otherUser._id, messageText.trim());
        if (response.data) {
          handleMessageReceived({ message: response.data.message });
          setMessageText('');
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const getOtherParticipant = () => {
    if (!conversation) return null;
    return conversation.participants.find(p => p._id !== currentUserId) || conversation.participants[0];
  };

  const getStatusIcon = (message) => {
    if (message.sender._id !== currentUserId) return null;
    
    if (message.status === MESSAGE_STATUS.READ) {
      return <span className="text-blue-500">✓✓</span>;
    }
    if (message.status === MESSAGE_STATUS.DELIVERED) {
      return <span className="text-gray-400">✓✓</span>;
    }
    return <span className="text-gray-400">✓</span>;
  };

  if (loading && messages.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl">Loading messages...</div>
      </div>
    );
  }

  if (error && !conversation) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded m-4">
        {error}
      </div>
    );
  }

  const otherUser = getOtherParticipant();

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto">
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/')}
            className="text-gray-500 hover:text-gray-700"
          >
            ← Back
          </button>
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
              {otherUser?.username?.charAt(0).toUpperCase()}
            </div>
            {otherUser?.isOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{otherUser?.username}</p>
            <p className="text-xs text-gray-500">
              {otherUser?.isOnline ? 'Online' : `Last seen ${formatTimestamp(otherUser?.lastSeen)}`}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-4">
        {messages.map((message) => {
          const isOwn = message.sender._id === currentUserId;

          return (
            <div
              key={message._id}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  isOwn
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-900 border border-gray-200'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <div className={`flex items-center justify-end space-x-1 mt-1 ${
                  isOwn ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  <span className="text-xs">
                    {formatTimestamp(message.createdAt)}
                  </span>
                  {getStatusIcon(message)}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="bg-white border-t border-gray-200 p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={sending || !messageText.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg disabled:opacity-50"
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
}

