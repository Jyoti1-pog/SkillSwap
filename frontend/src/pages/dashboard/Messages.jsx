import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PaperAirplaneIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';
import { messagesApi } from '../../services/api';
import useAuthStore from '../../store/authStore';
import { getSocket } from '../../services/socket';
import Avatar from '../../components/ui/Avatar';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonList } from '../../components/ui/SkeletonCard';
import { timeAgo } from '../../utils/helpers';
import { clsx } from 'clsx';

function ConversationItem({ conv, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-full flex items-center gap-3 px-4 py-3.5 transition-all duration-150 text-left border-b border-gray-50 dark:border-gray-800/60',
        isActive
          ? 'bg-brand-50 dark:bg-brand-950/40 border-l-2 border-l-brand-500'
          : 'hover:bg-gray-50 dark:hover:bg-gray-800/60 border-l-2 border-l-transparent'
      )}
    >
      <div className="relative flex-shrink-0">
        <Avatar user={conv.otherParticipant} size="md" />
        {conv.unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-brand-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center">
            {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className={clsx('text-sm truncate', conv.unreadCount > 0 ? 'font-bold text-gray-900 dark:text-white' : 'font-semibold text-gray-800 dark:text-gray-200')}>
            {conv.otherParticipant?.name}
          </p>
          {conv.lastMessage?.sentAt && (
            <p className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">{timeAgo(conv.lastMessage.sentAt)}</p>
          )}
        </div>
        <p className={clsx('text-xs truncate mt-0.5', conv.unreadCount > 0 ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500')}>
          {conv.lastMessage?.content || 'Start the conversation…'}
        </p>
      </div>
    </button>
  );
}

function ConversationList({ conversations, activeId, onSelect, loading }) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
        <h2 className="font-bold text-lg text-gray-900 dark:text-white">Messages</h2>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{conversations.length} conversation{conversations.length !== 1 ? 's' : ''}</p>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {loading ? (
          <div className="p-4"><SkeletonList count={5} /></div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center px-6">
            <div className="text-3xl mb-2">💬</div>
            <p className="text-sm text-gray-400 dark:text-gray-500">No conversations yet</p>
            <p className="text-xs text-gray-400 mt-1">Accept a swap request to start chatting</p>
          </div>
        ) : conversations.map((conv) => (
          <ConversationItem
            key={conv._id}
            conv={conv}
            isActive={activeId === conv._id}
            onClick={() => onSelect(conv._id)}
          />
        ))}
      </div>
    </div>
  );
}

