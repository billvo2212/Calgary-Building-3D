'use client';

import React, { useState, useEffect } from 'react';
import Scene3D from '@/components/Scene3D';
import QueryPanel from '@/components/QueryPanel';
// import ProjectManager from '@/components/ProjectManager';
import BuildingPopup from '@/components/BuildingPopup';
import { API } from '@/utils/api';

type Filter = {
  field: string;
  op: '>' | '<' | '==' | 'contains';
  value: number | string;
};

type Building = {
  id: string;
  latitude: string;
  longitude: string;
  height: string;
  building_type: string;
  zoning: string;
  address: string;
  assessed_value?: number;
  year_built?: number;
};

// type Project = {
//   id: string;
//   name: string;
//   created_at: string;
//   filters: Filter[];
// };

export default function Home() {
  // ── State ─────────────────────────────────────────────────────
  const [allBuildings, setAllBuildings]               = useState<Building[]>([]);
  const [highlightedBuildings, setHighlightedBuildings] = useState<Building[]>([]);
  const [currentFilters, setCurrentFilters]           = useState<Filter[]>([]);
  
  const [selectedBuilding, setSelectedBuilding]       = useState<Building | null>(null);

  const [isQueryLoading, setIsQueryLoading]           = useState(false);
  const [lastQuery, setLastQuery]                     = useState('');
  const [queryResult, setQueryResult]                 = useState<{ count: number } | null>(null);

  // ── Load building data from Flask ─────────────────────────────
  useEffect(() => {
    API
      .get<{ success: boolean; data: Building[] }>('/api/buildings')
      .then(res => {
        if (res.data.success) {
          setAllBuildings(res.data.data);
          setHighlightedBuildings(res.data.data);
        }
      })
      .catch(err => console.error('Failed to load buildings', err));
  }, []);

  // ── QueryPanel callback: send to Flask `/api/query` ────────────
  // in app/page.tsx
const handleQuery = async (q: string) => {
  setIsQueryLoading(true);
  setLastQuery(q);
  setQueryResult(null);

  try {
    const res = await API.post<{
      success: boolean;
      filter_params: Filter[];
      filtered_buildings: Building[];
      total_matches: number;
    }>(
      '/api/query',
      { query: q, buildings: allBuildings }
    );

    if (res.data.success) {
      setCurrentFilters(res.data.filter_params);
      setHighlightedBuildings(res.data.filtered_buildings);
      setQueryResult({ count: res.data.total_matches });
    } else {
      // This branch probably never runs, since your API uses 400 for parse-errors
      console.warn('Unexpected API response', res.data);
      setQueryResult({ count: 0 });
    }
  } catch (err: unknown) {
    // If it's a 400 from your Flask parse-error, err.response.data.error exists
 
    console.error('Query error:', err);
    // Show zero results but display the message in UI
    setQueryResult({ count: 0 });
    // Optionally, you could push that error into state and render it below the QueryPanel
  } finally {
    setIsQueryLoading(false);
  }
};


  // ── Projects via Flask (no auth) ──────────────────────────────
  // const fetchProjects = () =>
  //   API
  //     .get<{ success: boolean; projects: Project[] }>(
  //       '/api/projects'
  //     )
  //     .then(r => (r.data.success ? r.data.projects : []));

  // const onSaveProject = (name: string, filters: Filter[]) =>
  //   API.post('/api/projects', { name, filters });

  // const onLoadProject = (proj: Project) => {
  //   setCurrentFilters(proj.filters);
  //   // re-apply to scene
  //   setHighlightedBuildings(
  //     proj.filters.length > 0
  //       ? proj.filters.reduce(
  //           (list, f) =>
  //             list.filter(b => {
  //               const val =
  //                 f.field === 'height' ? parseFloat(b.height) : (b as any)[f.field];
  //               switch (f.op) {
  //                 case '>': return val > (f.value as number);
  //                 case '<': return val < (f.value as number);
  //                 case '==': return val === f.value;
  //                 case 'contains':
  //                   return String(val)
  //                     .toLowerCase()
  //                     .includes(String(f.value).toLowerCase());
  //                 default:
  //                   return true;
  //               }
  //             }),
  //           allBuildings
  //         )
  //       : allBuildings
  //   );
  // };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/5 p-4 space-y-4 overflow-y-auto bg-gray-50">
        {/* <ProjectManager
          currentFilters={currentFilters}
          fetchProjects={fetchProjects}
          onSaveProject={onSaveProject}
          onLoadProject={onLoadProject}
        /> */}

        <QueryPanel
          onQuery={handleQuery}
          isLoading={isQueryLoading}
          lastQuery={lastQuery}
          queryResult={queryResult}
        />
      </div>

      {/* 3D Scene */}
      <div className="w-4/5 relative">
        <Scene3D
          buildings={allBuildings}
          highlightedBuildings={highlightedBuildings}
          onBuildingClick={setSelectedBuilding}
          selectedBuilding={selectedBuilding}
        />

        {selectedBuilding && (
          <BuildingPopup
            building={selectedBuilding}
            onClose={() => setSelectedBuilding(null)}
          />
        )}
      </div>
    </div>
  );
}
