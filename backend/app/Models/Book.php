<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Book extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'isbn',
        'publication_year',
        'available',
        'author_id',
    ];

    protected $casts = [
        'available' => 'boolean',
        'publication_year' => 'integer',
    ];

    /**
     * Get book author
     */
    public function author(): BelongsTo
    {
        return $this->belongsTo(Author::class);
    }

    /**
     * Get book borrowings
     */
    public function borrowings(): HasMany
    {
        return $this->hasMany(Borrowing::class);
    }

    /**
     * Get active borrowings (not returned)
     */
    public function activeBorrowings(): HasMany
    {
        return $this->borrowings()->whereNull('returned_at');
    }

    /**
     * Get book ratings
     */
    public function ratings(): HasMany
    {
        return $this->hasMany(Rating::class);
    }

    /**
     * Check if book is available for borrowing
     */
    public function isAvailable(): bool
    {
        return $this->available && $this->activeBorrowings()->count() === 0;
    }

    /**
     * Get average rating
     */
    public function getAverageRatingAttribute(): ?float
    {
        return $this->ratings()->avg('rating');
    }

    /**
     * Get ratings count
     */
    public function getRatingsCountAttribute(): int
    {
        return $this->ratings()->count();
    }
}
