import React, { useState } from 'react';
import { Search, Loader } from 'lucide-react';

const QueryPanel = ({ onQuery, isLoading, lastQuery, queryResult }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onQuery(query.trim());
    }
  };

  const exampleQueries = [
    "buildings over 100 feet",
    "commercial buildings",
    "buildings under $500000",
    "RC-G zoning",
    "residential buildings"
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-3">Query Buildings</h3>
      
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., buildings over 100 feet"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Query
          </button>
        </div>
      </form>

      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">Example queries:</p>
        <div className="flex flex-wrap gap-2">
          {exampleQueries.map((example, index) => (
            <button
              key={index}
              type="button"
              onClick={() => {
                setQuery(example);
                onQuery(example);
              }}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      {lastQuery && (
        <div className="mt-4">
          <p className="text-sm font-medium">Last query: "{lastQuery}"</p>
          {queryResult && (
            <p className="text-sm mt-1">
              Found {queryResult.count} matching buildings
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default QueryPanel;