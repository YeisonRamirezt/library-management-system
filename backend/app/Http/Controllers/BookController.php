<?php

namespace App\Http\Controllers;

use App\Models\Author;
use App\Models\Book;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BookController extends Controller
{
    /**
     * Display a listing of books
     */
    public function index(Request $request)
    {
        $query = Book::with(['author', 'ratings']);

        // Search functionality
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('isbn', 'like', "%{$search}%")
                  ->orWhereHas('author', function ($authorQuery) use ($search) {
                      $authorQuery->where('name', 'like', "%{$search}%");
                  });
            });
        }

        // Author filter
        if ($request->has('author')) {
            $query->where('author_id', $request->author);
        }

        // Availability filter - only apply when explicitly set to true or false
        if ($request->has('available') && in_array($request->available, ['true', 'false'], true)) {
            $query->where('available', $request->boolean('available'));
        }

        // Sort options
        $sortBy = $request->get('sort_by', 'title');
        $sortDirection = $request->get('sort_direction', 'asc');

        if (in_array($sortBy, ['title', 'publication_year', 'created_at'])) {
            $query->orderBy($sortBy, $sortDirection);
        }

        $perPage = $request->get('per_page', 15);
        $books = $query->paginate($perPage);

        // Add computed fields
        $books->getCollection()->transform(function ($book) {
            $book->average_rating = $book->average_rating;
            $book->ratings_count = $book->ratings_count;
            $book->is_available = $book->isAvailable();
            return $book;
        });

        return response()->json($books);
    }

    /**
     * Store a newly created book (Admin only)
     */
    public function store(Request $request)
    {
        $this->authorizeAdmin();

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'isbn' => 'required|string|max:20|unique:books',
            'publication_year' => 'required|integer|min:1000|max:' . (date('Y') + 1),
            'author_id' => 'required|exists:authors,id',
            'available' => 'sometimes|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $book = Book::create($request->all());

        return response()->json([
            'message' => 'Book created successfully',
            'book' => $book->load('author')
        ], 201);
    }

    /**
     * Display the specified book
     */
    public function show(Book $book)
    {
        $book->load(['author', 'ratings.user', 'borrowings' => function ($query) {
            $query->with('user:id,name')->orderBy('borrowed_at', 'desc');
        }]);

        // Add computed fields
        $book->average_rating = $book->average_rating;
        $book->ratings_count = $book->ratings_count;
        $book->is_available = $book->isAvailable();
        $book->total_borrowings = $book->borrowings()->count();

        // Add current borrowing info - only if book is not available
        if (!$book->is_available) {
            $book->current_borrowing = $book->activeBorrowings()->with('user:id,name')->first();
        }

        return response()->json(['book' => $book]);
    }

    /**
     * Update the specified book (Admin only)
     */
    public function update(Request $request, Book $book)
    {
        $this->authorizeAdmin();

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'isbn' => 'sometimes|required|string|max:20|unique:books,isbn,' . $book->id,
            'publication_year' => 'sometimes|required|integer|min:1000|max:' . (date('Y') + 1),
            'author_id' => 'sometimes|required|exists:authors,id',
            'available' => 'sometimes|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $book->update($request->all());

        return response()->json([
            'message' => 'Book updated successfully',
            'book' => $book->load('author')
        ]);
    }

    /**
     * Remove the specified book (Admin only)
     */
    public function destroy(Book $book)
    {
        $this->authorizeAdmin();

        // Check if book has active borrowings
        if ($book->activeBorrowings()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete book with active borrowings'
            ], 422);
        }

        $book->delete();

        return response()->json([
            'message' => 'Book deleted successfully'
        ]);
    }

    /**
     * Search books
     */
    public function search(Request $request)
    {
        $query = $request->get('q', '');

        if (empty($query)) {
            return response()->json(['books' => []]);
        }

        $books = Book::with('author')
            ->where(function ($q) use ($query) {
                $q->where('title', 'like', "%{$query}%")
                  ->orWhere('isbn', 'like', "%{$query}%")
                  ->orWhereHas('author', function ($authorQuery) use ($query) {
                      $authorQuery->where('name', 'like', "%{$query}%");
                  });
            })
            ->limit(20)
            ->get();

        // Add computed fields
        $books->transform(function ($book) {
            $book->average_rating = $book->average_rating;
            $book->ratings_count = $book->ratings_count;
            return $book;
        });

        return response()->json(['books' => $books]);
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
