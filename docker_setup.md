# Docker Compose Setup for Library Management System

## Overview
This Docker Compose setup provides a complete development environment with:
- Laravel 11 backend API
- MySQL 8.0 database
- React 19 frontend with Vite
- Redis for queue management
- Laravel Horizon for queue monitoring
- Nginx for serving the React app

## Services

### 1. Laravel Backend (app)
```yaml
app:
  build:
    context: ./backend
    dockerfile: Dockerfile
  container_name: lms-backend
  restart: unless-stopped
  working_dir: /var/www
  volumes:
    - ./backend:/var/www
    - /var/www/vendor
  networks:
    - lms-network
  depends_on:
    - db
    - redis
  environment:
    - APP_NAME=LibraryManagementSystem
    - APP_ENV=local
    - APP_KEY=${APP_KEY}
    - APP_DEBUG=true
    - APP_URL=http://localhost:8000

    - DB_CONNECTION=mysql
    - DB_HOST=db
    - DB_PORT=3306
    - DB_DATABASE=lms
    - DB_USERNAME=lms_user
    - DB_PASSWORD=lms_password

    - REDIS_HOST=redis
    - REDIS_PASSWORD=null
    - REDIS_PORT=6379

    - MAIL_MAILER=smtp
    - MAIL_HOST=mailhog
    - MAIL_PORT=1025
    - MAIL_USERNAME=null
    - MAIL_PASSWORD=null
    - MAIL_ENCRYPTION=null
    - MAIL_FROM_ADDRESS=noreply@lms.local
    - MAIL_FROM_NAME="${APP_NAME}"
```

### 2. MySQL Database (db)
```yaml
db:
  image: mysql:8.0
  container_name: lms-mysql
  restart: unless-stopped
  environment:
    MYSQL_ROOT_PASSWORD: root_password
    MYSQL_DATABASE: lms
    MYSQL_USER: lms_user
    MYSQL_PASSWORD: lms_password
  ports:
    - "3306:3306"
  volumes:
    - mysql_data:/var/lib/mysql
    - ./docker/mysql/init.sql:/docker-entrypoint-initdb.d/init.sql
  networks:
    - lms-network
  command: --default-authentication-plugin=mysql_native_password
```

### 3. Redis (redis)
```yaml
redis:
  image: redis:7-alpine
  container_name: lms-redis
  restart: unless-stopped
  ports:
    - "6379:6379"
  volumes:
    - redis_data:/data
  networks:
    - lms-network
```

### 4. React Frontend (frontend)
```yaml
frontend:
  build:
    context: ./frontend
    dockerfile: Dockerfile
  container_name: lms-frontend
  restart: unless-stopped
  ports:
    - "3000:3000"
  volumes:
    - ./frontend:/app
    - /app/node_modules
  networks:
    - lms-network
  environment:
    - VITE_API_BASE_URL=http://localhost:8000/api
  depends_on:
    - app
```

### 5. Nginx (nginx)
```yaml
nginx:
  image: nginx:alpine
  container_name: lms-nginx
  restart: unless-stopped
  ports:
    - "80:80"
  volumes:
    - ./frontend/dist:/usr/share/nginx/html
    - ./docker/nginx/nginx.conf:/etc/nginx/nginx.conf
  networks:
    - lms-network
  depends_on:
    - frontend
```

### 6. Laravel Horizon (horizon)
```yaml
horizon:
  build:
    context: ./backend
    dockerfile: Dockerfile
  container_name: lms-horizon
  restart: unless-stopped
  working_dir: /var/www
  volumes:
    - ./backend:/var/www
    - /var/www/vendor
  networks:
    - lms-network
  depends_on:
    - db
    - redis
  environment:
    - APP_NAME=LibraryManagementSystem
    - APP_ENV=local
    - APP_KEY=${APP_KEY}
    - DB_CONNECTION=mysql
    - DB_HOST=db
    - DB_PORT=3306
    - DB_DATABASE=lms
    - DB_USERNAME=lms_user
    - DB_PASSWORD=lms_password
    - REDIS_HOST=redis
  command: php artisan horizon
```

