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
        Schema::create('authors', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('bio')->nullable();
            $table->timestamps();
        });

        // Seed sample authors
        DB::table('authors')->insert([
            ['name' => 'J.K. Rowling', 'bio' => 'British author, philanthropist, and screenwriter.', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'George R.R. Martin', 'bio' => 'American novelist and short story writer.', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Agatha Christie', 'bio' => 'English writer known for detective novels.', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Stephen King', 'bio' => 'American author of horror, supernatural fiction.', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Jane Austen', 'bio' => 'English novelist known for social commentary.', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('authors');
    }
};
