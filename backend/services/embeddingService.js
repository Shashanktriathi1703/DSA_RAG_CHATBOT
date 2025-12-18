// services/embeddingService.js
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';

let embeddings = null;

/**
 * Get or create embeddings instance (lazy initialization)
 */
const getEmbeddings = () => {
  if (!embeddings) {
    if (!process.env.GOOGLE_API_KEY) {
      throw new Error('GOOGLE_API_KEY is not set in environment variables');
    }
    
    embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GOOGLE_API_KEY,
      model: 'text-embedding-004',
    });
    
    console.log('✅ Embeddings service initialized');
  }
  return embeddings;
};

/**
 * Generate embedding vector for a given text
 * @param {string} text - Text to generate embedding for
 * @returns {Promise<Array<number>>} - Embedding vector
 */
export const generateEmbedding = async (text) => {
  try {
    const embeddingsInstance = getEmbeddings();
    const vector = await embeddingsInstance.embedQuery(text);
    return vector;
  } catch (error) {
    console.error('Embedding generation error:', error);
    throw new Error('Failed to generate embedding');
  }
};

/**
 * Generate embeddings for multiple texts (batch processing)
 * @param {Array<string>} texts - Array of texts
 * @returns {Promise<Array<Array<number>>>} - Array of embedding vectors
 */
export const generateEmbeddings = async (texts) => {
  try {
    const embeddingsInstance = getEmbeddings();
    const vectors = await embeddingsInstance.embedDocuments(texts);
    return vectors;
  } catch (error) {
    console.error('Batch embedding generation error:', error);
    throw new Error('Failed to generate embeddings');
  }
};