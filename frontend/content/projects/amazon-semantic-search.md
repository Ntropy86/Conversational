# Product Semantic Search Copilot

## Overview
A production-grade semantic search system that indexes 120k products and 3M reviews, delivering intelligent search results with 18% improvement in search quality. The system combines traditional BM25 retrieval with modern embedding-based search for optimal performance.

## Key Achievements
- **18% nDCG improvement** (0.74 → 0.87) over baseline
- **500 queries/min** processing capacity
- **300ms average latency** for search responses
- **2GB RAM** memory footprint for full index

## Technical Architecture

### Search Pipeline
1. **Query Processing**: Intent detection and query expansion
2. **Hybrid Retrieval**: BM25 + BGE embeddings for comprehensive coverage
3. **Reranking**: Cross-encoder model for relevance scoring
4. **Result Fusion**: Intelligent combination of retrieval methods

### Data Processing
- **Product Catalog**: 120k products with rich metadata
- **Review Corpus**: 3M customer reviews for semantic understanding
- **Embedding Generation**: BGE-large-en-v1.5 for semantic representations
- **Index Optimization**: FAISS for fast similarity search

### Performance Optimizations
- **Redis Caching**: Query result caching for repeated searches
- **Batch Processing**: Efficient embedding generation
- **Model Quantization**: Optimized cross-encoder for production
- **Connection Pooling**: Efficient database connections

## Technologies Used
- **Python & FastAPI** - Backend API and processing
- **BM25** - Sparse retrieval for keyword matching
- **BGE Embeddings** - Dense retrieval for semantic search
- **FAISS** - Vector similarity search
- **Cross-Encoder** - Neural reranking model
- **Redis** - Caching and session management
- **Streamlit** - Search interface and analytics

## Search Quality Metrics
- **nDCG@10**: 0.87 (18% improvement over baseline)
- **Precision@5**: 0.82
- **Recall@10**: 0.91
- **MRR**: 0.76

## Performance Benchmarks
- **Throughput**: 500 queries per minute
- **Latency**: 300ms average response time
- **Memory**: 2GB RAM for full index
- **Accuracy**: 94% user satisfaction rate

## Live Demo
[Try the Search Interface](https://amazon-search-copilot.streamlit.app)

## GitHub Repository
[View Source Code](https://github.com/Ntropy86/amazon-semantic-search)
