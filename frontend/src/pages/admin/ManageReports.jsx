import React from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../utils/api';
import Loader from '../../components/common/Loader';
import { toast } from 'react-toastify';
import { WASTE_TYPES, STATUS_TYPES } from '../../utils/constants';

const ManageReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    wasteType: '',
    status: '',
  });
  const [selectedReport, setSelectedReport] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState({
    status: '',
    adminNotes: '',
  });
  const [updating, setUpdating] = useState(false);

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

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const openStatusModal = (report) => {
    setSelectedReport(report);
    setStatusUpdate({
      status: report.status,
      adminNotes: report.adminNotes || '',
    });
    setShowStatusModal(true);
  };

  const handleStatusChange = (e) => {
    setStatusUpdate({
      ...statusUpdate,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateStatus = async () => {
    setUpdating(true);
    try {
      const { data } = await API.put(
        `/admin/reports/${selectedReport._id}/status`,
        statusUpdate
      );

      // Update the report in the list
      setReports(
        reports.map((r) => (r._id === selectedReport._id ? data : r))
      );

      toast.success('Report status updated successfully');
      setShowStatusModal(false);
      setSelectedReport(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manage Reports</h1>
          <p className="mt-2 text-gray-600">
            Review and update waste reports ({reports.length} total)
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Waste Type
              </label>
              <select
                name="wasteType"
                value={filters.wasteType}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                {STATUS_TYPES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setFilters({ wasteType: '', status: '' })}
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Reports Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Report
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Urgency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Upvotes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reports.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center">
                      <p className="text-gray-500">No reports found</p>
                    </td>
                  </tr>
                ) : (
                  reports.map((report) => (
                    <tr key={report._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {report.images && report.images.length > 0 && (
                            <img
                              src={report.images[0]}
                              alt="Report"
                              className="w-12 h-12 rounded-lg object-cover mr-3"
                            />
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900 line-clamp-1">
                              {report.address.substring(0, 40)}...
                            </p>
                            <p className="text-xs text-gray-500 line-clamp-1">
                              {report.description.substring(0, 50)}...
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm font-medium text-gray-900">
                          {report.user?.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {report.user?.email}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800 capitalize">
                          {report.wasteType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded capitalize ${
                            report.urgency === 'critical'
                              ? 'bg-red-100 text-red-800'
                              : report.urgency === 'high'
                              ? 'bg-orange-100 text-orange-800'
                              : report.urgency === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {report.urgency}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded ${getStatusBadgeColor(
                            report.status
                          )}`}
                        >
                          {report.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {report.upvotes}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <Link
                          to={`/reports/${report._id}`}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => openStatusModal(report)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Update
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Update Report Status
            </h3>

            <div className="space-y-4">
              {/* Status Select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={statusUpdate.status}
                  onChange={handleStatusChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {STATUS_TYPES.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Admin Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Notes
                </label>
                <textarea
                  name="adminNotes"
                  value={statusUpdate.adminNotes}
                  onChange={handleStatusChange}
                  rows={4}
                  maxLength={500}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  placeholder="Add notes about this report..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  {statusUpdate.adminNotes.length}/500 characters
                </p>
              </div>

              {/* Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowStatusModal(false)}
                  disabled={updating}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateStatus}
                  disabled={updating}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-50"
                >
                  {updating ? 'Updating...' : 'Update'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageReports;