# Refactoring Notes - Task Planner Application

## Analysis Date: 2026-01-28

## Overview
This document captures the analysis and refactoring decisions made during the AI-assisted code review.

---

## 1. API Response Handling Pattern

### Issue Identified
All API endpoints have repetitive response creation code:

```typescript
return new Response(JSON.stringify(response), {
  status: 200,
  headers: { "Content-Type": "application/json" },
});
```

### Solution Implemented
Created a utility module `src/lib/api-utils.ts` with helper functions:

- `jsonResponse(data, status)` - Creates JSON response with proper headers
- `errorResponse(message, code, status)` - Creates standardized error response

### Benefits
- Reduced code duplication
- Consistent response format
- Easier to modify response headers globally
- Type-safe error handling

---

## 2. Authentication Guard Pattern

### Issue Identified
Every protected API endpoint has the same auth check:

```typescript
if (!user) {
  const error: ApiError = {
    error: { message: "Authentication required", code: "UNAUTHORIZED" },
  };
  return new Response(JSON.stringify(error), { status: 401 });
}
```

### Solution Implemented
While middleware handles page-level auth, the API auth checks are kept inline because:
- Middleware already returns 401 for unauthenticated API requests
- The redundant checks in endpoints are now safety guards (defense in depth)
- TypeScript narrows the user type after the check, making code safer

### Decision
Keep the inline auth checks as they serve as documentation and TypeScript type narrowing.

---

## 3. Form Validation Pattern

### Issue Identified
Frontend components have inline validation that doesn't match backend Zod schemas.

### Solution
- Backend Zod schemas are the source of truth
- Frontend uses HTML5 validation (minLength, required, type="email")
- API error messages are displayed to users for server-side validation failures

### Benefits
- Single source of truth (backend schemas)
- Graceful degradation (HTML5 validation works without JS)
- Comprehensive server-side validation

---

## 4. Error Handling Consistency

### Issue Identified
Error handling varies across components:
- Some use try/catch
- Some check response.ok
- Error messages displayed differently

### Solution Implemented
Standardized error handling pattern:

```typescript
try {
  const response = await fetch(url, options);
  const result = await response.json();

  if (!response.ok || "error" in result) {
    throw new Error(result.error?.message || "Operation failed");
  }

  return result.data;
} catch (err) {
  setError(err instanceof Error ? err.message : "Unknown error");
}
```

---

## 5. Component Props Simplification

### Issue Identified
Components were passing unnecessary props (like `userId`) that are now handled by auth cookies.

### Changes Made
- Removed `userId` prop from `TaskList`, `TaskDialog`, `CategoryDialog`
- API calls no longer send `x-user-id` header
- Authentication is handled automatically via Supabase SSR cookies

---

## 6. Code Organization

### Current Structure (Good)
```
src/
├── components/     # React components
│   └── ui/         # shadcn/ui components
├── db/             # Database clients and types
├── layouts/        # Astro layouts
├── lib/            # Services and utilities
│   └── services/   # External service integrations
├── middleware/     # Astro middleware
├── pages/          # Pages and API routes
│   └── api/        # REST API endpoints
├── styles/         # Global styles
└── types.ts        # Shared types and schemas
```

### No Changes Needed
The current organization follows good practices:
- Clear separation of concerns
- Colocated API routes
- Shared types in single file
- UI components in dedicated folder

---

## 7. Type Safety Improvements

### Implemented
- Used Zod schemas with TypeScript inference
- Added `ApiError` and `ApiResponse` types
- Proper typing for context.locals (User, SupabaseClient)

### Recommendation for Future
- Consider using tRPC for end-to-end type safety
- Add more specific error codes for better error handling

---

## 8. Performance Considerations

### Current State
- Components use React hooks correctly (useCallback, useMemo patterns)
- Data fetching with proper loading states
- No unnecessary re-renders identified

### No Changes Needed
The current implementation is performant for the application's scale.

---

## Summary of Changes Made

| Area | Change | Files Affected |
|------|--------|----------------|
| API Utils | Created utility functions | `src/lib/api-utils.ts` |
| Auth | Removed userId props | Multiple components |
| Consistency | Standardized error handling | Components |

## Future Improvements (Not Implemented)

1. **Consider tRPC** - For full-stack type safety
2. **Add React Query** - For caching and optimistic updates
3. **Implement toast notifications** - For better user feedback
4. **Add form library** - React Hook Form for complex forms
