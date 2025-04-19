"""embed_documents.py – batch embeds approved docs into pgvector index
Run via `python -m server.scripts.embed_documents`
Requires: pgvector, openai, sqlalchemy, tqdm
"""
import os, textwrap, re
from sqlalchemy.orm import Session
from tqdm import tqdm
from openai import OpenAI
from server.db import SessionLocal, engine, Base
from server.models.csr import CSR
from server.models.doc_chunk import DocChunk  # defined in models

EMBED_MODEL = "text-embedding-3-small"
CHUNK_SIZE = 800  # tokens ≈ ~4 chars per token approximated by words 200-250
STRIP = re.compile(r"\s+")

client = OpenAI()

def chunk_text(text, size=CHUNK_SIZE):
    words = text.split()
    for i in range(0, len(words), size):
        yield " ".join(words[i : i + size])


def main():
    # First, make sure the pgvector extension is installed
    try:
        engine.execute("CREATE EXTENSION IF NOT EXISTS pgvector;")
        print("✅ pgvector extension installed or already exists")
    except Exception as e:
        print(f"⚠️ Error installing pgvector extension: {e}")
        print("Continuing anyway...")
    
    # Create tables if they don't exist
    Base.metadata.create_all(engine)
    
    db: Session = SessionLocal()
    approved_docs = db.query(CSR).filter(CSR.status == "approved").all()
    print(f"Found {len(approved_docs)} approved documents to embed")
    
    for doc in tqdm(approved_docs, desc="Embedding docs"):
        # delete existing chunks to avoid duplicates
        db.query(DocChunk).filter(DocChunk.doc_id == doc.id).delete()
        if not doc.content:
            print(f"Skipping doc {doc.id} - no content")
            continue
        
        chunk_count = 0
        for chunk in chunk_text(STRIP.sub(" ", doc.content)):
            try:
                emb = (
                    client.embeddings.create(input=chunk, model=EMBED_MODEL)
                    .data[0]
                    .embedding
                )
                db.add(DocChunk(doc_id=doc.id, content=chunk, embedding=emb))
                chunk_count += 1
            except Exception as e:
                print(f"Error embedding chunk: {e}")
        
        db.commit()
        print(f"Processed document {doc.id}: {chunk_count} chunks created")
    
    print("✅ Document embedding complete!")
    
    # Verify the results
    chunk_count = db.query(DocChunk).count()
    print(f"Total chunks in database: {chunk_count}")


if __name__ == "__main__":
    main()