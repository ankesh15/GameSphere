# GameSphere Frontend

React + TypeScript + Vite client for the GameSphere platform.

## Setup
1. Install dependencies:
   - `npm install`
2. Start the dev server:
   - `npm run dev`

## Environment
- `VITE_API_BASE_URL` (optional): Base URL for the REST API.

## Structure
- `src/api/`: Axios API layer
- `src/components/`: UI components and route guards
- `src/pages/`: Auth and protected views
- `src/store/`: Zustand global store
- `src/App.tsx`: Routes and layouts

## Stack
- Tailwind CSS for styling
- Zustand for global state
- Axios API client with refresh handling
