import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { authorsAPI, booksAPI } from '../../services/api';
import Input from '../common/Input';
import Button from '../common/Button';

const BookForm = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    isbn: '',
    publication_year: '',
    author_id: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch authors for dropdown
  const { data: authorsData, isLoading: authorsLoading } = useQuery({
    queryKey: ['authors'],
    queryFn: () => authorsAPI.getAll(),
  });

  const authors = authorsData?.data?.data || [];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.isbn.trim()) {
      newErrors.isbn = 'ISBN is required';
    } else if (!/^(?:\d{10}|\d{13})$/.test(formData.isbn.replace(/-/g, ''))) {
      newErrors.isbn = 'ISBN must be 10 or 13 digits';
    }

    if (!formData.publication_year) {
      newErrors.publication_year = 'Publication year is required';
    } else {
      const year = parseInt(formData.publication_year);
      const currentYear = new Date().getFullYear();
      if (year < 1000 || year > currentYear + 1) {
        newErrors.publication_year = 'Please enter a valid publication year';
      }
    }

    if (!formData.author_id) {
      newErrors.author_id = 'Author is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const bookData = {
        ...formData,
        publication_year: parseInt(formData.publication_year),
        author_id: parseInt(formData.author_id),
      };

      await booksAPI.create(bookData);

      // Reset form
      setFormData({
        title: '',
        isbn: '',
        publication_year: '',
        author_id: '',
      });
      setErrors({});

      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      const apiErrors = error.response?.data?.errors || {};
      setErrors(apiErrors);

      // Handle general error message
      if (error.response?.data?.message && !Object.keys(apiErrors).length) {
        setErrors({ general: error.response.data.message });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
          {errors.general && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

          <Input
            label="Book Title"
            name="title"
            type="text"
            placeholder="Enter book title"
            value={formData.title}
            onChange={handleInputChange}
            error={errors.title}
            required
          />

          <Input
            label="ISBN"
            name="isbn"
            type="text"
            placeholder="Enter ISBN (10 or 13 digits)"
            value={formData.isbn}
            onChange={handleInputChange}
            error={errors.isbn}
            required
          />

          <Input
            label="Publication Year"
            name="publication_year"
            type="number"
            placeholder="Enter publication year"
            value={formData.publication_year}
            onChange={handleInputChange}
            error={errors.publication_year}
            min="1000"
            max={new Date().getFullYear() + 1}
            required
          />

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Author <span className="text-red-500 ml-1">*</span>
            </label>
            <select
              name="author_id"
              value={formData.author_id}
              onChange={handleInputChange}
              disabled={authorsLoading}
              className={`
                w-full px-3 py-2 border rounded-lg shadow-soft
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                disabled:bg-gray-100 disabled:cursor-not-allowed
                transition-colors duration-200
                ${errors.author_id ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
              `}
              required
            >
              <option value="">
                {authorsLoading ? 'Loading authors...' : 'Select an author'}
              </option>
              {authors.map((author) => (
                <option key={author.id} value={author.id}>
                  {author.name}
                </option>
              ))}
            </select>
            {errors.author_id && (
              <p className="text-sm text-red-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.author_id}
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isSubmitting}
              disabled={authorsLoading}
            >
              Add Book
            </Button>
          </div>
        </form>
      </div>
    );
};

export default BookForm;