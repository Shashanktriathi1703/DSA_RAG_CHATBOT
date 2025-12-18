import React, { useState, useEffect, useRef } from 'react';
import { Send, BookOpen, LogOut, Menu, X, Sparkles, Brain, Code, Mail, MessageSquare, AlertCircle, CheckCircle, Download, StopCircle, ThumbsUp, ThumbsDown, History, Trash2 } from 'lucide-react';
import { signup as apiSignup, login as apiLogin, sendMessage as apiSendMessage, createSession as apiCreateSession, sendDiscussionEmail, getChatHistory, downloadChat } from './services/api';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Authentication Hook
const useAuth = () => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      try {
        return JSON.parse(storedUser);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        return null;
      }
    }
    return null;
  });
  const [isLoading] = useState(false);

  const login = async (email, password) => {
    try {
      const { data } = await apiLogin(email, password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({ email: data.email, name: data.name, _id: data._id }));
      setUser({ email: data.email, name: data.name, _id: data._id });
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.response?.data?.error || 'Login failed' };
    }
  };

  const signup = async (name, email, password) => {
    try {
      const { data } = await apiSignup(name, email, password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({ email: data.email, name: data.name, _id: data._id }));
      setUser({ email: data.email, name: data.name, _id: data._id });
      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: error.response?.data?.error || 'Signup failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('sessionId');
    setUser(null);
  };

  return { user, login, signup, logout, isLoading };
};

// Markdown Components
const MarkdownComponents = {
  code({ node, inline, className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || '');
    return !inline && match ? (
      <div className="my-4">
        <div className="bg-gray-800 text-gray-300 px-4 py-2 rounded-t-lg text-sm font-mono flex justify-between items-center">
          <span>{match[1]}</span>
          <button
            onClick={() => navigator.clipboard.writeText(String(children))}
            className="text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded transition-colors"
          >
            Copy
          </button>
        </div>
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={match[1]}
          PreTag="div"
          className="rounded-b-lg"
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      </div>
    ) : (
      <code className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-sm font-mono" {...props}>
        {children}
      </code>
    );
  },
  strong({ children }) {
    return <strong className="text-yellow-300 font-bold">{children}</strong>;
  },
  em({ children }) {
    return <em className="text-blue-300 italic">{children}</em>;
  },
  h1({ children }) {
    return <h1 className="text-2xl font-bold text-white mt-4 mb-2">{children}</h1>;
  },
  h2({ children }) {
    return <h2 className="text-xl font-bold text-white mt-3 mb-2">{children}</h2>;
  },
  h3({ children }) {
    return <h3 className="text-lg font-bold text-white mt-2 mb-1">{children}</h3>;
  },
  ul({ children }) {
    return <ul className="list-disc list-inside my-2 space-y-1">{children}</ul>;
  },
  ol({ children }) {
    return <ol className="list-decimal list-inside my-2 space-y-1">{children}</ol>;
  },
  blockquote({ children }) {
    return <blockquote className="border-l-4 border-purple-500 pl-4 italic my-2 text-gray-300">{children}</blockquote>;
  },
};

