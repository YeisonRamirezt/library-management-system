<?php

namespace App\Http\Controllers;

use App\Models\Author;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AuthorController extends Controller
{
    /**
     * Display a listing of authors
     */
    public function index(Request $request)
    {
        $query = Author::query();

        // Search functionality
        if ($request->has('search')) {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%");
        }

        $authors = $query->withCount('books')
            ->orderBy('name')
            ->paginate($request->get('per_page', 15));

        return response()->json($authors);
    }

    /**
     * Store a newly created author (Admin only)
     */
    public function store(Request $request)
    {
        $this->authorizeAdmin();

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:authors',
            'bio' => 'nullable|string|max:1000'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $author = Author::create($request->all());

        return response()->json([
            'message' => 'Author created successfully',
            'author' => $author
        ], 201);
    }

    /**
     * Display the specified author
     */
    public function show(Author $author)
    {
        $author->load(['books' => function ($query) {
            $query->with('ratings')->orderBy('title');
        }]);

        // Add computed fields for books
        $author->books->transform(function ($book) {
            $book->average_rating = $book->average_rating;
            $book->ratings_count = $book->ratings_count;
            $book->is_available = $book->isAvailable();
            return $book;
        });

        return response()->json(['author' => $author]);
    }

    /**
     * Update the specified author (Admin only)
     */
    public function update(Request $request, Author $author)
    {
        $this->authorizeAdmin();

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255|unique:authors,name,' . $author->id,
            'bio' => 'nullable|string|max:1000'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $author->update($request->all());

        return response()->json([
            'message' => 'Author updated successfully',
            'author' => $author
        ]);
    }

    /**
     * Remove the specified author (Admin only)
     */
    public function destroy(Author $author)
    {
        $this->authorizeAdmin();

        // Check if author has books
        if ($author->books()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete author with associated books'
            ], 422);
        }

        $author->delete();

        return response()->json([
            'message' => 'Author deleted successfully'
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