function ChatView({ conversationId, onBack }) {
  const { user: me } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEnd = useRef(null);
  const inputRef = useRef(null);
  const socket = getSocket();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await messagesApi.getMessages(conversationId);
        setMessages(data.messages || []);
        setConversation(data.conversation);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();

    if (socket) {
      socket.emit('join_conversation', conversationId);
      socket.on('new_message', ({ conversationId: cid, message }) => {
        if (cid === conversationId) setMessages((p) => [message, ...p]);
      });
      socket.on('user_typing', ({ userId }) => { if (userId !== me?._id) setTyping(true); });
      socket.on('user_stop_typing', ({ userId }) => { if (userId !== me?._id) setTyping(false); });
    }
    return () => {
      if (socket) {
        socket.emit('leave_conversation', conversationId);
        socket.off('new_message');
        socket.off('user_typing');
        socket.off('user_stop_typing');
      }
    };
  }, [conversationId]);

  const otherParticipant = conversation?.participants?.find((p) => p._id !== me?._id);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    const content = text.trim();
    setText('');
    setSending(true);
    try {
      const { data } = await messagesApi.sendMessage(conversationId, { content });
      setMessages((p) => [data.message, ...p]);
    } catch (e) { console.error(e); }
    finally { setSending(false); }
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(e);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="px-4 py-3.5 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3 flex-shrink-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <button
          onClick={onBack}
          className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors mr-1"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
        <Avatar user={otherParticipant} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 dark:text-white text-sm">{otherParticipant?.name || 'Chat'}</p>
          <AnimatePresence mode="wait">
            {typing ? (
              <motion.p
                key="typing"
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                className="text-xs text-brand-500 font-medium"
              >
                typing…
              </motion.p>
            ) : (
              <motion.p
                key="status"
                initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                className="text-xs text-emerald-500 flex items-center gap-1"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                Online
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col-reverse gap-2 scrollbar-hide">
        {loading ? (
          <SkeletonList count={4} />
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-950/40 flex items-center justify-center mb-4">
              <span className="text-3xl">👋</span>
            </div>
            <p className="font-semibold text-gray-900 dark:text-white">Say hello!</p>
            <p className="text-sm text-gray-400 mt-1">This is the beginning of your conversation.</p>
          </div>
        ) : messages.map((msg) => {
          const isMe = msg.sender === me?._id || msg.sender?._id === me?._id;
          const isSystem = msg.type === 'system';
          if (isSystem) {
            return (
              <div key={msg._id} className="flex justify-center my-2">
                <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full italic">
                  {msg.content}
                </span>
              </div>
            );
          }
          return (
            <motion.div
              key={msg._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={clsx('flex items-end gap-2', isMe ? 'justify-end' : 'justify-start')}
            >
              {!isMe && <Avatar user={otherParticipant} size="xs" className="flex-shrink-0 mb-0.5" />}
              <div className={clsx(
                'max-w-[70%] px-4 py-2.5 text-sm leading-relaxed',
                isMe
                  ? 'bg-gradient-to-br from-brand-500 to-brand-600 text-white rounded-2xl rounded-br-sm'
                  : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl rounded-bl-sm shadow-sm border border-gray-100 dark:border-gray-700'
              )}>
                <p>{msg.content}</p>
                <p className={clsx('text-[10px] mt-1', isMe ? 'text-white/60 text-right' : 'text-gray-400')}>
                  {timeAgo(msg.createdAt)}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Input */}
      <form onSubmit={send} className="px-4 py-3.5 border-t border-gray-100 dark:border-gray-800 flex items-center gap-3 flex-shrink-0">
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message… (Enter to send)"
          className="input flex-1 py-2.5 text-sm"
          onFocus={() => socket?.emit('typing', { conversationId })}
          onBlur={() => socket?.emit('stop_typing', { conversationId })}
        />
        <motion.button
          type="submit"
          disabled={!text.trim() || sending}
          whileTap={{ scale: 0.9 }}
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-40 transition-all"
          style={{ background: 'linear-gradient(135deg, #6366f1, #d946ef)' }}
        >
          <PaperAirplaneIcon className="w-5 h-5 text-white" />
        </motion.button>
      </form>
    </div>
  );
}

export default function Messages() {
  const { conversationId } = useParams();
  const [params] = useSearchParams();
  const withUserId = params.get('with');
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeConv, setActiveConv] = useState(conversationId || null);

  useEffect(() => {
    messagesApi.getConversations()
      .then(({ data }) => { setConversations(data.conversations || []); })
      .catch(() => {})
      .finally(() => setLoading(false));

    if (withUserId) {
      messagesApi.createConversation(withUserId).then(({ data }) => {
        const conv = data.conversation;
        setActiveConv(conv._id);
        setConversations((p) => p.find((c) => c._id === conv._id) ? p : [conv, ...p]);
      }).catch(() => {});
    }
  }, [withUserId]);

  useEffect(() => {
    if (conversationId) setActiveConv(conversationId);
  }, [conversationId]);

  const handleSelect = (id) => {
    setActiveConv(id);
    navigate(`/messages/${id}`);
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-card">
      {/* Sidebar */}
      <div className={clsx(
        'w-full md:w-72 lg:w-80 border-r border-gray-100 dark:border-gray-800 flex-shrink-0 flex flex-col bg-gray-50/50 dark:bg-gray-900',
        activeConv ? 'hidden md:flex' : 'flex'
      )}>
        <ConversationList
          conversations={conversations}
          activeId={activeConv}
          onSelect={handleSelect}
          loading={loading}
        />
      </div>

      {/* Chat panel */}
      <div className={clsx('flex-1 flex flex-col bg-white dark:bg-gray-900', !activeConv ? 'hidden md:flex' : 'flex')}>
        {activeConv ? (
          <ChatView
            conversationId={activeConv}
            onBack={() => { setActiveConv(null); navigate('/messages'); }}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 rounded-3xl bg-brand-50 dark:bg-brand-950/40 flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">💬</span>
              </div>
              <p className="font-semibold text-gray-900 dark:text-white text-lg">Select a conversation</p>
              <p className="text-sm text-gray-400 mt-1">Pick one from the left to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
