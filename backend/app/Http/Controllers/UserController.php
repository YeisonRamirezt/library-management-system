<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    /**
     * Display a listing of users (Admin only)
     */
    public function index(Request $request)
    {
        $this->authorizeAdmin();

        $query = User::query();

        // Search functionality
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('library_id', 'like', "%{$search}%");
            });
        }

        // Role filter
        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        $users = $query->paginate($request->get('per_page', 15));

        return response()->json($users);
    }

    /**
     * Store a newly created user (Admin only)
     */
    public function store(Request $request)
    {
        $this->authorizeAdmin();

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'library_id' => 'required|string|max:50|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|in:admin,user'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'library_id' => $request->library_id,
            'password' => Hash::make($request->password),
            'role' => $request->role
        ]);

        return response()->json([
            'message' => 'User created successfully',
            'user' => $user
        ], 201);
    }

    /**
     * Display the specified user
     */
    public function show(User $user)
    {
        // Users can view their own profile, admins can view any profile
        if (!$this->isAdmin() && $user->id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json(['user' => $user->load(['borrowings.book.author', 'ratings.book'])]);
    }

    /**
     * Update the specified user (Admin only, or self for limited fields)
     */
    public function update(Request $request, User $user)
    {
        // Allow users to update their own profile, admins can update any user
        if (!$this->isAdmin() && $user->id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $rules = [
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|string|email|max:255|unique:users,email,' . $user->id,
        ];

        // Only admins can update these fields
        if ($this->isAdmin()) {
            $rules['library_id'] = 'sometimes|required|string|max:50|unique:users,library_id,' . $user->id;
            $rules['role'] = 'sometimes|required|in:admin,user';
        }

        // Password update (optional)
        if ($request->has('password')) {
            $rules['password'] = 'required|string|min:8';
        }

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $updateData = $request->only(['name', 'email']);

        if ($this->isAdmin()) {
            $updateData = array_merge($updateData, $request->only(['library_id', 'role']));
        }

        if ($request->has('password')) {
            $updateData['password'] = Hash::make($request->password);
        }

        $user->update($updateData);

        return response()->json([
            'message' => 'User updated successfully',
            'user' => $user
        ]);
    }

    /**
     * Remove the specified user (Admin only)
     */
    public function destroy(User $user)
    {
        $this->authorizeAdmin();

        // Check if user has active borrowings
        if ($user->activeBorrowings()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete user with active borrowings'
            ], 422);
        }

        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully'
        ]);
    }

    /**
     * Get user's borrowing history
     */
    public function borrowings(User $user)
    {
        // Users can view their own borrowings, admins can view any user's borrowings
        if (!$this->isAdmin() && $user->id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $borrowings = $user->borrowings()
            ->with(['book.author'])
            ->orderBy('borrowed_at', 'desc')
            ->paginate(15);

        return response()->json($borrowings);
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
