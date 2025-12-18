// services/geminiService.js
import { GoogleGenAI } from '@google/genai';

let ai = null;

/**
 * Get or create GoogleGenAI instance (lazy initialization)
 */
const getGeminiAI = () => {
  if (!ai) {
    if (!process.env.GOOGLE_API_KEY) {
      throw new Error('GOOGLE_API_KEY is not set in environment variables');
    }
    
    ai = new GoogleGenAI({
      apiKey: process.env.GOOGLE_API_KEY
    });
    
    console.log('✅ Gemini AI service initialized');
  }
  return ai;
};

/**
 * Generate response using Gemini AI with context from RAG
 * @param {string} query - User's query
 * @param {string} context - Retrieved context from Pinecone
 * @param {Array} history - Chat history
 * @returns {Promise<string>} - AI generated response
 */
export const generateResponse = async (query, context, history = []) => {
  try {
    const geminiAI = getGeminiAI();
    
    // Prepare conversation history
    const conversationHistory = [...history, {
      role: 'user',
      parts: [{ text: query }]
    }];

    const systemInstruction = `You are a Data Structure and Algorithm (DSA) expert assistant. Your role is to help users understand DSA concepts clearly and effectively.

CONTEXT FROM KNOWLEDGE BASE:
${context}

INSTRUCTIONS FOR RESPONSE:

1. Determine if the question is related to Data Structures & Algorithms (DSA), programming, or computer science.

2. If the question is NOT related to DSA:
   - Politely acknowledge the question.
   - Explain your specialization in DSA.
   - Suggest using the "Start Discussion" feature for other topics.
   - Redirect to DSA topics you can assist with.
   - Example response:

     I appreciate your question about [topic], but I'm specifically designed to help with Data Structures and Algorithms! 🎯

     For general questions, please use the "Start Discussion" button in the sidebar to connect with our team.

     Meanwhile, I can help you with DSA topics like:
     • Arrays, Strings & Linked Lists
     • Trees, Graphs & Hash Tables
     • Sorting & Searching Algorithms
     • Dynamic Programming
     • Time & Space Complexity

     What DSA topic interests you? 🚀

3. If the question IS related to DSA:
   - Base the answer ONLY on the provided context.
   - If the answer is missing in the context:

     I could not find the answer in the provided document ☹️. Could you rephrase your question or ask something else about Data Structures and Algorithms?

   - Provide **clear, concise, and educational explanations**.
   - Highlight **important concepts** using clean, subtle emphasis (e.g., bullet points or simple phrasing).
   - Include **code examples in a VS Code-style code block**:

     \`\`\`javascript
     // Example: Reverse an array
     function reverseArray(arr) {
         const result = [];
         for (let i = arr.length - 1; i >= 0; i--) {
             result.push(arr[i]);
         }
         return result;
     }
     console.log(reverseArray([1, 2, 3])); // Output: [3, 2, 1]
     \`\`\`

   - Explain **time and space complexity** clearly when relevant.
   - Break down complex concepts into simple, easy-to-understand steps.
     - Be encouraging and supportive to learners.
  `;
  
      const response = await geminiAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: conversationHistory,
      config: {
        systemInstructions: systemInstruction,
        temperature: 0.7,
        maxOutputTokens: 2048,
        topP: 0.95,
        topK: 40
      }
    });

    return response.text;

  } catch (error) {
    console.error('Gemini response generation error:', error);
    throw new Error('Failed to generate AI response');
  }
};

/**
 * Generate a simple response without RAG context
 * @param {string} prompt - User prompt
 * @returns {Promise<string>} - AI response
 */
export const generateSimpleResponse = async (prompt) => {
  try {
    const geminiAI = getGeminiAI();
    
    const response = await geminiAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        temperature: 0.7,
        maxOutputTokens: 1024
      }
    });

    return response.text;

  } catch (error) {
    console.error('Simple response generation error:', error);
    throw new Error('Failed to generate response');
  }
};