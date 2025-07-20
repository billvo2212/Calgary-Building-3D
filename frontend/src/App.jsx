import React, { useState } from 'react';
import Scene3D from './components/Scene3D';
import QueryPanel from './components/QueryPanel';
import ProjectManager from './components/ProjectManager';
import BuildingPopup from './components/BuildingPopup';
import { useBuildings } from './hooks/useBuildings';
import { buildingAPI, userAPI } from './services/api';
import { RefreshCw, AlertCircle } from 'lucide-react';

function App() {
  const { buildings, isLoading: buildingsLoading, error: buildingsError, refetch } = useBuildings();
  
  const [highlightedBuildings, setHighlightedBuildings] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentFilters, setCurrentFilters] = useState({});
  
  // Query state
  const [isQuerying, setIsQuerying] = useState(false);
  const [lastQuery, setLastQuery] = useState('');
  const [queryResult, setQueryResult] = useState(null);

  const handleBuildingClick = (building) => {
    setSelectedBuilding(building);
    setShowPopup(true);
  };

  const handleQuery = async (query) => {
    try {
      setIsQuerying(true);
      setLastQuery(query);
      
      const response = await buildingAPI.processQuery(query, buildings);
      
      if (response.success) {
        setHighlightedBuildings(response.filtered_buildings);
        setQueryResult(response);
        setCurrentFilters(response.filter_params);
      } else {
        alert(response.error);
        setHighlightedBuildings([]);
        setQueryResult(null);
      }
    } catch (error) {
      console.error('Query error:', error);
      alert('Failed to process query');
    } finally {
      setIsQuerying(false);
    }
  };

  const handleLogin = async (username) => {
    try {
      const response = await userAPI.createUser(username);
      if (response.success) {
        setCurrentUser(response.user);
      } else {
        alert(response.error);
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Failed to login');
    }
  };

  const handleSaveProject = async (projectName, filters) => {
    try {
      const response = await userAPI.saveProject(currentUser.id, projectName, filters);
      if (response.success) {
        alert('Project saved successfully!');
      } else {
        alert(response.error);
      }
    } catch (error) {
      console.error('Save project error:', error);
      alert('Failed to save project');
    }
  };

  const handleLoadProject = async (project) => {
    try {
      if (project.filters && Object.keys(project.filters).length > 0) {
        // Re-apply the saved filters
        const response = await buildingAPI.processQuery('', buildings);
        if (response.success) {
          // Filter buildings based on saved filters
          const filteredBuildings = buildings.filter(building => {
            const filter = project.filters;
            const attribute = filter.attribute;
            const operator = filter.operator;
            const value = filter.value;
            
            if (!building[attribute]) return false;
            
            const buildingValue = building[attribute];
            
            try {
              switch (operator) {
                case '>':
                  return parseFloat(buildingValue) > parseFloat(value);
                case '<':
                  return parseFloat(buildingValue) < parseFloat(value);
                case '>=':
                  return parseFloat(buildingValue) >= parseFloat(value);
                case '<=':
                  return parseFloat(buildingValue) <= parseFloat(value);
                case '==':
                case '=':
                  return String(buildingValue).toLowerCase() === String(value).toLowerCase();
                case 'contains':
                  return String(buildingValue).toLowerCase().includes(String(value).toLowerCase());
                default:
                  return false;
              }
            } catch {
              return String(buildingValue).toLowerCase() === String(value).toLowerCase();
            }
          });
          
          setHighlightedBuildings(filteredBuildings);
          setCurrentFilters(project.filters);
          setQueryResult({
            filter_params: project.filters,
            total_matches: filteredBuildings.length
          });
          setLastQuery(`Loaded project: ${project.name}`);
        }
      } else {
        // Clear filters
        setHighlightedBuildings([]);
        setCurrentFilters({});
        setQueryResult(null);
        setLastQuery(`Loaded project: ${project.name} (no filters)`);
      }
    } catch (error) {
      console.error('Load project error:', error);
      alert('Failed to load project');
    }
  };

  const clearFilters = () => {
    setHighlightedBuildings([]);
    setCurrentFilters({});
    setQueryResult(null);
    setLastQuery('');
  };

  if (buildingsLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-lg">Loading Calgary building data...</p>
        </div>
      </div>
    );
  }

  if (buildingsError) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p className="text-lg text-red-600 mb-4">Error: {buildingsError}</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex">
      {/* Sidebar */}
      <div className="w-80 bg-gray-50 p-4 overflow-y-auto space-y-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Calgary Urban Dashboard
        </h1>
        
        <div className="text-sm text-gray-600 mb-4">
          Showing {buildings.length} buildings
          {highlightedBuildings.length > 0 && (
            <span className="block mt-1">
              {highlightedBuildings.length} highlighted
            </span>
          )}
        </div>

        <QueryPanel
          onQuery={handleQuery}
          isLoading={isQuerying}
          lastQuery={lastQuery}
          queryResult={queryResult}
        />

        <ProjectManager
          currentUser={currentUser}
          onLogin={handleLogin}
          onSaveProject={handleSaveProject}
          onLoadProject={handleLoadProject}
          currentFilters={currentFilters}
        />

        {(highlightedBuildings.length > 0 || Object.keys(currentFilters).length > 0) && (
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Active Filters</h3>
              <button
                onClick={clearFilters}
                className="text-sm text-red-500 hover:text-red-700"
              >
                Clear
              </button>
            </div>
            {Object.keys(currentFilters).length > 0 && (
              <p className="text-sm text-gray-600 mt-2">
                {currentFilters.attribute} {currentFilters.operator} {currentFilters.value}
              </p>
            )}
          </div>
        )}

        <div className="text-xs text-gray-500 mt-8">
          <p>💡 Tips:</p>
          <ul className="list-disc list-inside space-y-1 mt-1">
            <li>Click buildings to view details</li>
            <li>Use mouse to rotate and zoom</li>
            <li>Try queries like "buildings over 100 feet"</li>
            <li>Save your analyses as projects</li>
          </ul>
        </div>
      </div>

      {/* Main 3D View */}
      <div className="flex-1">
        <Scene3D
          buildings={buildings}
          highlightedBuildings={highlightedBuildings}
          selectedBuilding={selectedBuilding}
          onBuildingClick={handleBuildingClick}
        />
      </div>

      {/* Building Details Popup */}
      {showPopup && selectedBuilding && (
        <BuildingPopup
          building={selectedBuilding}
          onClose={() => {
            setShowPopup(false);
            setSelectedBuilding(null);
          }}
        />
      )}
    </div>
  );
}

export default App;