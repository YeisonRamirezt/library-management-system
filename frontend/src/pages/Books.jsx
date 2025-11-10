import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { booksAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import BookForm from '../components/books/BookForm';
import SearchBar from '../components/SearchBar';

const Books = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    page: 1,
    per_page: 12,
  });
  const [showAddBookModal, setShowAddBookModal] = useState(false);

  // Debounce search query to prevent excessive API calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const { data: booksData, isLoading, error } = useQuery({
    queryKey: ['books', filters, debouncedSearchQuery],
    queryFn: () => {
      if (debouncedSearchQuery.trim()) {
        return booksAPI.search(debouncedSearchQuery);
      }
      return booksAPI.getAll(filters);
    },
  });

  const books = booksData?.data?.data || booksData?.data?.books || [];
  const pagination = booksData?.data || {};

  const showPagination = !debouncedSearchQuery.trim() && pagination.last_page > 1;

  const handleSearch = (e) => {
    e.preventDefault();
    // Search is handled automatically by the query
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handleBookClick = (bookId) => {
    navigate(`/books/${bookId}`);
  };

  const handleAddBookSuccess = () => {
    setShowAddBookModal(false);
    // Invalidate and refetch books query
    queryClient.invalidateQueries(['books']);
  };

  const handleAddBookCancel = () => {
    setShowAddBookModal(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    const isAuthError = error?.response?.status === 401;
    const errorMessage = isAuthError
      ? "Authentication required. Please log in to access books."
      : "Unable to load books. Please try again later.";

    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {isAuthError ? "Authentication Required" : "Error Loading Books"}
        </h3>
        <p className="text-gray-600">{errorMessage}</p>
        {isAuthError && (
          <Button
            className="mt-4"
            onClick={() => window.location.href = '/login'}
          >
            Go to Login
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Books</h1>
          <p className="mt-2 text-gray-600">Browse our collection of books</p>
        </div>
        {isAdmin() && (
          <Button onClick={() => setShowAddBookModal(true)}>
            Add New Book
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filters={filters}
        setFilters={setFilters}
      />

      {/* Results Count */}
      <div className="flex justify-between items-center">
        <p className="text-gray-600">
          {books.length > 0 ? `Showing ${books.length} books` : 'No books found'}
        </p>
      </div>

      {/* Books Grid */}
      {books.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {books.map((book) => (
            <Card
              key={book.id}
              className="cursor-pointer hover:shadow-medium transition-shadow duration-200"
              onClick={() => handleBookClick(book.id)}
            >
              <div className="aspect-w-3 aspect-h-4 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900 line-clamp-2">{book.title}</h3>
                <p className="text-sm text-gray-600">by {book.author?.name}</p>

                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    book.available
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {book.available ? 'Available' : 'Borrowed'}
                  </span>

                  {book.average_rating && (
                    <div className="flex items-center">
                      <span className="text-yellow-400 text-sm">★</span>
                      <span className="text-sm text-gray-600 ml-1">
                        {book.average_rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>

                <Button
                  size="sm"
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBookClick(book.id);
                  }}
                >
                  View Details
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="text-center py-12">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No books found</h3>
            <p className="text-gray-600">
              {debouncedSearchQuery ? 'Try adjusting your search terms.' : 'No books are currently available.'}
            </p>
          </div>
        </Card>
      )}

      {/* Pagination */}
      {showPagination && (
        <div className="flex justify-center">
          <nav className="flex items-center space-x-2">
            <Button
              variant="outline"
              disabled={pagination.current_page === 1}
              onClick={() => handleFilterChange('page', pagination.current_page - 1)}
            >
              Previous
            </Button>

            <span className="px-4 py-2 text-sm text-gray-700">
              Page {pagination.current_page} of {pagination.last_page}
            </span>

            <Button
              variant="outline"
              disabled={pagination.current_page === pagination.last_page}
              onClick={() => handleFilterChange('page', pagination.current_page + 1)}
            >
              Next
            </Button>
          </nav>
        </div>
      )}

      {/* Add Book Modal */}
      <Modal
        isOpen={showAddBookModal}
        onClose={handleAddBookCancel}
        title="Add New Book"
        size="lg"
      >
        <BookForm
          onSuccess={handleAddBookSuccess}
          onCancel={handleAddBookCancel}
        />
      </Modal>
    </div>
  );
};

export default Books;