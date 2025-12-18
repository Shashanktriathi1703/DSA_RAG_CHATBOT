// controllers/chatController.js
import Chat from '../models/chat.js';
import { transformQuery } from '../services/queryService.js';
import { generateEmbedding } from '../services/embeddingService.js';
import { searchPinecone } from '../services/pineconeService.js';
import { generateResponse } from '../services/geminiService.js';
import sendEmailWithAttachment from '../services/sendEmail.js';
import fs from 'fs';
import path from 'path';


// @desc    Send message and get AI response
// @route   POST /api/chat/message
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    const userId = req.user._id;

    if (!message || !sessionId) {
      return res.status(400).json({ 
        error: 'Message and sessionId are required' 
      });
    }

    // Find or create chat session
    let chat = await Chat.findOne({ userId, sessionId });
    if (!chat) {
      chat = await Chat.create({
        userId,
        sessionId,
        messages: []
      });
    }

    // Add user message to history
    chat.messages.push({
      role: 'user',
      content: message
    });

    // Get chat history for context
    const chatHistory = chat.messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    // Step 1: Transform query based on chat history
    const transformedQuery = await transformQuery(message, chatHistory);
    console.log('Transformed Query:', transformedQuery);

    // Step 2: Generate embedding for the query
    const queryEmbedding = await generateEmbedding(transformedQuery);
    console.log('Embedding generated');

    // Step 3: Search Pinecone for relevant context
    const searchResults = await searchPinecone(queryEmbedding);
    const context = searchResults
      .map(match => match.metadata.text)
      .join('\n\n---\n\n');
    console.log('Context retrieved from Pinecone');

    // Step 4: Generate response using Gemini with context
    const aiResponse = await generateResponse(
      transformedQuery,
      context,
      chatHistory
    );

    // Add AI response to history
    chat.messages.push({
      role: 'assistant',
      content: aiResponse
    });

    await chat.save();

    res.json({
      message: aiResponse,
      sessionId: chat.sessionId
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      error: 'Error processing message',
      message: error.message 
    });
  }
};

// @desc    Get chat history
// @route   GET /api/chat/history/:sessionId
// @access  Private
export const getChatHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user._id;

    const chat = await Chat.findOne({ userId, sessionId });

    if (!chat) {
      return res.json({ messages: [] });
    }

    res.json({
      sessionId: chat.sessionId,
      messages: chat.messages
    });

  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ 
      error: 'Error fetching chat history',
      message: error.message 
    });
  }
};

// @desc    Create new chat session
// @route   POST /api/chat/session
// @access  Private
export const createNewSession = async (req, res) => {
  try {
    const userId = req.user._id;
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const chat = await Chat.create({
      userId,
      sessionId,
      messages: []
    });

    res.status(201).json({
      sessionId: chat.sessionId
    });

  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ 
      error: 'Error creating session',
      message: error.message 
    });
  }
};


// @desc    Download chat and send via email
// @route   POST /api/chat/download
// @access  Private

export const downloadChat = async (req, res) => {
  try {
    const { sessionId, email } = req.body;

    if (!sessionId || !email) {
      return res.status(400).json({ message: 'Missing sessionId or email' });
    }

    // 1️⃣ Fetch chat
    const chat = await Chat.findOne({
      userId: req.user.id,
      sessionId,
    });

    if (!chat || chat.messages.length === 0) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // 2️⃣ Create file content
    let content = `Chat Session: ${sessionId}\n\n`;
    chat.messages.forEach((msg, i) => {
      content += `${msg.role.toUpperCase()}:\n${msg.content}\n\n`;
    });

    // 3️⃣ Save temp file
    const filePath = path.join(
      process.cwd(),
      `chat-${sessionId}.txt`
    );

    fs.writeFileSync(filePath, content);

    // 4️⃣ Send email
    await sendEmailWithAttachment({
      to: email,
      subject: 'Your Chat Conversation',
      text: 'Attached is your chat conversation.',
      filePath,
    });

    // 5️⃣ Cleanup
    fs.unlinkSync(filePath);

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to send chat' });
  }
};



// SAVE MESSAGE
export const saveMessage = async (req, res) => {
  const { sessionId, role, content } = req.body;

  let chat = await Chat.findOne({ sessionId, userId: req.user.id });

  if (!chat) {
    chat = await Chat.create({
      userId: req.user.id,
      sessionId,
      messages: [],
    });
  }

  chat.messages.push({ role, content });
  await chat.save();

  res.status(200).json({ success: true });
};

// GET SINGLE SESSION
export const getChatBySession = async (req, res) => {
  const { sessionId } = req.params;

  const chat = await Chat.findOne({
    userId: req.user.id,
    sessionId,
  });

  res.status(200).json(chat?.messages || []);
};
