# RAG Pipeline Integration Design

## Architecture Overview

### 1. System Flow
1. User searches for a term not in the dictionary
2. System detects no results and triggers RAG pipeline
3. Backend calls RAG webhook with the search query
4. RAG returns suggested variable names
5. Frontend displays suggestions in a popup
6. User can accept/reject suggestions
7. Accepted suggestions are added to the dictionary

### 2. Component Structure

```
src/
├── components/
│   ├── SearchBar.tsx (modified)
│   ├── SearchResults.tsx (modified)
│   ├── RAGSuggestionPopup.tsx (new)
│   └── RAGLoadingState.tsx (new)
├── hooks/
│   ├── useRAGSuggestions.ts (new)
│   └── useDictionaryMutation.ts (new)
├── lib/
│   ├── rag-client.ts (new)
│   └── api-client.ts (new)
└── app/
    └── api/
        ├── rag/
        │   └── suggest/
        │       └── route.ts (new)
        └── dictionary/
            └── add/
                └── route.ts (new)
```

### 3. API Design

#### RAG Suggestion Endpoint
```typescript
POST /api/rag/suggest
{
  "query": string,        // Korean term
  "context": string?,     // Optional context
  "language": "ko" | "en" // Source language
}

Response:
{
  "suggestions": [
    {
      "english": string,
      "confidence": number,
      "reasoning": string,
      "type": "variable" | "function" | "class",
      "category": string
    }
  ],
  "metadata": {
    "ragVersion": string,
    "responseTime": number
  }
}
```

#### Dictionary Addition Endpoint
```typescript
POST /api/dictionary/add
{
  "korean": string,
  "english": string,
  "type": string,
  "category": string,
  "description": string,
  "source": "rag" | "manual",
  "confidence": number?
}

Response:
{
  "success": boolean,
  "data": VariableMapping,
  "message": string
}
```

### 4. Frontend Components

#### RAGSuggestionPopup Component
```typescript
interface RAGSuggestionPopupProps {
  isOpen: boolean;
  suggestions: RAGSuggestion[];
  originalQuery: string;
  onAccept: (suggestion: RAGSuggestion) => void;
  onReject: () => void;
  onClose: () => void;
}
```

Features:
- Modal overlay with suggestions
- Confidence indicators
- Reasoning display
- Accept/Reject buttons
- Keyboard navigation support

#### useRAGSuggestions Hook
```typescript
interface UseRAGSuggestionsReturn {
  getSuggestions: (query: string) => Promise<void>;
  suggestions: RAGSuggestion[];
  isLoading: boolean;
  error: Error | null;
  reset: () => void;
}
```

### 5. Configuration

#### Environment Variables
```env
# RAG Pipeline Configuration
RAG_WEBHOOK_URL=https://your-rag-endpoint.com/suggest
RAG_API_KEY=your-api-key
RAG_TIMEOUT=30000
RAG_MAX_RETRIES=3

# Feature Flags
ENABLE_RAG_SUGGESTIONS=true
RAG_MIN_CONFIDENCE=0.7
```

### 6. Database Schema Update

```prisma
model VariableMapping {
  id          String   @id @default(cuid())
  korean      String
  english     String
  type        String
  category    String?
  description String?
  usage       String?
  tags        String[]
  source      String   @default("manual") // "manual", "rag", "import"
  confidence  Float?   // RAG confidence score
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@unique([korean, english])
  @@index([source])
}

model RAGSuggestionLog {
  id          String   @id @default(cuid())
  query       String
  suggestions Json
  accepted    Boolean
  acceptedId  String?  // Reference to created VariableMapping
  createdAt   DateTime @default(now())
}
```

### 7. Security Considerations

1. **API Key Management**: Store RAG API keys securely
2. **Rate Limiting**: Implement rate limiting for RAG requests
3. **Input Validation**: Sanitize all inputs before sending to RAG
4. **CORS Configuration**: Properly configure CORS for webhook calls
5. **Error Handling**: Don't expose internal errors to frontend

### 8. Performance Optimization

1. **Caching**: Cache RAG responses for repeated queries
2. **Debouncing**: Debounce search input to avoid excessive API calls
3. **Timeout Handling**: Set appropriate timeouts for RAG calls
4. **Fallback Strategy**: Have fallback when RAG is unavailable

### 9. User Experience

1. **Loading States**: Clear loading indicators during RAG processing
2. **Error Messages**: User-friendly error messages
3. **Suggestion Quality**: Show confidence scores to users
4. **Keyboard Shortcuts**: Support keyboard navigation in popup
5. **History**: Track and show previously suggested terms

### 10. Monitoring & Analytics

1. **Success Rate**: Track RAG suggestion acceptance rate
2. **Response Time**: Monitor RAG webhook performance
3. **Error Tracking**: Log and alert on RAG failures
4. **Usage Metrics**: Track feature usage statistics