# Snake Game - Multiplayer Ready

A modern Snake game built with React and Next.js, featuring authentication, leaderboard, and spectator mode. Ready for multiplayer backend integration with Python FastAPI.

## Features

- **Classic Snake Gameplay**: Control the snake with arrow keys or WASD
- **Wall Wrapping**: Snake passes through walls and appears on the opposite side
- **Visual Distinction**: Snake head is a different color than the body
- **Authentication**: Login and signup functionality
- **Leaderboard**: Track high scores across all players
- **Spectator Mode**: Watch other players in real-time
- **Fully Tested**: Comprehensive test coverage for game logic and API

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to start playing.

## Demo Credentials

- Email: `snake@master.com`
- Password: `password123`

## Testing

Run the test suite:

\`\`\`bash
npm test
\`\`\`

Run tests with coverage:

\`\`\`bash
npm run test:coverage
\`\`\`

## Project Structure

\`\`\`
├── app/                    # Next.js app directory
├── components/             # React components
│   ├── auth/              # Authentication components
│   ├── snake-game/        # Game components
│   ├── leaderboard/       # Leaderboard components
│   └── spectator/         # Spectator mode components
├── lib/
│   ├── api/               # API layer (centralized backend calls)
│   │   ├── types.ts       # TypeScript types
│   │   └── mock-api.ts    # Mock API (replace with FastAPI)
│   ├── game/              # Game engine logic
│   └── hooks/             # React hooks
└── __tests__/             # Test files
\`\`\`

## Backend Integration

All backend calls are centralized in `lib/api/mock-api.ts`. To integrate with your Python FastAPI backend:

1. Keep the types in `lib/api/types.ts`
2. Replace the mock implementations in `lib/api/mock-api.ts` with real API calls
3. Update the base URL to point to your FastAPI server
4. Implement the same endpoints in your FastAPI backend

### API Endpoints to Implement

**Authentication:**
- `POST /api/auth/login` - Login with email and password
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

**Leaderboard:**
- `GET /api/leaderboard?limit=10` - Get top scores
- `POST /api/leaderboard` - Submit score

**Game Sessions:**
- `GET /api/sessions` - Get active game sessions
- `GET /api/sessions/:id` - Get specific session
- `POST /api/sessions` - Create new session
- `PATCH /api/sessions/:id` - Update session
- `DELETE /api/sessions/:id` - End session

## Game Controls

- **Arrow Keys** or **WASD**: Move the snake
- **Space**: Pause/Resume
- **Reset Button**: Start a new game

## Technologies

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Zustand (state management)
- Jest & React Testing Library
- shadcn/ui components