### 7. MailHog (mailhog)
```yaml
mailhog:
  image: mailhog/mailhog:latest
  container_name: lms-mailhog
  restart: unless-stopped
  ports:
    - "1025:1025"
    - "8025:8025"
  networks:
    - lms-network
```

## Volumes
```yaml
volumes:
  mysql_data:
  redis_data:
```

## Networks
```yaml
networks:
  lms-network:
    driver: bridge
```

## Dockerfiles

### Backend Dockerfile
```dockerfile
FROM php:8.2-fpm-alpine

# Install system dependencies
RUN apk add --no-cache \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    mysql-client

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Copy composer files
COPY composer.json composer.lock ./

# Install dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Copy application code
COPY . .

# Set permissions
RUN chown -R www-data:www-data /var/www \
    && chmod -R 755 /var/www/storage \
    && chmod -R 755 /var/www/bootstrap/cache

EXPOSE 9000
CMD ["php-fpm"]
```

### Frontend Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
```

## Environment Variables

Create a `.env` file in the root directory:
```bash
# Application
APP_NAME=LibraryManagementSystem
APP_ENV=local
APP_KEY=base64:your_app_key_here
APP_DEBUG=true
APP_URL=http://localhost:8000

# Database
DB_CONNECTION=mysql
DB_HOST=db
DB_PORT=3306
DB_DATABASE=lms
DB_USERNAME=lms_user
DB_PASSWORD=lms_password

# Redis
REDIS_HOST=redis
REDIS_PASSWORD=null
REDIS_PORT=6379

# Mail
MAIL_MAILER=smtp
MAIL_HOST=mailhog
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS=noreply@lms.local
MAIL_FROM_NAME="${APP_NAME}"

# Frontend
VITE_API_BASE_URL=http://localhost:8000/api
```

## Setup Instructions

1. **Clone the repository and navigate to the project directory**

2. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

3. **Generate Laravel application key:**
   ```bash
   docker-compose run --rm app php artisan key:generate
   ```

4. **Build and start the containers:**
   ```bash
   docker-compose up -d --build
   ```

5. **Run database migrations:**
   ```bash
   docker-compose exec app php artisan migrate
   ```

6. **Seed the database (optional):**
   ```bash
   docker-compose exec app php artisan db:seed
   ```

7. **Install frontend dependencies:**
   ```bash
   docker-compose exec frontend npm install
   ```

## Access Points

- **Laravel API**: http://localhost:8000
- **React Frontend**: http://localhost:3000
- **Nginx (Production build)**: http://localhost
- **Laravel Horizon**: http://localhost:8000/horizon
- **MailHog**: http://localhost:8025
- **phpMyAdmin** (if added): http://localhost:8080

## Useful Commands

### Start all services
```bash
docker-compose up -d
```

### Stop all services
```bash
docker-compose down
```

### View logs
```bash
docker-compose logs -f [service_name]
```

### Execute commands in containers
```bash
# Laravel commands
docker-compose exec app php artisan [command]

# Frontend commands
docker-compose exec frontend npm [command]
```

### Rebuild specific service
```bash
docker-compose up -d --build [service_name]
```

## Development Workflow

1. **Backend development:**
   - Code changes are reflected immediately due to volume mounting
   - Run migrations: `docker-compose exec app php artisan migrate`
   - Clear cache: `docker-compose exec app php artisan config:clear`

2. **Frontend development:**
   - Hot reload is enabled through Vite
   - Access at http://localhost:3000 during development

3. **Database management:**
   - Access MySQL: `docker-compose exec db mysql -u lms_user -p lms`
   - View data: Use any MySQL client connecting to localhost:3306

4. **Queue management:**
   - Monitor queues: Access Horizon at http://localhost:8000/horizon
   - Process queues: Already handled by Horizon container

## Production Deployment

For production deployment:

1. **Build optimized frontend:**
   ```bash
   docker-compose exec frontend npm run build
   ```

2. **Use production Docker Compose file:**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Set production environment variables:**
   - APP_ENV=production
   - APP_DEBUG=false
   - APP_KEY=secure_key
   - DB credentials for production database

This Docker setup provides a complete, isolated development environment that mirrors production while maintaining development convenience.