// Login Component (keep as is)
const LoginPage = ({ onLogin, onSwitchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (email && password) {
      setLoading(true);
      setError('');
      const result = await onLogin(email, password);
      if (!result.success) {
        setError(result.error);
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4 overflow-hidden relative">
      <div className="absolute inset-0">
        <div className="absolute w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse -top-20 -left-20"></div>
        <div className="absolute w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse top-40 right-20" style={{ animationDelay: '2s' }}></div>
        <div className="absolute w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse bottom-20 left-40" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 w-full max-w-md border border-white/20 transform transition-all hover:scale-105 duration-300">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-purple-400 to-blue-500 p-4 rounded-2xl animate-bounce">
              <Brain className="w-12 h-12 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-gray-300">Sign in to continue your DSA journey</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-200">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-blue-600 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-300">
            Don't have an account?{' '}
            <button
              onClick={onSwitchToSignup}
              className="text-purple-300 hover:text-purple-200 font-semibold transition-colors"
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

// Signup Component (keep as is - same structure as Login)
const SignupPage = ({ onSignup, onSwitchToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (name && email && password) {
      setLoading(true);
      setError('');
      const result = await onSignup(name, email, password);
      if (!result.success) {
        setError(result.error);
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4 overflow-hidden relative">
      <div className="absolute inset-0">
        <div className="absolute w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse -top-20 -left-20"></div>
        <div className="absolute w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse top-40 right-20" style={{ animationDelay: '2s' }}></div>
        <div className="absolute w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse bottom-20 left-40" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 w-full max-w-md border border-white/20 transform transition-all hover:scale-105 duration-300">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-indigo-400 to-purple-500 p-4 rounded-2xl animate-bounce">
              <Code className="w-12 h-12 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
          <p className="text-gray-300">Start your DSA learning adventure</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-200">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-600 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-300">
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-purple-300 hover:text-purple-200 font-semibold transition-colors"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

// Discussion Modal Component (keep as is)
const DiscussionModal = ({ isOpen, onClose, userName, userEmail }) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    if (!subject || !message) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await sendDiscussionEmail({ subject, message, userName, userEmail });
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSubject('');
        setMessage('');
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError('Failed to send message. Please try again.');
      console.error('Discussion email error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 max-w-2xl w-full border border-white/10 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-xl">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Start a Discussion</h3>
              <p className="text-gray-400 text-sm">We'd love to hear from you!</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {success ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h4 className="text-xl font-bold text-white mb-2">Message Sent!</h4>
            <p className="text-gray-400">We'll get back to you soon.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-200">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                placeholder="What would you like to discuss?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none"
                placeholder="Share your thoughts, questions, or feedback..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-semibold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Chat History Modal
const ChatHistoryModal = ({ isOpen, onClose, onSelectSession, currentSessionId }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadSessions();
    }
  }, [isOpen]);

  const loadSessions = () => {
    // Load from localStorage for now
    const keys = Object.keys(localStorage);
    const sessionKeys = keys.filter(key => key.startsWith('session_'));
    const sessionList = sessionKeys.map(key => {
      const data = JSON.parse(localStorage.getItem(key) || '{}');
      return {
        id: key,
        date: data.date || new Date().toISOString(),
        messageCount: data.messages?.length || 0
      };
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
    setSessions(sessionList);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 max-w-2xl w-full border border-white/10 shadow-2xl max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-3 rounded-xl">
              <History className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Chat History</h3>
              <p className="text-gray-400 text-sm">View your previous conversations</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-3">
          {sessions.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No previous conversations</p>
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => {
                  onSelectSession(session.id);
                  onClose();
                }}
                className={`p-4 rounded-xl cursor-pointer transition-all ${
                  session.id === currentSessionId
                    ? 'bg-purple-500/20 border-2 border-purple-500'
                    : 'bg-white/5 hover:bg-white/10 border border-white/10'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-white font-semibold">
                      {new Date(session.date).toLocaleString()}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {session.messageCount} messages
                    </p>
                  </div>
                  {session.id === currentSessionId && (
                    <span className="text-purple-400 text-sm font-semibold">Current</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// Enhanced Chat Interface Component
const ChatInterface = ({ user, onLogout }) => {
  const [messages, setMessages] = useState([
    { type: 'bot', content: 'Hello! 👋 I\'m your DSA expert assistant. Ask me anything about Data Structures and Algorithms! 🚀', feedback: null }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [discussionOpen, setDiscussionOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);
  const [stopGeneration, setStopGeneration] = useState(false);
  const typingIntervalRef = useRef(null);

  useEffect(() => {
    const initSession = async () => {
      let storedSessionId = localStorage.getItem('sessionId');
      if (!storedSessionId) {
        try {
          const { data } = await apiCreateSession();
          storedSessionId = data.sessionId;
          localStorage.setItem('sessionId', storedSessionId);
        } catch (error) {
          console.error('Failed to create session:', error);
        }
      }
      setSessionId(storedSessionId);
    };
    initSession();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleStop = () => {
    setStopGeneration(true);
    setIsLoading(false);
    setIsTyping(false);
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }
  };

  const handleDownload = async () => {
    try {
      const chatData = {
        user: user.name,
        date: new Date().toISOString(),
        messages: messages
      };
      
      const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chat-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      // Also send to email
      await downloadChat(sessionId, user.email);
      alert('Chat downloaded and sent to your email!');
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to send to email, but file downloaded successfully.');
    }
  };

  const handleFeedback = (messageIndex, type) => {
    setMessages(prev => prev.map((msg, idx) => 
      idx === messageIndex ? { ...msg, feedback: type } : msg
    ));
  };

  const handleSend = async () => {
    if (!input.trim() || !sessionId) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { type: 'user', content: userMessage, feedback: null }]);
    setIsLoading(true);
    setIsTyping(true);
    setStopGeneration(false);

    try {
      const { data } = await apiSendMessage(userMessage, sessionId);
      setIsTyping(false);
      
      if (stopGeneration) return;

      // Simulate typing effect
      let displayedText = '';
      const fullText = data.message;
      const typingSpeed = 20;
      
      setMessages((prev) => [...prev, { type: 'bot', content: '', feedback: null }]);
      
      for (let i = 0; i < fullText.length; i++) {
        if (stopGeneration) break;
        
        displayedText += fullText[i];
        await new Promise(resolve => setTimeout(resolve, typingSpeed));
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { type: 'bot', content: displayedText, feedback: null };
          return newMessages;
        });
      }
    } catch (error) {
      setIsTyping(false);
      console.error('Error:', error);
      setMessages((prev) => [...prev, { 
        type: 'bot', 
        content: '❌ Sorry, I encountered an error. Please try again or contact support.',
        feedback: null
      }]);
    } finally {
      setIsLoading(false);
      setStopGeneration(false);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <DiscussionModal 
        isOpen={discussionOpen} 
        onClose={() => setDiscussionOpen(false)}
        userName={user.name}
        userEmail={user.email}
      />

      <ChatHistoryModal
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onSelectSession={(id) => setSessionId(id)}
        currentSessionId={sessionId}
      />

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed lg:relative lg:translate-x-0 z-30 w-64 bg-slate-900/50 backdrop-blur-lg border-r border-white/10 h-full transition-transform duration-300 ease-in-out`}>
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-purple-500 to-blue-500 p-2 rounded-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="text-white font-bold text-xl">DSA Chat</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-2 flex-1">
            <button
              onClick={() => setHistoryOpen(true)}
              className="w-full bg-white/5 hover:bg-white/10 text-white py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 border border-white/10"
            >
              <History className="w-5 h-5" />
              Chat History
            </button>

            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <span className="text-white font-semibold">Quick Topics</span>
              </div>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="hover:text-white cursor-pointer transition-colors p-2 hover:bg-white/5 rounded">📊 Arrays & Strings</div>
                <div className="hover:text-white cursor-pointer transition-colors p-2 hover:bg-white/5 rounded">🔗 Linked Lists</div>
                <div className="hover:text-white cursor-pointer transition-colors p-2 hover:bg-white/5 rounded">🌲 Trees & Graphs</div>
                <div className="hover:text-white cursor-pointer transition-colors p-2 hover:bg-white/5 rounded">💡 Dynamic Programming</div>
                <div className="hover:text-white cursor-pointer transition-colors p-2 hover:bg-white/5 rounded">⚡ Sorting Algorithms</div>
              </div>
            </div>

            <button
              onClick={() => setDiscussionOpen(true)}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 rounded-lg font-semibold transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
            >
              <Mail className="w-5 h-5" />
              Start Discussion
            </button>
          </div>

          <div className="border-t border-white/10 pt-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                {user.name[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-medium truncate">{user.name}</div>
                <div className="text-gray-400 text-xs truncate">{user.email}</div>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 py-2 rounded-lg transition-all"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-slate-900/50 backdrop-blur-lg border-b border-white/10 p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-white">
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-purple-500 to-blue-500 p-2 rounded-lg animate-pulse">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-white font-bold text-lg">DSA Expert Assistant</h1>
                <p className="text-gray-400 text-sm">Powered by RAG & Gemini AI</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 px-4 py-2 rounded-lg transition-all"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
              <div className="max-w-3xl w-full">
                <div className={`px-6 py-4 rounded-2xl ${msg.type === 'user' ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white ml-auto max-w-2xl' : 'bg-slate-800/50 backdrop-blur-lg text-gray-100 border border-white/10'}`}>
                  {msg.type === 'bot' ? (
                    <ReactMarkdown components={MarkdownComponents}>
                      {msg.content}
                    </ReactMarkdown>
                  ) : (
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  )}
                </div>
                {msg.type === 'bot' && idx > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => handleFeedback(idx, 'like')}
                      className={`p-2 rounded-lg transition-all ${msg.feedback === 'like' ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                    >
                      <ThumbsUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleFeedback(idx, 'dislike')}
                      className={`p-2 rounded-lg transition-all ${msg.feedback === 'dislike' ? 'bg-red-500/20 text-red-400' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                    >
                      <ThumbsDown className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-slate-800/50 backdrop-blur-lg px-6 py-4 rounded-2xl border border-white/10">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="bg-slate-900/50 backdrop-blur-lg border-t border-white/10 p-6">
          <div className="max-w-4xl mx-auto">
            {isLoading && (
              <button
                onClick={handleStop}
                className="mb-4 w-full bg-red-500/20 hover:bg-red-500/30 text-red-300 py-2 rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                <StopCircle className="w-5 h-5" />
                Stop Generating
              </button>
            )}
            <div className="flex gap-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Ask anything about DSA..."
                className="flex-1 px-6 py-4 bg-slate-800/50 border border-white/10 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-8 py-4 rounded-2xl font-semibold hover:from-purple-600 hover:to-blue-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App Component
export default function App() {
  const { user, login, signup, logout, isLoading } = useAuth();
  const [showSignup, setShowSignup] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="animate-pulse">
          <Brain className="w-16 h-16 text-white" />
        </div>
      </div>
    );
  }

  if (!user) {
    return showSignup ? (
      <SignupPage onSignup={signup} onSwitchToLogin={() => setShowSignup(false)} />
    ) : (
      <LoginPage onLogin={login} onSwitchToSignup={() => setShowSignup(true)} />
    );
  }

  return <ChatInterface user={user} onLogout={logout} />;
}