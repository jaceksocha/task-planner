# Test Plan - Task Planner Application

## Overview
This document outlines the testing strategy for the Task Planner application, covering unit tests (Vitest) and end-to-end tests (Playwright).

## Unit Tests (Vitest)

### 1. Types & Schemas (`src/__tests__/types.test.ts`)
- **Zod Schema Validation**
  - CreateTaskSchema: valid/invalid inputs
  - UpdateTaskSchema: valid/invalid inputs
  - CreateCategorySchema: valid/invalid inputs
  - UpdateCategorySchema: valid/invalid inputs
  - TaskQuerySchema: filter parameters validation

### 2. OpenRouter Service (`src/__tests__/openrouter.test.ts`)
- **Service Initialization**
  - Should create service with valid API key
  - Should return null without API key
- **Chat Functionality**
  - Should send chat messages correctly
  - Should handle API errors gracefully
- **AI Suggestions**
  - suggestTaskDescription: returns valid description
  - suggestPriority: returns valid priority values
  - improveDescription: returns improved text

### 3. API Endpoint Handlers (`src/__tests__/api/`)
- **Tasks API** (`tasks.test.ts`)
  - GET /api/tasks: list tasks with filters
  - POST /api/tasks: create task
  - GET /api/tasks/:id: get single task
  - PUT /api/tasks/:id: update task
  - DELETE /api/tasks/:id: delete task
  - Authentication required for all endpoints

- **Categories API** (`categories.test.ts`)
  - GET /api/categories: list categories
  - POST /api/categories: create category
  - PUT /api/categories/:id: update category
  - DELETE /api/categories/:id: delete category
  - Unique name constraint validation

- **Auth API** (`auth.test.ts`)
  - POST /api/auth/register: user registration
  - POST /api/auth/login: user login
  - POST /api/auth/logout: user logout

## E2E Tests (Playwright)

### 1. Authentication Flow (`e2e/auth.spec.ts`)
- User can register with valid credentials
- User can login with valid credentials
- User cannot login with invalid credentials
- User can logout
- Protected routes redirect to login

### 2. Task Management (`e2e/tasks.spec.ts`)
- User can create a new task
- User can view task list
- User can edit a task
- User can mark task as complete
- User can delete a task
- Task filters work correctly

### 3. Category Management (`e2e/categories.spec.ts`)
- User can create a category
- User can edit a category
- User can delete a category
- Categories appear in task form

## Test Data

### Test Users
- E2E tests use dedicated test user credentials from environment variables:
  - `E2E_USERNAME`: Test user email
  - `E2E_PASSWORD`: Test user password

### Mock Data
- Unit tests use mocked Supabase client
- Mocked responses match actual API response structure

## Running Tests

```bash
# Unit tests
npm test              # Run once
npm run test:ui       # Interactive UI
npm run test:coverage # With coverage report

# E2E tests
npm run test:e2e      # Run all E2E tests
npx playwright test --headed  # Run with browser visible
```

## Coverage Goals
- Unit tests: >80% coverage for services and utilities
- E2E tests: All critical user flows covered
