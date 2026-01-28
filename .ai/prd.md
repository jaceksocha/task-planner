# Product Requirements Document: Task Planner

## 1. Overview

### 1.1 Project Name
**Task Planner** - An AI-enhanced task management application

### 1.2 Problem Statement
Modern professionals struggle with task organization and prioritization. Existing tools either lack intelligent features or are overly complex. Users need a simple, intuitive task manager that leverages AI to help them plan, prioritize, and complete tasks efficiently.

### 1.3 Vision
Create a streamlined task management application that combines clean UI with AI-powered features to help users manage their daily work more effectively.

---

## 2. User Personas

### 2.1 Primary Persona: Professional Worker
- **Name:** Alex, 32
- **Role:** Software Developer / Knowledge Worker
- **Goals:**
  - Organize daily tasks efficiently
  - Prioritize work based on deadlines and importance
  - Track progress on multiple projects
- **Pain Points:**
  - Forgetting tasks or deadlines
  - Difficulty estimating task duration
  - Overwhelmed by long task lists

### 2.2 Secondary Persona: Student
- **Name:** Maya, 22
- **Role:** University Student
- **Goals:**
  - Manage assignments and deadlines
  - Balance coursework with personal tasks
- **Pain Points:**
  - Procrastination
  - Poor time estimation

---

## 3. Core Features (MVP Scope)

### 3.1 Task Management
- **Create Tasks:** Title, description, due date, priority
- **Edit Tasks:** Modify any task property
- **Delete Tasks:** Remove completed or cancelled tasks
- **View Tasks:** List view with filtering and sorting

### 3.2 Task Organization
- **Categories:** Group tasks by project or area
- **Priority Levels:** High, Medium, Low
- **Status:** To Do, In Progress, Done
- **Due Dates:** Date picker with deadline tracking

### 3.3 User Authentication
- **Sign Up:** Email/password registration
- **Sign In:** Secure login
- **Session Management:** Persistent sessions via Supabase Auth

### 3.4 AI Features (Lesson 21)
- **Task Description Generator:** AI suggests detailed descriptions
- **Priority Suggestions:** AI recommends priority based on context
- **Task Summarization:** Weekly summary of completed work

---

## 4. Out of Scope (Post-MVP)

- Team collaboration / shared tasks
- Mobile native apps
- Calendar integrations
- Time tracking
- Recurring tasks
- File attachments
- Notifications / reminders

---

## 5. Success Criteria

### 5.1 Functional Requirements
- [ ] User can register and log in
- [ ] User can create, read, update, delete tasks
- [ ] Tasks can be filtered by status, priority, category
- [ ] Tasks can be sorted by due date, priority, created date
- [ ] AI can generate task descriptions (OpenRouter integration)

### 5.2 Non-Functional Requirements
- **Performance:** Page load < 2s
- **Accessibility:** WCAG 2.1 AA compliance
- **Security:** RLS policies protect user data
- **Responsiveness:** Works on desktop and mobile browsers

### 5.3 Technical Milestones
1. Database schema with RLS policies
2. REST API endpoints for CRUD operations
3. UI with task list and detail views
4. AI integration via OpenRouter

---

## 6. User Stories

### Authentication
- As a user, I want to sign up so I can save my tasks
- As a user, I want to log in so I can access my tasks from any device
- As a user, I want to log out to secure my account

### Task Management
- As a user, I want to create a task with title and due date
- As a user, I want to edit a task to update its details
- As a user, I want to mark a task as complete
- As a user, I want to delete tasks I no longer need

### Organization
- As a user, I want to filter tasks by status to focus on what needs doing
- As a user, I want to sort tasks by priority to work on important items first
- As a user, I want to assign categories to organize my tasks

### AI Features
- As a user, I want AI to suggest a task description based on the title
- As a user, I want AI to recommend a priority level for my task

---

## 7. Technical Constraints

- **Frontend:** Astro 5, React 19, TypeScript 5
- **Styling:** Tailwind CSS 4, Shadcn/ui
- **Backend:** Supabase (PostgreSQL, Auth, Edge Functions)
- **AI:** OpenRouter (Gemini Flash or similar free model)
- **Deployment:** Vercel or similar (future)

---

## 8. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| OpenRouter API costs | Medium | Use free tier models, set spending limits |
| Supabase free tier limits | Low | 2 free projects sufficient for MVP |
| Complex AI responses | Medium | Use structured outputs (JSON schema) |
| Performance with many tasks | Low | Implement pagination |

---

## 9. Timeline

This document serves as the foundation for the 10X2 course module:
- **Lesson 16:** PRD & Tech Stack (this document)
- **Lesson 17:** AI Rules (completed)
- **Lesson 18:** Database Schema
- **Lesson 19:** REST API
- **Lesson 20:** UI Implementation
- **Lesson 21:** AI Integration
