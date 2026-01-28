# OpenRouter Service Implementation Plan

## Overview

Integrate OpenRouter API to provide AI-powered features for the Task Planner application.

## Prerequisites

1. Create account at https://openrouter.ai
2. Add credits or use a free model
3. Generate API key
4. Add to `.env`: `OPENROUTER_API_KEY=your_key_here`

## Features to Implement

### 1. AI Task Suggestions
Generate task suggestions based on user input or context.

### 2. Task Description Enhancement
Improve task descriptions using AI for better clarity.

### 3. Priority Recommendation
Suggest task priority based on description and due date.

## Technical Implementation

### Service Architecture

```
src/lib/services/
└── openrouter.ts       # OpenRouter API client
```

### API Integration

**OpenRouter API Endpoint:** `https://openrouter.ai/api/v1/chat/completions`

**Request Format:**
```typescript
{
  model: string;
  messages: { role: string; content: string }[];
  temperature?: number;
  max_tokens?: number;
}
```

### Models to Use

- Free: `google/gemini-2.0-flash-exp:free`
- Paid: `anthropic/claude-3.5-sonnet`

### API Endpoint

Create `/api/ai/suggest` endpoint that:
1. Accepts user prompt
2. Calls OpenRouter with context
3. Returns AI-generated suggestion

## Implementation Steps

1. Create OpenRouter service (`src/lib/services/openrouter.ts`)
   - Configuration and types
   - Chat completion function
   - Error handling

2. Create API endpoint (`src/pages/api/ai/suggest.ts`)
   - Validate input
   - Call OpenRouter service
   - Return structured response

3. Update UI components
   - Add "AI Suggest" button to task form
   - Display AI suggestions

## Error Handling

- API key not configured: Return helpful error message
- Rate limiting: Implement retry with backoff
- Invalid response: Graceful fallback

## Security Considerations

- Never expose API key to client
- Validate and sanitize user input
- Implement rate limiting per user
