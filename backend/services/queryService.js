// services/queryService.js
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleGenAI } from '@google/genai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Transform user query into a standalone question using chat history
 * @param {string} question - User's current question
 * @param {Array} history - Chat history
 * @returns {Promise<string>} - Transformed standalone question
 */
export const transformQuery = async (question, history = []) => {
  try {
    // Create a copy of history and add current question
    const contextHistory = [...history, {
      role: 'user',
      parts: [{ text: question }]
    }];

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contextHistory,
      config: {
        systemInstructions: `You are a query rewriting expert. Based on the provided chat history, rephrase the "follow-up" user question into a complete, standalone question that can be understood without the chat history. 

Rules:
1. Only output the rewritten question, nothing else
2. Make it self-contained and clear
3. Preserve the intent and specific details
4. If it's already standalone, return it as is

Example:
Chat History: "What is a binary tree?"
Follow-up: "How do I traverse it?"
Output: "How do I traverse a binary tree?"`,
        temperature: 0.3,
        maxOutputTokens: 150
      }
    });

    const transformedQuery = response.text.trim();
    return transformedQuery || question; // Fallback to original if transformation fails

  } catch (error) {
    console.error('Query transformation error:', error);
    // Return original question if transformation fails
    return question;
  }
};