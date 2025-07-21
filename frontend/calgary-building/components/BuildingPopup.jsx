// components/BuildingPopup.jsx
import React from 'react';
import { X } from 'lucide-react';

const BuildingPopup = ({ building, onClose }) => {
  if (!building) return null;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(value);
  };

  return (
    <div className="fixed inset-0 bg-grey-700 bg-opacity-20 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg text-black font-semibold">Building Details</h3>
          <button
            onClick={onClose}
            className="p-1 text-black hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-600">Address</label>
            <p className="text-gray-900">{building.address || 'N/A'}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Height</label>
              <p className="text-gray-900">
                {building.height > 0 
                  ? `${Math.round(building.height * 10)} ft` 
                  : 'N/A'}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Zoning</label>
              <p className="text-gray-900">{building.zoning || 'N/A'}</p>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-600">Building Type</label>
            <p className="text-gray-900">{building.building_type || 'N/A'}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-600">Assessed Value</label>
            <p className="text-gray-900 font-semibold">
              {building.assessed_value
                ? formatCurrency(building.assessed_value)
                : 'N/A'
              }
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Year Built</label>
              <p className="text-gray-900">{building.year_built || 'N/A'}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Building ID</label>
              <p className="text-gray-900">{building.id}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Latitude</label>
              <p className="text-gray-900 text-sm">
                {building.latitude
                  ? parseFloat(building.latitude).toFixed(6)
                  : 'N/A'}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Longitude</label>
              <p className="text-gray-900 text-sm">
                {building.longitude
                  ? parseFloat(building.longitude).toFixed(6)
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuildingPopup;
