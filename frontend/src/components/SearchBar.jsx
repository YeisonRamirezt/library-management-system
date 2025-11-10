import React, { useRef, memo, useEffect } from 'react';
import Card from './common/Card';

const SearchBar = memo(({ searchQuery, setSearchQuery, filters, setFilters }) => {
  const searchInputRef = useRef(null);

  // Maintain focus on the search input at all times during typing
  useEffect(() => {
    const input = searchInputRef.current;
    if (input && document.activeElement !== input) {
      // Only focus if not already focused to avoid cursor jumping
      const shouldFocus = searchQuery.length > 0 || document.activeElement === document.body;
      if (shouldFocus) {
        requestAnimationFrame(() => {
          input.focus();
          // Set cursor to end of input
          input.setSelectionRange(searchQuery.length, searchQuery.length);
        });
      }
    }
  }, [searchQuery]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  return (
    <Card>
      <div className="flex flex-col sm:flex-row gap-4">
        <form className="flex-1">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search by title, author, or ISBN..."
            value={searchQuery}
            onChange={(e) => {
              const newValue = e.target.value;
              setSearchQuery(newValue);
              // Reset filters when searching
              if (newValue.trim()) {
                setFilters(prev => ({ ...prev, page: 1 }));
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-soft focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
          />
        </form>

        <div className="flex gap-2">
          <select
            value={filters.available || ''}
            onChange={(e) => handleFilterChange('available', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Books</option>
            <option value="true">Available Only</option>
            <option value="false">Borrowed</option>
          </select>
        </div>
      </div>
    </Card>
  );
});

SearchBar.displayName = 'SearchBar';

export default SearchBar;