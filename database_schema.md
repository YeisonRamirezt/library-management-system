# Library Management System Database Schema

## Overview
The database schema is designed with normalization principles to efficiently manage books, authors, users, borrowings, and ratings. It uses MySQL with proper foreign key relationships and constraints.

## Tables

### 1. users
- id (Primary Key, Auto Increment)
- name (VARCHAR(255), NOT NULL)
- email (VARCHAR(255), UNIQUE, NOT NULL)
- library_id (VARCHAR(50), UNIQUE, NOT NULL) - Unique identifier for library users
- role (ENUM('admin', 'user'), DEFAULT 'user')
- email_verified_at (TIMESTAMP, NULLABLE)
- password (VARCHAR(255), NOT NULL)
- remember_token (VARCHAR(100), NULLABLE)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### 2. authors
- id (Primary Key, Auto Increment)
- name (VARCHAR(255), NOT NULL)
- bio (TEXT, NULLABLE)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### 3. books
- id (Primary Key, Auto Increment)
- title (VARCHAR(255), NOT NULL)
- isbn (VARCHAR(20), UNIQUE, NOT NULL)
- publication_year (YEAR, NOT NULL)
- available (BOOLEAN, DEFAULT TRUE)
- author_id (Foreign Key to authors.id)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### 4. borrowings
- id (Primary Key, Auto Increment)
- user_id (Foreign Key to users.id)
- book_id (Foreign Key to books.id)
- borrowed_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- due_date (TIMESTAMP, NOT NULL) - Default 14 days from borrowed_at
- returned_at (TIMESTAMP, NULLABLE)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### 5. ratings
- id (Primary Key, Auto Increment)
- user_id (Foreign Key to users.id)
- book_id (Foreign Key to books.id)
- rating (TINYINT, NOT NULL) - 1-5 stars
- review (TEXT, NULLABLE)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

## Relationships

### One-to-Many
- authors → books (One author can have many books)
- users → borrowings (One user can have many borrowing records)
- books → borrowings (One book can have many borrowing records)
- users → ratings (One user can rate many books)
- books → ratings (One book can have many ratings)

### Many-to-Many (through junction tables)
- users ↔ books (through borrowings table for borrowing history)
- users ↔ books (through ratings table for book ratings)

## Constraints and Business Rules

1. **Borrowing Limits**: Users cannot borrow more than 3 books simultaneously
   - Enforced in application logic (API validation)

2. **Book Availability**: Books marked as unavailable when borrowed
   - available BOOLEAN field updated on borrow/return

3. **Unique Constraints**:
   - users.email (unique)
   - users.library_id (unique)
   - books.isbn (unique)

4. **Foreign Key Constraints**:
   - borrowings.user_id → users.id
   - borrowings.book_id → books.id
   - books.author_id → authors.id
   - ratings.user_id → users.id
   - ratings.book_id → books.id

5. **Data Integrity**:
   - Cannot delete authors if they have associated books
   - Cannot delete users if they have active borrowings
   - Cannot delete books if they have active borrowings

## Indexes

### Performance Indexes
- users.email (for authentication)
- users.library_id (for quick lookups)
- books.isbn (for search)
- books.title (for search)
- authors.name (for search)
- borrowings.user_id (for user's borrowing history)
- borrowings.book_id (for book's borrowing history)
- borrowings.returned_at (for filtering active borrowings)
- ratings.book_id (for calculating average ratings)

## Migration Strategy

1. Create tables in dependency order: users, authors, books, borrowings, ratings
2. Add foreign key constraints after table creation
3. Create indexes for performance
4. Add seeders for initial data (admin user, sample books/authors)

## Fintech-Inspired Design Elements

- **Accountability**: Strict borrowing limits and due date tracking
- **Transparency**: Clear audit trail through borrowing history
- **Innovation**: Rating system for continuous improvement feedback
- **Efficiency**: Normalized schema for optimal query performance