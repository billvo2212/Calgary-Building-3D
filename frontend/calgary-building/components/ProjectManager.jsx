// pages/index.jsx  (or wherever you render <ProjectManager>)
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProjectManager from '@/components/ProjectManager';

export default function Home() {
  const [currentFilters, setCurrentFilters] = useState([]);
  
  // fetchProjects: GET /api/projects → array of {id,name,filters,created_at}
  const fetchProjects = async () => {
    const res = await axios.get('/api/projects');
    if (!res.data.success) {
      throw new Error(res.data.error || 'Failed to load');
    }
    return res.data.projects;
  };
  
  // onSaveProject: POST /api/projects {name,filters}
  const onSaveProject = async (name, filters) => {
    const payload = { name, filters };
    const res = await axios.post('/api/projects', payload);
    if (!res.data.success) {
      // throw to bubble into your catch in ProjectManager
      throw new Error(res.data.error || 'Save failed');
    }
    return res.data.project;
  };
  
  // onLoadProject: just reapply filters client‑side
  const onLoadProject = project => {
    setCurrentFilters(project.filters);
  };
  
  return (
    <div>
      {/* ... your SearchBar, Scene3D, etc. */}
      <ProjectManager
        fetchProjects={fetchProjects}
        onSaveProject={onSaveProject}
        onLoadProject={onLoadProject}
        currentFilters={currentFilters}
      />
    </div>
  );
}
