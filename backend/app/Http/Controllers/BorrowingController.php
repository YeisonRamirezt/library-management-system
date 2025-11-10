<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Borrowing;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BorrowingController extends Controller
{
    /**
     * Borrow a book
     */
    public function borrow(Request $request, User $user)
    {
        // Users can only borrow for themselves, admins can borrow for any user
        if (!$this->isAdmin() && $user->id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'book_id' => 'required|exists:books,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $book = Book::findOrFail($request->book_id);

        // Check if book is available
        if (!$book->isAvailable()) {
            return response()->json([
                'message' => 'Book is not available for borrowing'
            ], 422);
        }

        // Check borrowing limit (max 3 books per user)
        if (!$user->canBorrowMoreBooks()) {
            return response()->json([
                'message' => 'User has reached the maximum borrowing limit of 3 books'
            ], 422);
        }

        // Create borrowing record
        $borrowing = Borrowing::create([
            'user_id' => $user->id,
            'book_id' => $book->id,
            'borrowed_at' => now(),
            'due_date' => now()->addDays(14), // 14 days borrowing period
        ]);

        // Update book availability
        $book->update(['available' => false]);

        return response()->json([
            'message' => 'Book borrowed successfully',
            'borrowing' => $borrowing->load(['book.author', 'user'])
        ], 201);
    }

    /**
     * Return a borrowed book
     */
    public function returnBook(Request $request, Borrowing $borrowing)
    {
        // Users can return their own books, admins can return any book
        if (!$this->isAdmin() && $borrowing->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Check if book is already returned
        if ($borrowing->isReturned()) {
            return response()->json([
                'message' => 'Book has already been returned'
            ], 422);
        }

        // Update borrowing record
        $borrowing->update([
            'returned_at' => now()
        ]);

        // Update book availability
        $borrowing->book->update(['available' => true]);

        return response()->json([
            'message' => 'Book returned successfully',
            'borrowing' => $borrowing->load(['book.author', 'user'])
        ]);
    }

    /**
     * Get current user's borrowings (both active and returned)
     */
    public function userBorrowings()
    {
        $user = auth()->user();

        $borrowings = $user->borrowings()
            ->with(['book.author'])
            ->orderBy('borrowed_at', 'desc')
            ->get();

        // Add computed fields
        $borrowings->transform(function ($borrowing) {
            $borrowing->is_overdue = $borrowing->isOverdue();
            $borrowing->days_overdue = $borrowing->days_overdue;
            return $borrowing;
        });

        return response()->json(['borrowings' => $borrowings]);
    }

    /**
     * Get all active borrowings (Admin only)
     */
    public function activeBorrowings(Request $request)
    {
        $this->authorizeAdmin();

        $query = Borrowing::with(['user', 'book.author'])
            ->whereNull('returned_at');

        // Filter overdue books
        if ($request->has('overdue') && $request->boolean('overdue')) {
            $query->where('due_date', '<', now());
        }

        $borrowings = $query->orderBy('due_date', 'asc')
            ->paginate($request->get('per_page', 15));

        // Add computed fields
        $borrowings->getCollection()->transform(function ($borrowing) {
            $borrowing->is_overdue = $borrowing->isOverdue();
            $borrowing->days_overdue = $borrowing->days_overdue;
            return $borrowing;
        });

        return response()->json($borrowings);
    }

    /**
     * Get borrowing statistics (Admin only)
     */
    public function statistics()
    {
        $this->authorizeAdmin();

        $stats = [
            'total_active_borrowings' => Borrowing::whereNull('returned_at')->count(),
            'overdue_borrowings' => Borrowing::whereNull('returned_at')
                ->where('due_date', '<', now())
                ->count(),
            'total_books_borrowed_this_month' => Borrowing::whereMonth('borrowed_at', now()->month)
                ->whereYear('borrowed_at', now()->year)
                ->count(),
            'total_books_returned_this_month' => Borrowing::whereMonth('returned_at', now()->month)
                ->whereYear('returned_at', now()->year)
                ->whereNotNull('returned_at')
                ->count(),
        ];

        return response()->json(['statistics' => $stats]);
    }

    /**
     * Check if current user is admin
     */
    private function isAdmin(): bool
    {
        return auth()->user()->isAdmin();
    }

    /**
     * Authorize admin access
     */
    private function authorizeAdmin()
    {
        if (!$this->isAdmin()) {
            abort(403, 'Admin access required');
        }
    }
}
