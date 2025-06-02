# ParkSpace Pro 🚗

A modern parking management web application built with React, Express, and PostgreSQL. Features real-time parking space tracking, user authentication, and an intuitive graphical interface for managing parking facilities.

## Features

- **Real-time Parking Management**: Visual parking grid showing space availability
- **User Authentication**: Secure username/password authentication with session management
- **Interactive Dashboard**: Click parking spaces to toggle between available/occupied/maintenance status
- **Analytics & Stats**: Real-time occupancy rates and parking statistics
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Green Theme**: Modern UI with a clean green color scheme

## Demo Credentials

- **Username**: `admin`
- **Password**: `admin123`

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **TailwindCSS** for styling
- **shadcn/ui** for component library
- **TanStack Query** for data fetching and caching
- **Wouter** for client-side routing
- **Lucide React** for icons

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **Drizzle ORM** for database operations
- **PostgreSQL** for data storage
- **Express Sessions** for authentication
- **Zod** for data validation

## Project Structure

```
parking-management/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── ui/         # shadcn/ui components
│   │   │   ├── parking-grid.tsx
│   │   │   └── stats-cards.tsx
│   │   ├── hooks/          # Custom React hooks
│   │   │   ├── useAuth.ts
│   │   │   └── use-toast.ts
│   │   ├── lib/            # Utility functions
│   │   │   ├── queryClient.ts
│   │   │   ├── authUtils.ts
│   │   │   └── utils.ts
│   │   ├── pages/          # Application pages
│   │   │   ├── landing.tsx
│   │   │   ├── dashboard.tsx
│   │   │   └── not-found.tsx
│   │   ├── App.tsx         # Main app component
│   │   ├── index.css       # Global styles
│   │   └── main.tsx        # App entry point
│   └── index.html
├── server/                 # Backend Express application
│   ├── auth.ts            # Authentication middleware
│   ├── db.ts              # Database connection
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Database operations
│   └── vite.ts            # Vite development server
├── shared/                # Shared types and schemas
│   └── schema.ts          # Database schema and validation
├── package.json           # Dependencies and scripts
├── drizzle.config.ts      # Database configuration
├── tailwind.config.ts     # TailwindCSS configuration
├── tsconfig.json          # TypeScript configuration
└── vite.config.ts         # Vite configuration
```

## Prerequisites

- **Node.js** (version 18 or higher)
- **PostgreSQL** (version 12 or higher)
- **npm** or **yarn** package manager

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd parking-management
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

#### Option A: Local PostgreSQL

1. **Install PostgreSQL** on your system:

   **Windows:**
   ```bash
   # Download and install from https://www.postgresql.org/download/windows/
   # Or using Chocolatey:
   choco install postgresql
   ```

   **macOS:**
   ```bash
   # Using Homebrew:
   brew install postgresql
   brew services start postgresql
   ```

   **Linux (Ubuntu/Debian):**
   ```bash
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   sudo systemctl start postgresql
   sudo systemctl enable postgresql
   ```

2. **Create Database:**
   ```bash
   # Connect to PostgreSQL
   sudo -u postgres psql

   # Create database and user
   CREATE DATABASE parkspace_pro;
   CREATE USER parkspace_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE parkspace_pro TO parkspace_user;
   \q
   ```

3. **Set Environment Variables:**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=postgresql://parkspace_user:your_password@localhost:5432/parkspace_pro
   SESSION_SECRET=your-secret-key-here
   ```

#### Option B: Using Cloud PostgreSQL (Recommended)

Use services like Neon, Supabase, or Railway for easier setup:

1. Create a PostgreSQL database on your preferred service
2. Copy the connection string
3. Set environment variables:
   ```env
   DATABASE_URL=your-cloud-postgresql-url
   SESSION_SECRET=your-secret-key-here
   ```

### 4. Database Migration

Push the database schema:

```bash
npm run db:push
```

### 5. Start the Application

```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Platform-Specific Instructions

### Windows

1. **Install Node.js**: Download from [nodejs.org](https://nodejs.org/)
2. **Install PostgreSQL**: Download from [postgresql.org](https://www.postgresql.org/download/windows/)
3. **Use Command Prompt or PowerShell**:
   ```cmd
   git clone <repository-url>
   cd parking-management
   npm install
   npm run db:push
   npm run dev
   ```

### macOS

1. **Install Homebrew** (if not installed):
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. **Install dependencies**:
   ```bash
   brew install node postgresql git
   brew services start postgresql
   ```

3. **Setup project**:
   ```bash
   git clone <repository-url>
   cd parking-management
   npm install
   npm run db:push
   npm run dev
   ```

### Linux

1. **Install dependencies** (Ubuntu/Debian):
   ```bash
   # Update package list
   sudo apt update

   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Install PostgreSQL
   sudo apt install postgresql postgresql-contrib

   # Install Git (if not installed)
   sudo apt install git
   ```

2. **Setup project**:
   ```bash
   git clone <repository-url>
   cd parking-management
   npm install
   npm run db:push
   npm run dev
   ```

## Available Scripts

- `npm run dev` - Start development server (frontend + backend)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run db:push` - Push database schema changes
- `npm run db:studio` - Open Drizzle Studio (database GUI)

## How It Works

### Authentication Flow

1. **Login/Register**: Users can create accounts or log in with existing credentials
2. **Session Management**: Server maintains user sessions using PostgreSQL store
3. **Protected Routes**: API endpoints require authentication
4. **Auto-logout**: Sessions expire after inactivity

### Parking Management

1. **Space Visualization**: Parking spaces are displayed in a grid layout organized by sections (A, B, C)
2. **Status Toggle**: Click any parking space to cycle through statuses:
   - 🟢 **Available** - Ready for parking
   - 🔴 **Occupied** - Currently in use
   - 🟡 **Maintenance** - Under maintenance (non-clickable)
3. **Real-time Updates**: Changes are immediately reflected across all connected clients
4. **Analytics**: Dashboard shows live statistics including occupancy rates

### Database Schema

#### Users Table
- `id` - Primary key (auto-increment)
- `username` - Unique username for login
- `password` - Plain text password (note: consider hashing in production)
- `email` - Optional email address
- `first_name`, `last_name` - Optional user details
- `created_at`, `updated_at` - Timestamps

#### Parking Spaces Table
- `id` - Primary key
- `space_number` - Unique identifier (e.g., "A1", "B2")
- `section` - Parking section (A, B, C)
- `status` - Current status (available/occupied/maintenance)
- `last_updated` - Last status change timestamp
- `occupied_by` - Optional field for tracking who occupies the space

#### Parking History Table
- `id` - Primary key
- `space_id` - Reference to parking space
- `action` - Action performed (occupied/freed/maintenance)
- `timestamp` - When the action occurred
- `user_id` - Who performed the action

### API Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/user` - Get current user
- `POST /api/auth/logout` - User logout

#### Parking Management
- `GET /api/parking/spaces` - Get all parking spaces
- `GET /api/parking/stats` - Get parking statistics
- `PATCH /api/parking/spaces/:id` - Update parking space status
- `POST /api/parking/spaces` - Create new parking space
- `GET /api/parking/history` - Get recent parking history

## Security Considerations

⚠️ **Important**: This is a demo application. For production use, consider:

- Hash passwords using bcrypt or similar
- Use HTTPS in production
- Implement rate limiting
- Add input sanitization
- Use environment variables for all secrets
- Implement proper error handling
- Add request validation middleware

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:

1. Check the existing issues in the repository
2. Create a new issue with detailed description
3. Include steps to reproduce any bugs
4. Provide system information (OS, Node.js version, etc.)

---

Built with ❤️ using modern web technologies