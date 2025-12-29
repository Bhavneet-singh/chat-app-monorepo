import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { conversationApi } from '../services/api.js';
import { formatTimestamp } from '@chat/shared';

export default function ChatList() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await conversationApi.getConversations();
      if (response.data) {
        setConversations(response.data.conversations);
      }
    } catch (err) {
      setError(err.message || 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const getOtherParticipant = (conversation) => {
    const userId = localStorage.getItem('userId');
    return conversation.participants.find(p => p._id !== userId) || conversation.participants[0];
  };

  const handleConversationClick = (conversationId) => {
    navigate(`/chat/${conversationId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl">Loading conversations...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded m-4">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Conversations</h1>
      <div className="bg-white rounded-lg shadow">
        {conversations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No conversations yet</p>
            <button
              onClick={() => navigate('/users')}
              className="mt-4 text-blue-600 hover:text-blue-500"
            >
              Start a new conversation
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {conversations.map((conversation) => {
              const otherUser = getOtherParticipant(conversation);
              const lastMessage = conversation.lastMessage;

              return (
                <li
                  key={conversation._id}
                  onClick={() => handleConversationClick(conversation._id)}
                  className="p-4 hover:bg-gray-50 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                          {otherUser.username.charAt(0).toUpperCase()}
                        </div>
                        {otherUser.isOnline && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {otherUser.username}
                          </p>
                          {otherUser.isOnline ? (
                            <span className="text-xs text-green-600">Online</span>
                          ) : (
                            <span className="text-xs text-gray-500">
                              {formatTimestamp(otherUser.lastSeen)}
                            </span>
                          )}
                        </div>
                        {lastMessage && (
                          <p className="text-sm text-gray-500 truncate mt-1">
                            {lastMessage.content}
                          </p>
                        )}
                      </div>
                    </div>
                    {conversation.lastMessageAt && (
                      <div className="text-xs text-gray-500">
                        {formatTimestamp(conversation.lastMessageAt)}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

