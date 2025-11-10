<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Borrowing;
use App\Models\User;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Get admin dashboard data
     */
    public function admin()
    {
        $this->authorizeAdmin();

        $stats = [
            'total_books' => Book::count(),
            'total_users' => User::count(),
            'active_borrowings' => Borrowing::whereNull('returned_at')->count(),
            'overdue_books' => Borrowing::whereNull('returned_at')
                ->where('due_date', '<', now())
                ->count(),
            'available_books' => Book::where('available', true)->count(),
            'total_authors' => \App\Models\Author::count(),
            'books_borrowed_this_month' => Borrowing::whereMonth('borrowed_at', now()->month)
                ->whereYear('borrowed_at', now()->year)
                ->count(),
            'books_returned_this_month' => Borrowing::whereMonth('returned_at', now()->month)
                ->whereYear('returned_at', now()->year)
                ->whereNotNull('returned_at')
                ->count(),
        ];

        // Recent activities
        $recentActivities = collect();

        // Recent borrowings
        $recentBorrowings = Borrowing::with(['user:id,name', 'book:id,title'])
            ->orderBy('borrowed_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($borrowing) {
                return [
                    'type' => 'borrowing',
                    'message' => "{$borrowing->user->name} borrowed '{$borrowing->book->title}'",
                    'timestamp' => $borrowing->borrowed_at,
                ];
            });

        // Recent returns
        $recentReturns = Borrowing::with(['user:id,name', 'book:id,title'])
            ->whereNotNull('returned_at')
            ->orderBy('returned_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($borrowing) {
                return [
                    'type' => 'return',
                    'message' => "{$borrowing->user->name} returned '{$borrowing->book->title}'",
                    'timestamp' => $borrowing->returned_at,
                ];
            });

        // Recent registrations
        $recentUsers = User::orderBy('created_at', 'desc')
            ->limit(3)
            ->get()
            ->map(function ($user) {
                return [
                    'type' => 'registration',
                    'message' => "New user {$user->name} registered",
                    'timestamp' => $user->created_at,
                ];
            });

        $recentActivities = $recentBorrowings
            ->concat($recentReturns)
            ->concat($recentUsers)
            ->sortByDesc('timestamp')
            ->take(10)
            ->values();

        return response()->json([
            'statistics' => $stats,
            'recent_activities' => $recentActivities
        ]);
    }

    /**
     * Get user dashboard data
     */
    public function user()
    {
        $user = auth()->user();

        $stats = [
            'current_borrowings_count' => $user->activeBorrowings()->count(),
            'total_borrowings' => $user->borrowings()->count(),
            'overdue_books' => $user->activeBorrowings()
                ->where('due_date', '<', now())
                ->count(),
            'books_due_soon' => $user->activeBorrowings()
                ->where('due_date', '>=', now())
                ->where('due_date', '<=', now()->addDays(3))
                ->count(),
        ];

        // Current borrowings
        $currentBorrowings = $user->activeBorrowings()
            ->with('book.author')
            ->get()
            ->map(function ($borrowing) {
                return [
                    'id' => $borrowing->id,
                    'book' => $borrowing->book,
                    'borrowed_at' => $borrowing->borrowed_at,
                    'due_date' => $borrowing->due_date,
                    'is_overdue' => $borrowing->isOverdue(),
                    'days_overdue' => $borrowing->days_overdue,
                ];
            });

        // Recent borrowing history (returned books only, for historical view)
        $borrowingHistory = $user->borrowings()
            ->with('book.author')
            ->whereNotNull('returned_at')
            ->orderBy('returned_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($borrowing) {
                return [
                    'id' => $borrowing->id,
                    'book' => $borrowing->book,
                    'borrowed_at' => $borrowing->borrowed_at,
                    'returned_at' => $borrowing->returned_at,
                    'due_date' => $borrowing->due_date,
                    'is_overdue' => $borrowing->returned_at > $borrowing->due_date,
                    'status' => 'returned',
                ];
            });

        // User's ratings
        $userRatings = $user->ratings()
            ->with('book.author')
            ->orderBy('created_at', 'desc')
            ->limit(3)
            ->get();

        return response()->json([
            'statistics' => $stats,
            'current_borrowings' => $currentBorrowings,
            'borrowing_history' => $borrowingHistory,
            'recent_ratings' => $userRatings,
        ]);
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
