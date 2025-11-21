import React from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../utils/api';
import Loader from '../components/common/Loader';
import { toast } from 'react-toastify';
import { getWasteTypeColor, getStatusColor } from '../utils/constants';

const MyReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyReports();
  }, []);

  const fetchMyReports = async () => {
    try {
      const { data } = await API.get('/reports/user/my-reports');
      setReports(data.reports);
    } catch (error) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const deleteReport = async (id) => {
    if (!window.confirm('Are you sure you want to delete this report?')) {
      return;
    }

    try {
      await API.delete(`/reports/${id}`);
      setReports(reports.filter((r) => r._id !== id));
      toast.success('Report deleted successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete report');
    }
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Reports</h1>
            <p className="mt-2 text-gray-600">
              Manage your waste reports ({reports.length} total)
            </p>
          </div>
          <Link
            to="/"
            className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition"
          >
            + New Report
          </Link>
        </div>

        {/* Reports Grid */}
        {reports.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No reports yet
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first waste report.
            </p>
            <div className="mt-6">
              <Link
                to="/"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                Create Report
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report) => (
              <ReportCard
                key={report._id}
                report={report}
                onDelete={deleteReport}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Report Card Component
const ReportCard = ({ report, onDelete }) => {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    resolved: 'bg-green-100 text-green-800',
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
      {/* Image */}
      {report.images && report.images.length > 0 && (
        <img
          src={report.images[0]}
          alt="Waste report"
          className="w-full h-48 object-cover"
        />
      )}

      {/* Content */}
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <span
              className="inline-block px-2 py-1 text-xs font-semibold rounded"
              style={{
                backgroundColor: getWasteTypeColor(report.wasteType) + '20',
                color: getWasteTypeColor(report.wasteType),
              }}
            >
              {report.wasteType}
            </span>
            <span
              className={`ml-2 inline-block px-2 py-1 text-xs font-semibold rounded ${
                statusColors[report.status]
              }`}
            >
              {report.status}
            </span>
          </div>
          <span
            className={`px-2 py-1 text-xs font-semibold rounded ${
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
        </div>

        {/* Location */}
        <div className="flex items-start text-sm text-gray-600 mb-2">
          <svg
            className="w-4 h-4 mr-1 mt-0.5 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span className="line-clamp-1">{report.address}</span>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-700 mb-3 line-clamp-2">
          {report.description}
        </p>

        {/* Stats */}
        <div className="flex items-center text-xs text-gray-500 mb-4">
          <span className="flex items-center mr-3">
            <svg
              className="w-4 h-4 mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
            </svg>
            {report.upvotes}
          </span>
          <span>
            {new Date(report.createdAt).toLocaleDateString()}
          </span>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <Link
            to={`/reports/${report._id}`}
            className="flex-1 px-3 py-2 text-sm font-medium text-center text-primary-600 border border-primary-600 rounded-lg hover:bg-primary-50 transition"
          >
            View
          </Link>
          {report.status === 'pending' && (
            <>
              <Link
                to={`/reports/${report._id}/edit`}
                className="flex-1 px-3 py-2 text-sm font-medium text-center text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Edit
              </Link>
              <button
                onClick={() => onDelete(report._id)}
                className="px-3 py-2 text-sm font-medium text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyReports;