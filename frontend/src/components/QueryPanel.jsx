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
**src/components/ProjectManager.jsx**
```javascript
import React, { useState, useEffect } from 'react';
import { Save, FolderOpen, User, Trash2 } from 'lucide-react';

const ProjectManager = ({ 
  currentUser, 
  onLogin, 
  onSaveProject, 
  onLoadProject, 
  currentFilters 
}) => {
  const [username, setUsername] = useState('');
  const [projectName, setProjectName] = useState('');
  const [savedProjects, setSavedProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      loadUserProjects();
    }
  }, [currentUser]);

  const loadUserProjects = async () => {
    try {
      setIsLoading(true);
      const response = await userAPI.getUserProjects(currentUser.id);
      if (response.success) {
        setSavedProjects(response.projects);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (username.trim()) {
      await onLogin(username.trim());
    }
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    if (projectName.trim() && currentUser) {
      try {
        await onSaveProject(projectName.trim(), currentFilters);
        setProjectName('');
        loadUserProjects(); // Refresh list
      } catch (error) {
        console.error('Error saving project:', error);
      }
    }
  };

  if (!currentUser) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <User className="w-5 h-5" />
          User Login
        </h3>
        <form onSubmit={handleLogin}>
          <div className="flex gap-2">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-3">
        Project Manager - {currentUser.username}
      </h3>

      {/* Save Project */}
      <div className="mb-4">
        <h4 className="font-medium mb-2 flex items-center gap-2">
          <Save className="w-4 h-4" />
          Save Current Analysis
        </h4>
        <form onSubmit={handleSaveProject}>
          <div className="flex gap-2">
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Project name"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={!projectName.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </form>
      </div>

      {/* Load Projects */}
      <div>
        <h4 className="font-medium mb-2 flex items-center gap-2">
          <FolderOpen className="w-4 h-4" />
          Saved Projects
        </h4>
        {isLoading ? (
          <p className="text-gray-500">Loading projects...</p>
        ) : savedProjects.length === 0 ? (
          <p className="text-gray-500">No saved projects yet</p>
        ) : (
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {savedProjects.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between p-2 bg-gray-50 rounded border hover:bg-gray-100"
              >
                <div>
                  <p className="font-medium">{project.name}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(project.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => onLoadProject(project)}
                  className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Load
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectManager;