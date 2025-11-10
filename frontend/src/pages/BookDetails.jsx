import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { booksAPI, borrowingAPI, ratingsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

const ErrorModal = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">Error</h3>
          </div>
        </div>
        <div className="mb-4">
          <p className="text-gray-700">{message}</p>
        </div>
        <div className="flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
};

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">Delete Book</h3>
          </div>
        </div>
        <div className="mb-4">
          <p className="text-gray-700">Are you sure you want to delete this book? This action cannot be undone.</p>
        </div>
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            loading={loading}
            disabled={loading}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: bookResponse, isLoading: bookLoading, error: bookError } = useQuery({
    queryKey: ['book', id],
    queryFn: () => booksAPI.getById(id),
  });

  const book = bookResponse?.book;

  const { data: ratings, isLoading: ratingsLoading } = useQuery({
    queryKey: ['book-ratings', id],
    queryFn: () => booksAPI.getRatings(id),
  });

  const borrowMutation = useMutation({
    mutationFn: () => borrowingAPI.borrow(user.id, id),
    onSuccess: () => {
      queryClient.invalidateQueries(['book', id]);
      queryClient.invalidateQueries(['books']);
      queryClient.invalidateQueries(['user-dashboard']);
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to borrow book';
      setErrorMessage(message);
    },
  });

  const returnMutation = useMutation({
    mutationFn: (borrowingId) => borrowingAPI.return(borrowingId),
    onSuccess: () => {
      queryClient.invalidateQueries(['book', id]);
      queryClient.invalidateQueries(['books']);
      queryClient.invalidateQueries(['user-dashboard']);
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to return book';
      setErrorMessage(message);
    },
  });

  const rateMutation = useMutation({
    mutationFn: (ratingData) => ratingsAPI.update(ratingData.id, ratingData),
    onSuccess: () => {
      queryClient.invalidateQueries(['book-ratings', id]);
      queryClient.invalidateQueries(['book', id]);
      setShowRatingForm(false);
      setRating(0);
      setReview('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => booksAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['books']);
      navigate('/books');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to delete book';
      setErrorMessage(message);
    },
  });

  const handleBorrow = async () => {
    if (!user?.id) {
      return;
    }
    try {
      await borrowMutation.mutateAsync();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleReturn = async (borrowingId) => {
    try {
      await returnMutation.mutateAsync(borrowingId);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleRate = async () => {
    if (rating === 0) return;

    const existingRating = Array.isArray(ratings?.data) ? ratings.data.find(r => r.user_id === user.id) : null;
    if (existingRating) {
      await rateMutation.mutateAsync({
        id: existingRating.id,
        rating,
        review,
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync();
      setShowDeleteConfirm(false);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const renderStars = (rating, interactive = false, onRate = () => {}) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`text-2xl ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
            onClick={interactive ? () => onRate(star) : undefined}
            disabled={!interactive}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  if (authLoading || bookLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-gray-200 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="h-48 bg-gray-200 rounded-lg"></div>
              <div className="h-32 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (bookError || !book) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Book Not Found</h3>
        <p className="text-gray-600 mb-4">The book you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate('/books')}>Back to Books</Button>
      </div>
    );
  }

  // Get current borrowing from the current_borrowing field or borrowings array
  const currentBorrowing = book.current_borrowing || book.borrowings?.find(b => !b.returned_at) || null;

  const userRating = Array.isArray(ratings?.data) ? ratings.data.find(r => r.user_id === user.id) : null;
  const canRate = currentBorrowing?.returned_at && userRating;
  const canBorrow = book.is_available;

  return (
    <div className="space-y-6">
      {/* Error Modal */}
      <ErrorModal message={errorMessage} onClose={() => setErrorMessage('')} />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        loading={deleteMutation.isLoading}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate('/books')}>
          ← Back to Books
        </Button>
        {isAdmin() && (
          <Button
            variant="danger"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={deleteMutation.isLoading}
          >
            Delete Book
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Book Cover and Basic Info */}
          <Card>
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="w-full sm:w-48 h-64 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-20 h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{book.title}</h1>
                  <p className="text-xl text-gray-600 mt-2">by {book.author?.name}</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    book.is_available
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {book.is_available ? 'Available' : 'Currently Borrowed'}
                  </span>

                  <span className="text-sm text-gray-600">
                    ISBN: {book.isbn}
                  </span>

                  <span className="text-sm text-gray-600">
                    Published: {book.publication_year}
                  </span>
                </div>

                {book.average_rating && (
                  <div className="flex items-center space-x-2">
                    {renderStars(Math.round(book.average_rating))}
                    <span className="text-sm text-gray-600">
                      {book.average_rating.toFixed(1)} ({book.ratings_count} reviews)
                    </span>
                  </div>
                )}

                {/* Borrow/Return Button */}
                <div className="pt-4">
                  {currentBorrowing ? (
                    currentBorrowing.user_id === user.id ? (
                      <Button
                        onClick={() => handleReturn(currentBorrowing.id)}
                        loading={returnMutation.isLoading}
                        disabled={returnMutation.isLoading}
                      >
                        Return Book
                      </Button>
                    ) : (
                      <div className="text-sm text-gray-600">
                        Currently borrowed by another user
                      </div>
                    )
                  ) : canBorrow && user && !isAdmin() ? (
                    <Button
                      onClick={handleBorrow}
                      loading={borrowMutation.isLoading}
                      disabled={borrowMutation.isLoading}
                    >
                      Borrow Book
                    </Button>
                  ) : (
                    <div className="text-sm text-gray-600">
                      Only Users Can Borrow This Book
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Ratings and Reviews */}
          <Card>
            <Card.Header>
              <Card.Title>Ratings & Reviews</Card.Title>
            </Card.Header>
            <Card.Content>
              {ratingsLoading ? (
                <div className="animate-pulse space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              ) : Array.isArray(ratings?.data) && ratings.data.length > 0 ? (
                <div className="space-y-6">
                  {ratings.data.map((rating) => (
                    <div key={rating.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {renderStars(rating.rating)}
                          <span className="text-sm text-gray-600">
                            by {rating.user.name}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(rating.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {rating.review && (
                        <p className="text-gray-700 text-sm">{rating.review}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-4">No reviews yet</p>
              )}

              {/* Rate this book */}
              {canRate && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Rate this book</h3>
                  {!showRatingForm ? (
                    <Button variant="outline" onClick={() => setShowRatingForm(true)}>
                      Write a Review
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Your Rating
                        </label>
                        {renderStars(rating, true, setRating)}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Your Review (Optional)
                        </label>
                        <textarea
                          value={review}
                          onChange={(e) => setReview(e.target.value)}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="Share your thoughts about this book..."
                        />
                      </div>

                      <div className="flex space-x-3">
                        <Button
                          onClick={handleRate}
                          loading={rateMutation.isLoading}
                          disabled={rating === 0 || rateMutation.isLoading}
                        >
                          Submit Review
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowRatingForm(false);
                            setRating(0);
                            setReview('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card.Content>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Book Stats */}
          <Card>
            <Card.Header>
              <Card.Title>Book Statistics</Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Borrowings</span>
                  <span className="text-sm font-medium">{book.total_borrowings || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Current Status</span>
                  <span className={`text-sm font-medium ${
                    book.is_available ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {book.is_available ? 'Available' : 'Borrowed'}
                  </span>
                </div>
                {currentBorrowing && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Due Date</span>
                    <span className="text-sm font-medium">
                      {new Date(currentBorrowing.due_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </Card.Content>
          </Card>

          {/* Author Info */}
          <Card>
            <Card.Header>
              <Card.Title>About the Author</Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">{book.author?.name}</h3>
                {book.author?.bio && (
                  <p className="text-sm text-gray-600">{book.author.bio}</p>
                )}
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{book.author?.books_count || 0}</span> books by this author
                </div>
              </div>
            </Card.Content>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookDetails;