<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('books', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('isbn', 20)->unique();
            $table->smallInteger('publication_year');
            $table->boolean('available')->default(true);
            $table->foreignId('author_id')->constrained()->onDelete('cascade');
            $table->timestamps();
        });

        // Seed sample books
        DB::table('books')->insert([
            ['title' => 'Harry Potter and the Philosopher\'s Stone', 'isbn' => '978-0-7475-3269-9', 'publication_year' => 1997, 'available' => true, 'author_id' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Harry Potter and the Chamber of Secrets', 'isbn' => '978-0-7475-3849-3', 'publication_year' => 1998, 'available' => true, 'author_id' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'A Game of Thrones', 'isbn' => '978-0-553-10354-0', 'publication_year' => 1996, 'available' => true, 'author_id' => 2, 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Murder on the Orient Express', 'isbn' => '978-0-06-269366-2', 'publication_year' => 1934, 'available' => true, 'author_id' => 3, 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'The Shining', 'isbn' => '978-0-385-12167-5', 'publication_year' => 1977, 'available' => true, 'author_id' => 4, 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Pride and Prejudice', 'isbn' => '978-0-14-143951-8', 'publication_year' => 1813, 'available' => true, 'author_id' => 5, 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Harry Potter and the Prisoner of Azkaban', 'isbn' => '978-0-7475-4215-5', 'publication_year' => 1999, 'available' => true, 'author_id' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'A Clash of Kings', 'isbn' => '978-0-553-10803-3', 'publication_year' => 1998, 'available' => true, 'author_id' => 2, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('books');
    }
};
