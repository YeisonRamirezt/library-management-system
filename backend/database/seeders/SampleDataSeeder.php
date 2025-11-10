<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SampleDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create sample authors
        $authors = [
            ['name' => 'J.K. Rowling', 'bio' => 'British author, philanthropist, and screenwriter.'],
            ['name' => 'George R.R. Martin', 'bio' => 'American novelist and short story writer.'],
            ['name' => 'Agatha Christie', 'bio' => 'English writer known for detective novels.'],
            ['name' => 'Stephen King', 'bio' => 'American author of horror, supernatural fiction.'],
            ['name' => 'Jane Austen', 'bio' => 'English novelist known for social commentary.'],
        ];

        foreach ($authors as $author) {
            \App\Models\Author::create($author);
        }


        // Create sample users
        $users = [
            ['name' => 'Alice Johnson', 'email' => 'alice@lms.local', 'library_id' => 'USER002', 'password' => bcrypt('password'), 'role' => 'user'],
            ['name' => 'Bob Smith', 'email' => 'bob@lms.local', 'library_id' => 'USER003', 'password' => bcrypt('password'), 'role' => 'user'],
            ['name' => 'Carol Davis', 'email' => 'carol@lms.local', 'library_id' => 'USER004', 'password' => bcrypt('password'), 'role' => 'user'],
        ];

        foreach ($users as $user) {
            \App\Models\User::create($user);
        }

        // Create sample borrowings
        $borrowings = [
            ['user_id' => 2, 'book_id' => 1, 'borrowed_at' => now()->subDays(10), 'due_date' => now()->addDays(5), 'returned_at' => null], // Active
            ['user_id' => 2, 'book_id' => 3, 'borrowed_at' => now()->subDays(15), 'due_date' => now()->subDays(5), 'returned_at' => null], // Overdue
            ['user_id' => 3, 'book_id' => 5, 'borrowed_at' => now()->subDays(20), 'due_date' => now()->subDays(10), 'returned_at' => now()->subDays(8)], // Returned
            ['user_id' => 4, 'book_id' => 6, 'borrowed_at' => now()->subDays(5), 'due_date' => now()->addDays(10), 'returned_at' => null], // Active
        ];

        foreach ($borrowings as $borrowing) {
            \App\Models\Borrowing::create($borrowing);
        }

        // Create sample ratings
        $ratings = [
            ['user_id' => 2, 'book_id' => 5, 'rating' => 5, 'review' => 'Amazing horror novel!'],
            ['user_id' => 3, 'book_id' => 6, 'rating' => 4, 'review' => 'Classic literature at its finest.'],
            ['user_id' => 4, 'book_id' => 1, 'rating' => 5, 'review' => 'Magical adventure for all ages.'],
            ['user_id' => 2, 'book_id' => 3, 'rating' => 4, 'review' => 'Epic fantasy with complex characters.'],
        ];

        foreach ($ratings as $rating) {
            \App\Models\Rating::create($rating);
        }
    }
}
