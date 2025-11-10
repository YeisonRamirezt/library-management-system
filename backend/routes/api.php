<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\AuthorController;
use App\Http\Controllers\BookController;
use App\Http\Controllers\BorrowingController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\RatingController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public Routes (No Authentication Required)
Route::get('/books', [BookController::class, 'index']);
Route::get('/books/search', [BookController::class, 'search']);
Route::get('/books/{book}', [BookController::class, 'show']);
Route::get('/authors', [AuthorController::class, 'index']);

// Public Authentication Routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// Protected Routes (Require Authentication)
Route::middleware('auth:sanctum')->group(function () {

    // Authentication
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Dashboard Routes
    Route::prefix('dashboard')->group(function () {
        Route::get('/admin', [DashboardController::class, 'admin']);
        Route::get('/user', [DashboardController::class, 'user']);
    });

    // User Management (Admin Only)
    Route::middleware('admin')->group(function () {
        Route::apiResource('users', UserController::class);
    });

    // User Profile Routes (Authenticated Users)
    Route::prefix('users/{user}')->group(function () {
        Route::get('/borrowings', [UserController::class, 'borrowings']);
        Route::post('/borrow', [BorrowingController::class, 'borrow']);
    });

    // Protected Book Routes (Admin Only for CRUD)
    Route::middleware('admin')->group(function () {
        Route::post('/books', [BookController::class, 'store']);
        Route::put('/books/{book}', [BookController::class, 'update']);
        Route::delete('/books/{book}', [BookController::class, 'destroy']);
        Route::apiResource('authors', AuthorController::class);
    });

    // Borrowing Routes
    Route::prefix('borrowings')->group(function () {
        Route::get('/active', [BorrowingController::class, 'activeBorrowings']);
        Route::get('/statistics', [BorrowingController::class, 'statistics']);
        Route::post('/{borrowing}/return', [BorrowingController::class, 'returnBook']);
    });

    // User's Current Borrowings
    Route::get('/my-borrowings', [BorrowingController::class, 'userBorrowings']);

    // Rating Routes
    Route::prefix('books/{book}/ratings')->group(function () {
        Route::get('/', [RatingController::class, 'index']);
        Route::post('/', [RatingController::class, 'store']);
    });

    Route::prefix('ratings')->group(function () {
        Route::get('/my-ratings', [RatingController::class, 'userRatings']);
        Route::get('/{rating}', [RatingController::class, 'show']);
        Route::put('/{rating}', [RatingController::class, 'update']);
        Route::delete('/{rating}', [RatingController::class, 'destroy']);
    });

});
