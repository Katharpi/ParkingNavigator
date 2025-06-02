
# Running ParkSpace Pro on Debian Linux

This guide provides detailed step-by-step instructions for setting up and running the ParkSpace Pro parking management application on a Debian-based Linux system.

## Prerequisites

- Debian 11 (Bullseye) or later
- Root or sudo access
- Internet connection

## Step 1: Update System Packages

```bash
sudo apt update
sudo apt upgrade -y
```

## Step 2: Install Node.js (v20)

Install Node.js using NodeSource repository:

```bash
# Install dependencies
sudo apt install -y curl software-properties-common

# Add NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Install Node.js
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

## Step 3: Install Git

```bash
sudo apt install -y git
```

## Step 4: Install PostgreSQL

```bash
# Install PostgreSQL and additional packages
sudo apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verify PostgreSQL is running
sudo systemctl status postgresql
```

## Step 5: Configure PostgreSQL Database

### 5.1: Access PostgreSQL as superuser

```bash
sudo -u postgres psql
```

### 5.2: Create database and user

In the PostgreSQL prompt, execute these commands:

```sql
-- Create the database
CREATE DATABASE parkspace_pro;

-- Create a user with a secure password
CREATE USER parkspace_user WITH PASSWORD 'parkspace_secure_password_2024';

-- Grant all privileges on the database to the user
GRANT ALL PRIVILEGES ON DATABASE parkspace_pro TO parkspace_user;

-- Connect to the database
\c parkspace_pro

-- Grant schema permissions (this fixes the permission denied error)
GRANT ALL ON SCHEMA public TO parkspace_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO parkspace_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO parkspace_user;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO parkspace_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO parkspace_user;

-- Make the user owner of the public schema (recommended)
ALTER SCHEMA public OWNER TO parkspace_user;

-- Exit PostgreSQL
\q
```

### 5.3: Test database connection

```bash
# Test connection with the new user
psql -h localhost -U parkspace_user -d parkspace_pro -c "SELECT version();"
```

When prompted, enter the password: `parkspace_secure_password_2024`

## Step 6: Clone and Setup the Project

### 6.1: Clone the repository

```bash
# Navigate to your desired directory
cd ~
mkdir projects
cd projects

# Clone the repository (replace with actual repository URL)
git clone <your-repository-url> ParkingNavigator
cd ParkingNavigator
```

### 6.2: Install project dependencies

```bash
npm install
```

## Step 7: Configure Environment Variables

### 7.1: Create environment file

```bash
# Create .env file
touch .env
```

### 7.2: Add database configuration

Open the `.env` file with your preferred editor and add:

```env
# Database Configuration
DATABASE_URL=postgresql://parkspace_user:parkspace_secure_password_2024@localhost:5432/parkspace_pro

# Session Secret (generate a secure random string)
SESSION_SECRET=your-super-secure-session-secret-key-here-change-this-in-production

# Application Configuration
NODE_ENV=development
PORT=5000
```

**Important:** Replace `your-super-secure-session-secret-key-here-change-this-in-production` with a strong, random string for production use.

### 7.3: Generate a secure session secret (optional but recommended)

```bash
# Generate a random 32-character string for SESSION_SECRET
openssl rand -hex 32
```

Copy the output and replace the SESSION_SECRET value in your `.env` file.

## Step 8: Initialize Database Schema

```bash
# Push database schema to PostgreSQL
npm run db:push
```

**Expected output:**
```
✓ Pulling schema from database...
✓ Changes applied successfully!
```

If you encounter permission errors, ensure you completed Step 5.2 correctly.

## Step 9: Start the Application

### 9.1: Development mode

```bash
npm run dev
```

### 9.2: Production mode

```bash
# Build the application
npm run build

# Start in production mode
npm start
```

## Step 10: Access the Application

1. Open your web browser
2. Navigate to: `http://localhost:5000`
3. Use the demo credentials:
   - **Username:** `admin`
   - **Password:** `admin123`

## Step 11: Verify Installation

### 11.1: Check application logs

The terminal should show output similar to:
```
Server running on http://localhost:5000
Connected to PostgreSQL database
```

### 11.2: Test database connection

```bash
# Check if tables were created
psql -h localhost -U parkspace_user -d parkspace_pro -c "\dt"
```

You should see tables like `users`, `parking_spaces`, etc.

## Troubleshooting

### Database Permission Issues

If you encounter `permission denied for schema public`:

1. Reconnect to PostgreSQL as superuser:
   ```bash
   sudo -u postgres psql
   ```

2. Run these commands:
   ```sql
   \c parkspace_pro
   ALTER SCHEMA public OWNER TO parkspace_user;
   GRANT ALL ON SCHEMA public TO parkspace_user;
   ```

### Port Already in Use

If port 5000 is occupied:

1. Check what's using the port:
   ```bash
   sudo lsof -i :5000
   ```

2. Kill the process or change the port in your `.env` file:
   ```env
   PORT=3000
   ```

### Node.js Version Issues

Ensure you're using Node.js v18 or higher:
```bash
node --version
```

If the version is too old, repeat Step 2.

### PostgreSQL Connection Errors

1. Verify PostgreSQL is running:
   ```bash
   sudo systemctl status postgresql
   ```

2. Check PostgreSQL configuration:
   ```bash
   sudo -u postgres psql -c "SHOW config_file;"
   ```

3. Ensure PostgreSQL accepts local connections:
   ```bash
   sudo nano /etc/postgresql/*/main/pg_hba.conf
   ```
   
   Look for a line like:
   ```
   local   all             all                                     peer
   ```
   
   Make sure it allows `md5` authentication for your user.

## Additional Commands

### Database Management

```bash
# Open Drizzle Studio (database GUI)
npm run db:studio

# Reset database (WARNING: This will delete all data)
sudo -u postgres psql -c "DROP DATABASE parkspace_pro;"
sudo -u postgres psql -c "CREATE DATABASE parkspace_pro OWNER parkspace_user;"
npm run db:push
```

### Application Management

```bash
# Check application status
ps aux | grep node

# Stop the application (if running in background)
pkill -f "node.*index"

# View application logs (if running as service)
journalctl -u parkspace-pro -f
```

### System Resource Monitoring

```bash
# Check memory usage
free -h

# Check disk space
df -h

# Monitor system resources
htop
```

## Security Considerations for Production

1. **Change default passwords:**
   - Update the database user password
   - Generate a strong SESSION_SECRET

2. **Firewall configuration:**
   ```bash
   sudo ufw allow 5000/tcp
   sudo ufw enable
   ```

3. **SSL/HTTPS setup:**
   - Use a reverse proxy like Nginx
   - Obtain SSL certificates (Let's Encrypt)

4. **Environment variables:**
   - Never commit `.env` files to version control
   - Use environment-specific configuration

5. **Database security:**
   - Limit database user permissions
   - Enable PostgreSQL logging
   - Regular database backups

## Performance Optimization

1. **PostgreSQL tuning:**
   ```bash
   sudo nano /etc/postgresql/*/main/postgresql.conf
   ```
   
   Adjust these settings based on your system:
   ```
   shared_buffers = 256MB
   effective_cache_size = 1GB
   work_mem = 4MB
   ```

2. **Node.js optimization:**
   - Use PM2 for process management
   - Enable clustering for multi-core systems

## Support

For issues specific to this setup:

1. Check the application logs in the terminal
2. Verify database connectivity
3. Ensure all environment variables are set correctly
4. Check PostgreSQL logs: `/var/log/postgresql/postgresql-*-main.log`

---

**Note:** This guide assumes a clean Debian installation. Adjust steps as needed for your specific environment.
