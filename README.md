# Library Management System (LMS)

A full-stack web application for managing library operations with a modern, fintech-inspired design. Built with Laravel 11 (PHP) backend and React 19 frontend, featuring JWT authentication, role-based access control, and comprehensive book borrowing management.

## 🚀 Features

### Core Functionality
- **User Management**: Admin and regular user roles with secure authentication
- **Book Catalog**: Complete CRUD operations for books and authors
- **Borrowing System**: Track book loans with due dates and availability status
- **Search & Discovery**: Advanced search by title, author, or ISBN
- **Rating System**: 1-5 star ratings and reviews for books
- **Dashboard Analytics**: Real-time statistics and activity monitoring

### Technical Features
- **RESTful API**: Well-documented endpoints with proper HTTP status codes
- **JWT Authentication**: Secure token-based authentication with Laravel Sanctum
- **Role-Based Access**: Admin/User permissions throughout the application
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Real-time Updates**: React Query for efficient data fetching and caching
- **Docker Support**: Complete containerized development environment

## 🏗️ Architecture

### Backend (Laravel 11)
```
Laravel 11 Application
├── HTTP Layer (Routes, Controllers, Middleware)
├── Service Layer (Business Logic, Validation)
├── Data Layer (Eloquent Models, Migrations)
└── Infrastructure (Sanctum, MySQL, Queues)
```

### Frontend (React 19)
```
React 19 Application (Vite)
├── Components (Reusable UI Components)
├── Pages (Route-based Components)
├── Context (Authentication State)
├── Services (API Integration)
└── Utils (Helpers, Constants)
```

### Database Schema
- **Users**: Authentication and role management
- **Authors**: Book author information
- **Books**: Catalog with availability tracking
- **Borrowings**: Loan history and due dates
- **Ratings**: User reviews and star ratings

## 🛠️ Technology Stack

### Backend
- **Laravel 11**: PHP web framework
- **Laravel Sanctum**: JWT authentication
- **MySQL 8.0**: Relational database
- **Laravel Horizon**: Queue management
- **PHPUnit**: Testing framework

### Frontend
- **React 19**: JavaScript library
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Utility-first CSS
- **React Router**: Client-side routing
- **React Query**: Data fetching and caching
- **Axios**: HTTP client

### DevOps
- **Docker**: Containerization
- **Docker Compose**: Multi-service orchestration
- **Nginx**: Production web server
- **Redis**: Caching and sessions

## 📋 Prerequisites

- **Docker & Docker Compose** (recommended)
- **PHP 8.2+** (if running without Docker)
- **Node.js 18+** (if running without Docker)
- **Composer** (PHP dependency manager)
- **npm** (Node.js package manager)

## 🚀 Quick Start

### Using Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/YeisonRamirezt/library-management-system
   cd library-management-system
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   ```

3. **Start the application**
   ```bash
   docker-compose up -d --build
   ```

4. **Run database migrations**
   ```bash
   docker-compose exec app php artisan migrate
   ```

5. **Seed the database (optional)**
   ```bash
   docker-compose exec app php artisan db:seed
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - API: http://localhost:8000
   - Laravel Horizon: http://localhost:8000/horizon
   - MailHog: http://localhost:8025

### Manual Setup

#### Backend Setup
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
# Configure database in .env
php artisan migrate
php artisan db:seed
php artisan serve
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 🔐 Default Credentials

### Admin User
- **Email**: admin@lms.local
- **Password**: password

### Regular User
- **Email**: user@lms.local
- **Password**: password

## 📖 API Documentation

### Authentication Endpoints
- `POST /api/login` - User login
- `POST /api/register` - User registration
- `POST /api/logout` - User logout

### Book Management
- `GET /api/books` - List books with search/filter
- `POST /api/books` - Create book (Admin only)
- `GET /api/books/{id}` - Get book details
- `PUT /api/books/{id}` - Update book (Admin only)
- `DELETE /api/books/{id}` - Delete book (Admin only)

### Borrowing System
- `POST /api/borrow` - Borrow a book
- `POST /api/borrowings/{id}/return` - Return a book
- `GET /api/borrowings/active` - User's active borrowings

### Rating System
- `POST /api/books/{id}/rate` - Rate a book
- `GET /api/books/{id}/ratings` - Get book ratings

## 🧪 Testing

### Backend Tests
```bash
cd backend
php artisan test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📁 Project Structure

```
library-management-system/
├── backend/                 # Laravel API
│   ├── app/
│   ├── database/
│   ├── routes/
│   └── config/
├── frontend/               # React SPA
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   └── services/
│   └── public/
├── docker-compose.yml      # Docker services
├── .env.example           # Environment template
└── README.md
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
APP_NAME=LibraryManagementSystem
APP_ENV=local
APP_KEY=your-app-key
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=db
DB_PORT=3306
DB_DATABASE=lms
DB_USERNAME=lms_user
DB_PASSWORD=lms_password

REDIS_HOST=redis
MAIL_MAILER=smtp
MAIL_HOST=mailhog
```

#### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

## 🚀 Deployment

### Production Build
```bash
# Build frontend
cd frontend
npm run build

# Build backend
cd ../backend
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Docker Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Laravel Framework
- React.js
- Tailwind CSS
- Docker
- All contributors and maintainers

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

---

**Built with ❤️ for efficient library management**