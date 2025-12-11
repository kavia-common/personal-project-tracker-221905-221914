# Lightweight React Template for KAVIA

This project provides a minimal React template now adapted for a Personal Project Tracker.

## Backend Integration

- The frontend expects a FastAPI server at http://localhost:3001
- Endpoints used:
  - GET /projects, POST /projects, PUT /projects/{id}, DELETE /projects/{id}
  - GET /projects/{project_id}/tasks, POST /projects/{project_id}/tasks
  - PUT /projects/{project_id}/tasks/{task_id}, DELETE /projects/{project_id}/tasks/{task_id}
  - POST /projects/{project_id}/tasks/{task_id}/toggle
  - GET /dashboard

Update src/api.js if your backend base URL differs.

## Getting Started

In the project directory, you can run:

### `npm start`

Runs the app in development mode.\
Open http://localhost:3000 to view it in your browser.

### `npm test`

Launches the test runner in interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder.
