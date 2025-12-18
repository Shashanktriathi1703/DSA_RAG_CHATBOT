// services/pineconeService.js
import { Pinecone } from '@pinecone-database/pinecone';

let pinecone = null;
let index = null;

/**
 * Get or create Pinecone client and index (lazy initialization)
 */
const getPineconeIndex = () => {
  if (!index) {
    if (!process.env.PINECONE_API_KEY) {
      throw new Error('PINECONE_API_KEY is not set in environment variables');
    }
    if (!process.env.PINECONE_INDEX_NAME) {
      throw new Error('PINECONE_INDEX_NAME is not set in environment variables');
    }

    pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });
    
    index = pinecone.Index(process.env.PINECONE_INDEX_NAME);
    
    console.log('✅ Pinecone service initialized');
    console.log('   Index:', process.env.PINECONE_INDEX_NAME);
  }
  return index;
};

/**
 * Search Pinecone for relevant documents
 * @param {Array<number>} queryVector - Query embedding vector
 * @param {number} topK - Number of results to return
 * @returns {Promise<Array>} - Search results with metadata
 */
export const searchPinecone = async (queryVector, topK = 10) => {
  try {
    const pineconeIndex = getPineconeIndex();
    const searchResults = await pineconeIndex.query({
      topK,
      vector: queryVector,
      includeMetadata: true,
    });

    return searchResults.matches || [];
  } catch (error) {
    console.error('Pinecone search error:', error);
    throw new Error('Failed to search vector database');
  }
};

/**
 * Upsert documents to Pinecone (for indexing)
 * @param {Array} vectors - Array of vectors with id and metadata
 * @returns {Promise<void>}
 */
export const upsertToPinecone = async (vectors) => {
  try {
    const pineconeIndex = getPineconeIndex();
    await pineconeIndex.upsert(vectors);
    console.log(`Successfully upserted ${vectors.length} vectors to Pinecone`);
  } catch (error) {
    console.error('Pinecone upsert error:', error);
    throw new Error('Failed to upsert to vector database');
  }
};

/**
 * Delete vectors from Pinecone by IDs
 * @param {Array<string>} ids - Array of vector IDs to delete
 * @returns {Promise<void>}
 */
export const deleteFromPinecone = async (ids) => {
  try {
    const pineconeIndex = getPineconeIndex();
    await pineconeIndex.deleteMany(ids);
    console.log(`Successfully deleted ${ids.length} vectors from Pinecone`);
  } catch (error) {
    console.error('Pinecone delete error:', error);
    throw new Error('Failed to delete from vector database');
  }
};