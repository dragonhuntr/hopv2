# Project Structure

This project follows a clean and organized structure for better maintainability and scalability:

```
src/
├── app/                    # Next.js app router pages
│   ├── (auth)/            # Authentication routes
│   │   ├── login/         # Login page
│   │   └── register/      # Registration page
│   ├── (dashboard)/       # Protected routes
│   │   └── chat/         # Chat functionality
│   ├── api/               # API routes
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/
│   ├── auth/             # Authentication components
│   ├── chat/             # Chat-related components
│   ├── layout/           # Layout components
│   └── ui/               # Reusable UI components
├── lib/                  # Core utilities
│   ├── auth/             # Auth-related utilities
│   ├── api/              # API-related utilities
│   └── utils/            # General utilities
├── types/                # TypeScript type definitions
├── server/               # Server-side code
│   ├── auth/             # Auth-related server code
│   ├── api/              # API-related server code
│   └── db/               # Database operations
├── prisma/               # Prisma schema and queries
│   └── migrations/       # Prisma migrations
└── public/               # Public assets
    └── favicon.ico       # Favicon

```

## Directory Purposes

### App Directory
- Contains all Next.js pages and API routes
- Uses route groups for better organization
- Separates authenticated and public routes

### Components Directory
- Reusable React components
- Organized by feature/domain
- UI components separated for better reusability

### Library Directory
- Core utilities and configurations
- Feature-specific utilities
- General helper functions

### Server Directory
- Server-side logic
- Database operations
- Authentication handlers

### Types Directory
- TypeScript type definitions
- Shared types across the application 