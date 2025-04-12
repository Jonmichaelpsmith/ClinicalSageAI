# Legacy Agents - Archived Code

This directory contains code that has been archived as part of the OpenAI-first architecture refactor implemented in April 2025.

## Why These Files Were Archived

The TrialSage platform initially used Hugging Face models and custom NLP pipelines for intelligence tasks. As part of our strategic pivot to an OpenAI-first architecture, we've replaced these components with more capable and maintainable alternatives.

## Replacement Components

| Legacy Component | Replacement |
|------------------|-------------|
| `huggingface-service.ts` | `server/services/openai-service.ts` |
| `csr_deep_learning.py` | `agents/openai/trialsage_assistant.ts` |
| `ner_parser.py` | No longer needed - OpenAI provides better entity extraction |
| `semantic_qa_hf.py` | Replaced by OpenAI Assistant API |

## API Endpoint Changes

| Legacy Endpoint | New Endpoint |
|-----------------|-------------|
| `/api/csrs/summary` | `/api/intel/summary` |
| `/api/csrs/compare-deltas` | `/api/intel/compare` |
| Various text generation endpoints | `/api/intel/qa` for protocol questions |
| N/A | `/api/intel/ind-module` (New capability) |

## When to Delete

These files can be permanently deleted once:

1. All team members have transitioned to the new OpenAI-based approach
2. No active clients are using the deprecated endpoints
3. A minimum of 3 months have passed since the initial archival (July 2025)

## Technical Details

The new architecture uses:

- OpenAI GPT-4o for all text generation and analysis
- OpenAI Assistants API for persistent context and memory
- OpenAI Embeddings for vector search (replacing FAISS standalone)
- JSON-structured outputs for consistent responses

For questions about this transition, contact the TrialSage engineering team.