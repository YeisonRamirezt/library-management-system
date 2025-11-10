<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Rating;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RatingController extends Controller
{
    /**
     * Display ratings for a specific book
     */
    public function index(Book $book)
    {
        $ratings = $book->ratings()
            ->with('user:id,name')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['data' => $ratings]);
    }

    /**
     * Store a new rating for a book
     */
    public function store(Request $request, Book $book)
    {
        $validator = Validator::make($request->all(), [
            'rating' => 'required|integer|min:1|max:5',
            'review' => 'nullable|string|max:1000'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = auth()->user();

        // Check if user has already rated this book
        $existingRating = Rating::where('user_id', $user->id)
            ->where('book_id', $book->id)
            ->first();

        if ($existingRating) {
            return response()->json([
                'message' => 'You have already rated this book'
            ], 422);
        }

        // Check if user has borrowed and returned this book
        $hasBorrowedAndReturned = $user->borrowings()
            ->where('book_id', $book->id)
            ->whereNotNull('returned_at')
            ->exists();

        if (!$hasBorrowedAndReturned) {
            return response()->json([
                'message' => 'You can only rate books you have borrowed and returned'
            ], 422);
        }

        $rating = Rating::create([
            'user_id' => $user->id,
            'book_id' => $book->id,
            'rating' => $request->rating,
            'review' => $request->review
        ]);

        return response()->json([
            'message' => 'Rating submitted successfully',
            'rating' => $rating->load('user:id,name')
        ], 201);
    }

    /**
     * Display the specified rating
     */
    public function show(Rating $rating)
    {
        // Users can view their own ratings, admins can view any rating
        if (!$this->isAdmin() && $rating->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json(['rating' => $rating->load(['user:id,name', 'book:id,title'])]);
    }

    /**
     * Update the specified rating
     */
    public function update(Request $request, Rating $rating)
    {
        // Users can update their own ratings, admins can update any rating
        if (!$this->isAdmin() && $rating->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'rating' => 'sometimes|required|integer|min:1|max:5',
            'review' => 'nullable|string|max:1000'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $rating->update($request->only(['rating', 'review']));

        return response()->json([
            'message' => 'Rating updated successfully',
            'rating' => $rating->load(['user:id,name', 'book:id,title'])
        ]);
    }

    /**
     * Remove the specified rating
     */
    public function destroy(Rating $rating)
    {
        // Users can delete their own ratings, admins can delete any rating
        if (!$this->isAdmin() && $rating->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $rating->delete();

        return response()->json([
            'message' => 'Rating deleted successfully'
        ]);
    }

    /**
     * Get user's ratings
     */
    public function userRatings(Request $request)
    {
        $user = auth()->user();

        $ratings = $user->ratings()
            ->with('book.author')
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json($ratings);
    }

    /**
     * Check if current user is admin
     */
    private function isAdmin(): bool
    {
        return auth()->user()->isAdmin();
    }
}
