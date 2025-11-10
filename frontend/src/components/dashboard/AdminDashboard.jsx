import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { dashboardAPI } from '../../services/api';
import Card from '../common/Card';
import Button from '../common/Button';
import Modal from '../common/Modal';
import BookForm from '../books/BookForm';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: dashboardAPI.getAdminStats,
    retry: 1,
    refetchOnWindowFocus: false,
  });



  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Dashboard error:', error);
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Dashboard</h3>
        <p className="text-gray-600">Unable to load dashboard statistics. Please try again later.</p>
        <p className="text-sm text-gray-500 mt-2">Error: {error?.message || 'Unknown error'}</p>
      </div>
    );
  }

  const handleAddBookSuccess = () => {
    setShowAddBookModal(false);
    // Invalidate dashboard stats and books queries
    queryClient.invalidateQueries(['admin-dashboard']);
    queryClient.invalidateQueries(['books']);
  };

  const handleAddBookCancel = () => {
    setShowAddBookModal(false);
  };

  const statCards = [
    {
      title: 'Total Books',
      value: stats?.data?.statistics?.total_books || 0,
      icon: '📚',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Users',
      value: stats?.data?.statistics?.total_users || 0,
      icon: '👥',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Active Borrowings',
      value: stats?.data?.statistics?.active_borrowings || 0,
      icon: '📖',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Overdue Books',
      value: stats?.data?.statistics?.overdue_books || 0,
      icon: '⚠️',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage your library system</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={() => setShowAddBookModal(true)}>
            Add New Book
          </Button>
          <Button variant="outline" onClick={() => navigate('/books')}>
            View All Books
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.bgColor} mr-4`}>
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <Card.Header>
          <Card.Title>Recent Activity</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="space-y-4">
            {stats?.data?.recent_activities?.length > 0 ? (
              stats.data.recent_activities.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.timestamp}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            )}
          </div>
        </Card.Content>
      </Card>

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

export default AdminDashboard;