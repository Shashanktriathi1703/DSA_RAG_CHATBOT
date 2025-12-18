# 🚀 DSA RAG Chatbot - Complete MERN Stack Application

A full-stack AI-powered chatbot for Data Structures and Algorithms learning, built with RAG (Retrieval-Augmented Generation) using Pinecone vector database and Google Gemini AI.

## 📁 Project Structure

```
dsa-rag-chatbot/
│
├── backend/
│   ├── node_modules/          # auto-generated after npm install
│   ├── models/
│   │   ├── User.js
│   │   └── Chat.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── chat.js
│   │   └── contact.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── chatController.js
│   │   └── contactController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── services/
│   │   ├── queryService.js
│   │   ├── embeddingService.js
│   │   ├── pineconeService.js
│   │   ├── geminiService.js
│   │   └── sendEmail.js
│   ├── scripts/
│   │   └── indexDocuments.js
│   ├── server.js
│   ├── package.json
│   ├── .env
│   ├── .gitignore
│   └── DSA-Notes-CodeHype.pdf
│
└── frontend/
    ├── node_modules/          # auto-generated after npm install
    ├── public/
    │   ├── index.html
    │   └── vite.svg
    ├── src/
    │   ├── assets/
    │   │   └── react.svg
    │   ├── services/
    │   │   └── api.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   ├── index.css
    │   └── App.css
    ├── package.json
    ├── package-lock.json
    ├── vite.config.js
    ├── postcss.config.js
    ├── tailwind.config.js
    ├── .env
    └── .gitignore

```

## 🛠️ Backend Setup

### 1. Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Gemini API Key
- Pinecone API Key

### 2. Installation

```bash
cd backend
npm install
```

### 3. Environment Configuration

Create a `.env` file in the backend directory:

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/dsa-rag-chatbot

# JWT Secret (generate a strong random string)
JWT_SECRET=your_super_secret_jwt_key_here

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key

# Pinecone
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=dsa-knowledge-base
```

### 4. Get API Keys

#### Gemini API Key:
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy and paste into `.env`

#### Pinecone API Key:
1. Sign up at [Pinecone](https://www.pinecone.io/)
2. Create a new index with:
   - Name: `dsa-knowledge-base`
   - Dimensions: `768`
   - Metric: `cosine`
3. Copy API key to `.env`

### 5. Index Your Documents

Place your `DSA-Notes-CodeHype.pdf` in the backend folder, then run:

```bash
npm run index
```

This will:
- Load and chunk your PDF
- Generate embeddings
- Upload to Pinecone
- Takes 5-10 minutes depending on document size

### 6. Start Backend Server

```bash
npm run dev
```

Server will run on `http://localhost:5000`

## 🎨 Frontend Setup

### 1. Create React App

```bash
npx create-react-app frontend
cd frontend
```

### 2. Install Dependencies

```bash
npm install lucide-react axios
```

### 3. Update Frontend Code

Replace the contents of `src/App.js` with the React component from the first artifact.

### 4. Create API Service

Create `src/services/api.js`:

```javascript
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const signup = (name, email, password) =>
  api.post('/auth/signup', { name, email, password });

export const login = (email, password) =>
  api.post('/auth/login', { email, password });

export const getMe = () => api.get('/auth/me');

// Chat APIs
export const sendMessage = (message, sessionId) =>
  api.post('/chat/message', { message, sessionId });

export const getChatHistory = (sessionId) =>
  api.get(`/chat/history/${sessionId}`);

export const createSession = () => api.post('/chat/session');

export default api;
```

### 5. Update Frontend to Use Real API

In your React component, replace the mock functions with actual API calls:

```javascript
import { login as apiLogin, signup as apiSignup, sendMessage, createSession } from './services/api';

// In useAuth hook:
const login = async (email, password) => {
  const { data } = await apiLogin(email, password);
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data));
  setUser(data);
};

// In ChatInterface handleSend:
const handleSend = async () => {
  if (!input.trim()) return;
  
  const userMessage = input.trim();
  setInput('');
  setMessages((prev) => [...prev, { type: 'user', content: userMessage }]);
  setIsLoading(true);

  try {
    const { data } = await sendMessage(userMessage, sessionId);
    setMessages((prev) => [...prev, { type: 'bot', content: data.message }]);
  } catch (error) {
    console.error('Error:', error);
    setMessages((prev) => [...prev, { 
      type: 'bot', 
      content: 'Sorry, I encountered an error. Please try again.' 
    }]);
  } finally {
    setIsLoading(false);
  }
};
```

### 6. Start Frontend

```bash
npm start
```

Frontend will run on `http://localhost:3000`

## 🚀 Running the Complete Application

### Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

### Terminal 2 - Frontend:
```bash
cd frontend
npm start
```

## 📋 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Chat
- `POST /api/chat/message` - Send message & get AI response (protected)
- `GET /api/chat/history/:sessionId` - Get chat history (protected)
- `POST /api/chat/session` - Create new session (protected)

## 🔧 Troubleshooting

### MongoDB Connection Issues:
- Ensure MongoDB is running: `mongod`
- Or use MongoDB Atlas connection string

### Pinecone Errors:
- Check API key is correct
- Verify index dimensions match (768 for text-embedding-004)
- Ensure index name matches .env

### CORS Errors:
- Verify FRONTEND_URL in backend .env
- Check both servers are running

### Gemini API Errors:
- Verify API key is active
- Check quota limits
- Ensure billing is enabled for production use

## 🎯 Features

- ✅ User authentication (signup/login)
- ✅ JWT token-based authorization
- ✅ RAG-powered responses using Pinecone
- ✅ Chat history persistence
- ✅ Context-aware conversations
- ✅ Beautiful gradient UI with animations
- ✅ Mobile responsive design
- ✅ Real-time chat interface

## 📚 Tech Stack

**Frontend:**
- React.js
- Tailwind CSS (via CDN)
- Lucide React Icons
- Axios

**Backend:**
- Node.js & Express
- MongoDB & Mongoose
- JWT Authentication
- Google Gemini AI
- Pinecone Vector Database
- LangChain

## 🔐 Security Notes

- Never commit `.env` files
- Use strong JWT secrets in production
- Enable HTTPS in production
- Rate limit API endpoints
- Validate all user inputs
- Sanitize MongoDB queries

## 📝 License

MIT

## 🤝 Contributing

Feel free to submit issues and pull requests!

---

Built with ❤️ using MERN Stack + RAG + AI
