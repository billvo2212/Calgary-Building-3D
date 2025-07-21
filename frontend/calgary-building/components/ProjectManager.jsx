// components/ProjectManager.jsx
import React, { useState, useEffect } from 'react';
import { Save, FolderOpen } from 'lucide-react';
import PropTypes from 'prop-types';

export default function ProjectManager({
  currentFilters,
  fetchProjects,
  onSaveProject,
  onLoadProject,
}) {
  const [projectName, setProjectName] = useState('');
  const [savedProjects, setSavedProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load list on mount (and after each save)
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const projects = await fetchProjects();
      setSavedProjects(projects);
    } catch (err) {
      console.error('Failed to fetch projects', err);
      setError(err.message || 'Unable to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async e => {
    e.preventDefault();
    if (!projectName.trim()) return;
    setError(null);
    try {
      await onSaveProject(projectName.trim(), currentFilters);
      setProjectName('');
      await loadProjects();
    } catch (err) {
      console.error('Save project failed', err);
      setError(err.message || 'Failed to save project');
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-4">Project Manager</h3>

      {/* Save Current Analysis */}
      <div className="mb-6">
        <h4 className="font-medium mb-2 flex items-center gap-2">
          <Save className="w-4 h-4" /> Save Current Analysis
        </h4>
        <form onSubmit={handleSave} className="flex gap-2">
          <input
            type="text"
            value={projectName}
            onChange={e => setProjectName(e.target.value)}
            placeholder="Project name"
            className="flex-1 px-3 py-2 border rounded focus:ring focus:outline-none"
          />
          <button
            type="submit"
            disabled={!projectName.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            Save
          </button>
        </form>
        {error && (
          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>

      {/* Load Saved Projects */}
      <div>
        <h4 className="font-medium mb-2 flex items-center gap-2">
          <FolderOpen className="w-4 h-4" /> Saved Projects
        </h4>
        {isLoading ? (
          <p className="text-gray-500">Loading…</p>
        ) : savedProjects.length === 0 ? (
          <p className="text-gray-500">No saved projects</p>
        ) : (
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {savedProjects.map(proj => (
              <div
                key={proj.id}
                className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100"
              >
                <div>
                  <p className="font-medium">{proj.name}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(proj.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => onLoadProject(proj)}
                  className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
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
}

ProjectManager.propTypes = {
  currentFilters: PropTypes.array.isRequired,
  fetchProjects: PropTypes.func.isRequired,
  onSaveProject: PropTypes.func.isRequired,
  onLoadProject: PropTypes.func.isRequired,
};