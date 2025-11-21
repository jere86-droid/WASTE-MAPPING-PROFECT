import React from 'react';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import API from '../utils/api';
import MapView from '../components/map/MapView';
import ReportForm from '../components/reports/ReportForm';
import Loader from '../components/common/Loader';
import { useAuth } from '../context/AuthContext';
import { WASTE_TYPES, STATUS_TYPES } from '../utils/constants';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReportForm, setShowReportForm] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [filters, setFilters] = useState({
    wasteType: '',
    status: '',
  });

  useEffect(() => {
    fetchReports();
  }, [filters]);

  const fetchReports = async () => {
    try {
      const params = {};
      if (filters.wasteType) params.wasteType = filters.wasteType;
      if (filters.status) params.status = filters.status;

      const { data } = await API.get('/reports', { params });
      setReports(data.reports);
    } catch (error) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleMapClick = (latlng) => {
    if (!isAuthenticated) {
      toast.info('Please login to create a report');
      return;
    }
    setSelectedLocation(latlng);
    setShowReportForm(true);
  };

  const handleReportSuccess = () => {
    setShowReportForm(false);
    setSelectedLocation(null);
    fetchReports();
  };

  const handleCancelReport = () => {
    setShowReportForm(false);
    setSelectedLocation(null);
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Sidebar */}
      <div className="w-80 bg-white shadow-lg overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">WasteMap</h2>
          <p className="text-sm text-gray-600 mb-6">
            Click on the map to report waste issues in your area
          </p>

          {/* Filters */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Type
              </label>
              <select
                name="wasteType"
                value={filters.wasteType}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              >
                <option value="">All Types</option>
                {WASTE_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Status
              </label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              >
                <option value="">All Status</option>
                {STATUS_TYPES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {(filters.wasteType || filters.status) && (
              <button
                onClick={() => setFilters({ wasteType: '', status: '' })}
                className="w-full px-4 py-2 text-sm font-medium text-primary-600 border border-primary-600 rounded-lg hover:bg-primary-50 transition"
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Statistics
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Reports:</span>
                <span className="font-semibold">{reports.length}</span>
              </div>
            </div>
          </div>

          {/* Report Form */}
          {showReportForm && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Create Report
              </h3>
              <ReportForm
                location={selectedLocation}
                onSuccess={handleReportSuccess}
                onCancel={handleCancelReport}
              />
            </div>
          )}

          {!showReportForm && !isAuthenticated && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Login</strong> to report waste issues and help clean up
                your community!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="flex-1">
        <MapView
          reports={reports}
          onMapClick={handleMapClick}
          selectedLocation={selectedLocation}
        />
      </div>
    </div>
  );
};

export default Home;