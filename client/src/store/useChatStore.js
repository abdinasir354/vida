import { create } from 'zustand';
import { io } from 'socket.io-client';
import api from '../services/api';

const useChatStore = create((set, get) => ({
    socket: null,
    conversations: [],
    messages: [],
    currentConversation: null,
    onlineUsers: new Set(),
    isTyping: new Map(),

    initSocket: (userId) => {
        const socket = io(window.location.origin.includes('localhost') 
            ? 'http://localhost:5000' 
            : window.location.origin);
        
        socket.emit('join', userId);

        socket.on('receive_message', (message) => {
            if (get().currentConversation?._id === message.conversationId) {
                set((state) => ({ messages: [...state.messages, message] }));
            }
            get().fetchConversations();
        });

        socket.on('reaction_updated', ({ messageId, reactions }) => {
            set((state) => ({
                messages: state.messages.map(m => m._id === messageId ? { ...m, reactions } : m)
            }));
        });

        socket.on('online_status', ({ userId, status }) => {
            set((state) => {
                const newOnlineUsers = new Set(state.onlineUsers);
                if (status === 'online') newOnlineUsers.add(userId);
                else newOnlineUsers.delete(userId);
                return { onlineUsers: newOnlineUsers };
            });
        });

        socket.on('user_typing', ({ conversationId, sender }) => {
            if (get().currentConversation?._id !== conversationId) return;
            set((state) => {
                const newIsTyping = new Map(state.isTyping);
                newIsTyping.set(conversationId, sender);
                return { isTyping: newIsTyping };
            });
            setTimeout(() => {
                set((state) => {
                    const newIsTyping = new Map(state.isTyping);
                    newIsTyping.delete(conversationId);
                    return { isTyping: newIsTyping };
                });
            }, 3000);
        });

        set({ socket });
    },

    fetchConversations: async () => {
        const res = await api.get('/messages/conversations');
        set({ conversations: res.data });
    },

    fetchMessages: async (conversationId) => {
        const res = await api.get(`/messages/${conversationId}`);
        set({ messages: res.data });
    },

    setCurrentConversation: (conversation) => {
        const oldConv = get().currentConversation;
        if (oldConv && get().socket) {
            get().socket.emit('leave_conversation', oldConv._id);
        }

        set({ currentConversation: conversation });
        
        if (conversation && get().socket) {
            get().socket.emit('join_conversation', conversation._id);
            get().fetchMessages(conversation._id);
        }
    },

    sendMessage: (msgObject) => {
        const state = get();
        if (!state.socket || !state.currentConversation) return;

        const { user } = useAuthStore.getState();
        const receiver = state.currentConversation.participants.find(p => p._id !== user.id);

        const data = {
            conversationId: state.currentConversation._id,
            sender: user.id,
            receiver: receiver?._id,
            content: msgObject.content || '',
            messageType: msgObject.messageType || 'text',
            imageUrl: msgObject.imageUrl || null,
            audioUrl: msgObject.audioUrl || null,
            replyTo: msgObject.replyTo || null
        };

        state.socket.emit('send_message', data);
    },

    sendReaction: (messageId, emoji) => {
        const state = get();
        if (!state.socket || !state.currentConversation) return;
        const { user } = useAuthStore.getState();
        
        state.socket.emit('add_reaction', {
            messageId,
            userId: user.id,
            emoji,
            conversationId: state.currentConversation._id
        });
    }
}));

export default useChatStore;
