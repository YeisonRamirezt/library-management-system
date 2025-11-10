# Library Management System API Endpoints

## Authentication Endpoints

### POST /api/login
Authenticate user and return JWT token
**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password"
}
```
**Response:**
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "library_id": "LIB001",
    "role": "user"
  },
  "token": "jwt_token_here"
}
```

### POST /api/register
Register new user (Admin only)
**Request Body:**
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "library_id": "LIB001",
  "password": "password",
  "password_confirmation": "password"
}
```

### POST /api/logout
Logout user and invalidate token
**Headers:** Authorization: Bearer {token}

## User Management Endpoints (Admin Only)

### GET /api/users
Get all users with pagination
**Query Parameters:** page, per_page
**Headers:** Authorization: Bearer {token}

### POST /api/users
Create new user
**Request Body:**
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "library_id": "LIB001",
  "role": "user",
  "password": "password"
}
```

### GET /api/users/{id}
Get user details

### PUT /api/users/{id}
Update user information

### DELETE /api/users/{id}
Delete user (soft delete if they have active borrowings)

## Book Management Endpoints

### GET /api/books
Get all books with pagination and optional filters
**Query Parameters:** page, per_page, search, author, available
**Headers:** Authorization: Bearer {token}

### POST /api/books (Admin Only)
Create new book
**Request Body:**
```json
{
  "title": "Book Title",
  "isbn": "978-0-123456-78-9",
  "publication_year": 2023,
  "author_id": 1
}
```

### GET /api/books/{id}
Get book details with author and ratings information

### PUT /api/books/{id} (Admin Only)
Update book information

### DELETE /api/books/{id} (Admin Only)
Delete book (only if not currently borrowed)

### GET /api/books/search
Search books by title, author, or ISBN
**Query Parameters:** q (search query)
**Example:** /api/books/search?q=harry+potter

## Author Management Endpoints

### GET /api/authors
Get all authors with their book count

### POST /api/authors (Admin Only)
Create new author
**Request Body:**
```json
{
  "name": "Author Name",
  "bio": "Author biography"
}
```

### GET /api/authors/{id}
Get author details with their books

### PUT /api/authors/{id} (Admin Only)
Update author information

### DELETE /api/authors/{id} (Admin Only)
Delete author (only if no associated books)

## Borrowing System Endpoints

### GET /api/users/{userId}/borrowed
Get user's currently borrowed books and borrowing history

### POST /api/users/{userId}/borrow
Borrow a book
**Request Body:**
```json
{
  "book_id": 1
}
```
**Business Rules:**
- User cannot borrow more than 3 books simultaneously
- Book must be available
- Returns due date (14 days from borrowing)

### POST /api/borrowings/{borrowingId}/return
Return a borrowed book
**Request Body:**
```json
{
  "borrowing_id": 1
}
```

## Rating System Endpoints

### GET /api/books/{bookId}/ratings
Get all ratings for a specific book

### POST /api/books/{bookId}/rate
Rate a book (1-5 stars)
**Request Body:**
```json
{
  "rating": 5,
  "review": "Great book!"
}
```
**Rules:** Users can only rate books they have borrowed and returned

### PUT /api/ratings/{ratingId}
Update user's rating for a book

### DELETE /api/ratings/{ratingId}
Delete user's rating

## Dashboard Endpoints

### GET /api/dashboard/admin
Admin dashboard data
**Returns:**
```json
{
  "total_books": 150,
  "total_users": 45,
  "active_borrowings": 12,
  "overdue_books": 3,
  "recent_activities": [...]
}
```

### GET /api/dashboard/user
User dashboard data
**Returns:**
```json
{
  "current_borrowings": [...],
  "borrowing_history": [...],
  "due_soon": [...],
  "overdue": [...]
}
```

## Notification Endpoints

### GET /api/notifications
Get user's notifications (overdue reminders, etc.)

### PUT /api/notifications/{id}/read
Mark notification as read

## Error Responses

All endpoints return standardized error responses:

### 400 Bad Request
```json
{
  "message": "Validation failed",
  "errors": {
    "email": ["The email field is required"],
    "password": ["The password must be at least 8 characters"]
  }
}
```

### 401 Unauthorized
```json
{
  "message": "Unauthenticated"
}
```

### 403 Forbidden
```json
{
  "message": "You do not have permission to perform this action"
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 422 Unprocessable Entity
```json
{
  "message": "Book is not available for borrowing"
}
```

### 429 Too Many Requests
```json
{
  "message": "Too many requests. Please try again later"
}
```

## Rate Limiting

- Authentication endpoints: 5 requests per minute
- General API endpoints: 60 requests per minute
- Search endpoints: 30 requests per minute

## Pagination

All list endpoints support pagination:
- Default page size: 15 items
- Maximum page size: 100 items
- Response includes: data, current_page, last_page, per_page, total

## API Versioning

All endpoints are prefixed with `/api` and can be versioned in the future:
- Current: `/api/v1/...`
- Future versions: `/api/v2/...`

## Content Negotiation

API supports JSON responses by default. Content-Type header should be `application/json` for POST/PUT requests.