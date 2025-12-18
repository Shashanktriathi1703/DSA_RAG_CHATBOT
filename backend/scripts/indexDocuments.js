// scripts/indexDocuments.js
import dotenv from 'dotenv';
dotenv.config();

import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { Pinecone } from '@pinecone-database/pinecone';
import { PineconeStore } from '@langchain/pinecone';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';

async function indexDocuments() {
  try {
    console.log('🚀 Starting document indexing process...\n');

    // Step 1: Load PDF
    const PDF_PATH = './DSA-Notes-CodeHype.pdf';
    console.log('📄 Loading PDF from:', PDF_PATH);
    const pdfLoader = new PDFLoader(PDF_PATH);
    const rawDocs = await pdfLoader.load();
    console.log(`✅ Loaded ${rawDocs.length} pages from PDF\n`);

    // Step 2: Split into chunks
    console.log('✂️  Splitting documents into chunks...');
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const chunkedDocs = await textSplitter.splitDocuments(rawDocs);
    console.log(`✅ Created ${chunkedDocs.length} chunks\n`);

    // Show sample chunks
    console.log('📝 Sample chunks:');
    console.log(JSON.stringify(chunkedDocs.slice(0, 2), null, 2));
    console.log('\n');

    // Step 3: Create embeddings
    console.log('🧠 Initializing embedding model...');
    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GEMINI_API_KEY,
      model: 'text-embedding-004',
    });
    console.log('✅ Embedding model ready\n');

    // Step 4: Connect to Pinecone
    console.log('📌 Connecting to Pinecone...');
    const pinecone = new Pinecone();
    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);
    console.log('✅ Connected to Pinecone index:', process.env.PINECONE_INDEX_NAME);
    console.log('\n');

    // Step 5: Upsert to Pinecone
    console.log('⬆️  Uploading documents to Pinecone...');
    console.log('⏳ This may take a few minutes...\n');
    
    await PineconeStore.fromDocuments(chunkedDocs, embeddings, {
      pineconeIndex,
      maxConcurrency: 5,
    });

    console.log('✅ All documents indexed successfully!');
    console.log('🎉 Indexing complete!\n');
    console.log('📊 Summary:');
    console.log(`   - Total pages: ${rawDocs.length}`);
    console.log(`   - Total chunks: ${chunkedDocs.length}`);
    console.log(`   - Index name: ${process.env.PINECONE_INDEX_NAME}`);
    console.log('\n✨ Your DSA knowledge base is now ready to use!');

  } catch (error) {
    console.error('❌ Error during indexing:', error);
    process.exit(1);
  }
}

// Run the indexing
indexDocuments();