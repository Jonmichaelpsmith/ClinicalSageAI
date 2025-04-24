
import os
import json
import glob
import argparse
from datetime import datetime

METADATA_DIR = 'data/knowledge_metadata'
CONTENT_DIR = 'data/processed_knowledge'

def load_metadata():
    """Load all metadata files into memory."""
    metadata_files = glob.glob(os.path.join(METADATA_DIR, '*.json'))
    metadata_collection = []
    
    for metadata_file in metadata_files:
        if metadata_file.endswith('ingestion_summary.json'):
            continue
        
        try:
            with open(metadata_file, 'r', encoding='utf-8') as f:
                metadata = json.load(f)
                metadata_collection.append(metadata)
        except Exception as e:
            print(f"Error loading metadata from {metadata_file}: {str(e)}")
    
    return metadata_collection

def search_content(query, metadata_collection):
    """Search for the query term in all content files."""
    results = []
    
    for metadata in metadata_collection:
        content_file = os.path.join(CONTENT_DIR, f"{metadata['id']}.txt")
        
        try:
            with open(content_file, 'r', encoding='utf-8') as f:
                content = f.read()
                
                if query.lower() in content.lower():
                    # Add metadata and a snippet of the content
                    start_idx = max(0, content.lower().find(query.lower()) - 100)
                    end_idx = min(len(content), content.lower().find(query.lower()) + len(query) + 100)
                    snippet = content[start_idx:end_idx]
                    
                    results.append({
                        "metadata": metadata,
                        "snippet": f"...{snippet}...",
                        "relevance_score": content.lower().count(query.lower())
                    })
        except Exception as e:
            print(f"Error searching content from {content_file}: {str(e)}")
    
    # Sort by relevance score
    results.sort(key=lambda x: x['relevance_score'], reverse=True)
    return results

def display_results(results, limit=5):
    """Display the search results."""
    if not results:
        print("No results found.")
        return
    
    print(f"Found {len(results)} results. Displaying top {min(limit, len(results))}:")
    print("-" * 80)
    
    for i, result in enumerate(results[:limit]):
        metadata = result['metadata']
        print(f"Result {i+1}: {metadata['filename']}")
        print(f"Source: {metadata['source_path']}")
        print(f"Extraction Date: {metadata['extraction_date']}")
        print(f"Relevance Score: {result['relevance_score']}")
        print("\nSnippet:")
        print(result['snippet'])
        print("-" * 80)

def main():
    parser = argparse.ArgumentParser(description='Search through processed knowledge base')
    parser.add_argument('query', type=str, help='The search query')
    parser.add_argument('--limit', type=int, default=5, help='Maximum number of results to display')
    args = parser.parse_args()
    
    print(f"Searching for: '{args.query}'")
    metadata_collection = load_metadata()
    print(f"Loaded metadata for {len(metadata_collection)} documents")
    
    results = search_content(args.query, metadata_collection)
    display_results(results, args.limit)

if __name__ == "__main__":
    main()
