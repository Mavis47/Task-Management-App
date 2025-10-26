# Task-Management-App

A web application to manage tasks with file attachments. Users can create, update, delete tasks, and upload/view associated documents. Admins can assign tasks to users.

---

## Features
- User authentication (JWT)
- Role-based access (Admin vs User)
- CRUD operations for tasks
- File upload for task documents (max 5 per task)
- Search, filter, and pagination
- Assign tasks to other users (Admin only)
- View uploaded files for each task

---

## Project Structure

### Backend
/backend
├─ controllers/ # API controllers
├─ routes/ # API route definitions
├─ middleware/ # Authentication & validation middleware
├─ prisma/ # Prisma ORM schema and migrations
└─ server.ts # Express server entry point

shell
Copy code

### Frontend
/frontend
├─ src/components/ # Reusable UI components
├─ src/pages/ # Page components (UserPanel, Login, etc.)
├─ src/hooks/ # Custom React hooks (e.g., useAuth)
└─ src/api/ # Axios API calls

yaml
Copy code

---

## Setup Instructions

### Backend

1. Install dependencies:
```bash
cd backend
npm install
Create a .env file with your database URL and JWT secret:

DATABASE_URL="postgresql://username:password@localhost:5432/dbname"
JWT_SECRET="your_jwt_secret"
Run Prisma migrations:


npx prisma migrate dev --name init
Start the backend server:

npm run dev
Frontend
Install dependencies:

cd frontend
npm install
Start the frontend server:

bash
Copy code
npm run dev
Open your browser at http://localhost:5173 (or your Vite default port).

API Documentation
The API is fully documented in Postman. You can view it here:
[Postman API Documentation] -> https://documenter.getpostman.com/view/46726798/2sB3Wk14a2

Usage: Import → Select file → Test all endpoints.

Design Decisions
Frontend: React + Vite for fast, modular development.

Backend: Express.js with Prisma ORM for structured and type-safe DB interactions.

File Uploads: Handled using Multer, stored in /uploads.

Authentication: JWT-based, role-specific access control.

Pagination & Sorting: Implemented on frontend to handle large datasets efficiently.

Admin vs User: Admin can assign tasks and manage all tasks. Users can manage only their tasks.

Usage
Login: Use admin or user credentials.

Create Task: Add title, description, status, priority, due date, and files (max 5).

Edit Task: Update title, description, status, priority, and files.

Delete Task: Admin or task owner can delete a task.

View Files: Click on the "Files" column to see uploaded documents.

Search & Filter: Search by title, user email, or assigner email.

Pagination: Navigate pages using Next/Prev buttons.

