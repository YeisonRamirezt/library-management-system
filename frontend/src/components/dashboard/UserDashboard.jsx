import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { dashboardAPI, borrowingAPI } from '../../services/api';
import Card from '../common/Card';
import Button from '../common/Button';

const UserDashboard = () => {
  const navigate = useNavigate();

  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['user-dashboard'],
    queryFn: dashboardAPI.getUserStats,
  });

  const { data: borrowings, isLoading: borrowingsLoading, error: borrowingsError } = useQuery({
    queryKey: ['user-borrowings'],
    queryFn: borrowingAPI.getUserBorrowings,
  });

  const queryClient = useQueryClient();

  const returnMutation = useMutation({
    mutationFn: (borrowingId) => borrowingAPI.return(borrowingId),
    onSuccess: () => {
      queryClient.invalidateQueries(['user-dashboard']);
      queryClient.invalidateQueries(['user-borrowings']);
    },
    onError: (error) => {
      console.error('Return mutation error:', error);
      console.error('Error response:', error.response?.data);
    },
  });

  const handleReturn = async (borrowingId) => {
    try {
      await returnMutation.mutateAsync(borrowingId);
    } catch (error) {
      console.error('handleReturn error:', error);
    }
  };

  const handleBrowseBooks = () => {
    navigate('/books');
  };

  const isLoading = statsLoading || borrowingsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const currentBorrowings = Array.isArray(borrowings?.data?.borrowings) ? borrowings.data.borrowings.filter(b => !b.returned_at) : [];
  const overdueBooks = currentBorrowings.filter(b => new Date(b.due_date) < new Date()) || [];
  const dueSoonBooks = currentBorrowings.filter(b => {
    const dueDate = new Date(b.due_date);
    const now = new Date();
    const diffTime = dueDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays > 0;
  }) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage your borrowed books and account</p>
        </div>
        <Button onClick={handleBrowseBooks}>
          Browse Books
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-50 mr-4">
              <span className="text-2xl">📖</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Currently Borrowed</p>
              <p className="text-2xl font-bold text-blue-600">{currentBorrowings.length}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className={`p-3 rounded-lg mr-4 ${overdueBooks.length > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
              <span className="text-2xl">{overdueBooks.length > 0 ? '⚠️' : '✅'}</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue Books</p>
              <p className={`text-2xl font-bold ${overdueBooks.length > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {overdueBooks.length}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-yellow-50 mr-4">
              <span className="text-2xl">⏰</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Due Soon</p>
              <p className="text-2xl font-bold text-yellow-600">{dueSoonBooks.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Current Borrowings */}
      <Card>
        <Card.Header>
          <Card.Title>Currently Borrowed Books</Card.Title>
        </Card.Header>
        <Card.Content>
          {currentBorrowings.length > 0 ? (
            <div className="space-y-4">
              {currentBorrowings.map((borrowing) => {
                const dueDate = new Date(borrowing.due_date);
                const now = new Date();
                const isOverdue = dueDate < now;
                const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));

                return (
                  <div key={borrowing.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{borrowing.book.title}</h3>
                      <p className="text-sm text-gray-600">by {borrowing.book.author.name}</p>
                      <div className="flex items-center mt-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          isOverdue
                            ? 'bg-red-100 text-red-800'
                            : daysUntilDue <= 3
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {isOverdue ? 'Overdue' : `Due in ${daysUntilDue} days`}
                        </span>
                        <span className="ml-2 text-sm text-gray-500">
                          Due: {dueDate.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleReturn(borrowing.id)}
                      loading={returnMutation.isLoading}
                      disabled={returnMutation.isLoading}
                    >
                      Return Book
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No books currently borrowed</h3>
              <p className="text-gray-600 mb-4">Browse our collection to find your next read!</p>
              <Button onClick={handleBrowseBooks}>Browse Books</Button>
            </div>
          )}
        </Card.Content>
      </Card>

      {/* Borrowing History */}
      <Card>
        <Card.Header>
          <Card.Title>Recent Borrowing History</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="space-y-4">
            {Array.isArray(borrowings?.data?.borrowings) && borrowings.data.borrowings.filter(b => b.returned_at).slice(0, 5).map((borrowing) => (
              <div key={borrowing.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{borrowing.book.title}</h3>
                  <p className="text-sm text-gray-600">by {borrowing.book.author.name}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      borrowing.status === 'returned'
                        ? 'bg-green-100 text-green-800'
                        : borrowing.is_overdue
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {borrowing.status === 'returned' ? 'Returned' : borrowing.is_overdue ? 'Overdue' : 'Active'}
                    </span>
                    <span className="text-xs text-gray-500">
                      Borrowed: {new Date(borrowing.borrowed_at).toLocaleDateString()}
                    </span>
                    {borrowing.returned_at && (
                      <span className="text-xs text-gray-500">
                        • Returned: {new Date(borrowing.returned_at).toLocaleDateString()}
                      </span>
                    )}
                    {!borrowing.returned_at && (
                      <span className="text-xs text-gray-500">
                        • Due: {new Date(borrowing.due_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {borrowing.rating && (
                    <div className="flex items-center">
                      <span className="text-yellow-400">★</span>
                      <span className="text-sm text-gray-600 ml-1">{borrowing.rating.rating}</span>
                    </div>
                  )}
                  {borrowing.status === 'returned' && (
                    <Button variant="outline" size="sm">
                      Rate Book
                    </Button>
                  )}
                </div>
              </div>
            )) || []}
          </div>
          {(!Array.isArray(borrowings?.data?.borrowings) || borrowings.data.borrowings.filter(b => b.returned_at).length === 0) && (
            <p className="text-gray-500 text-center py-4">No borrowing history yet</p>
          )}
        </Card.Content>
      </Card>
    </div>
  );
};

export default UserDashboard;