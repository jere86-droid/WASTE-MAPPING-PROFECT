import React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import API from '../utils/api';
import Loader from '../components/common/Loader';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { getWasteTypeColor, getStatusColor } from '../utils/constants';
import { createCustomIcon } from '../utils/leafletIcons';

const ReportDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upvoting, setUpvoting] = useState(false);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchReport();
  }, [id]);

  const fetchReport = async () => {
    try {
      const { data } = await API.get(`/reports/${id}`);
      setReport(data);
      
      // Check if user has upvoted
      if (isAuthenticated && user) {
        setHasUpvoted(data.upvotedBy.includes(user._id));
      }
    } catch (error) {
      toast.error('Failed to load report');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async () => {
    if (!isAuthenticated) {
      toast.info('Please login to upvote');
      return;
    }

    setUpvoting(true);
    try {
      const { data } = await API.post(`/reports/${id}/upvote`);
      setReport({ ...report, upvotes: data.upvotes });
      setHasUpvoted(data.upvoted);
      toast.success(data.upvoted ? 'Upvoted!' : 'Upvote removed');
    } catch (error) {
      toast.error('Failed to upvote');
    } finally {
      setUpvoting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this report?')) {
      return;
    }

    try {
      await API.delete(`/reports/${id}`);
      toast.success('Report deleted successfully');
      navigate('/my-reports');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete report');
    }
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  if (!report) {
    return null;
  }

  const isOwner = user?._id === report.user._id;
  const canEdit = isOwner && report.status === 'pending';

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'in-progress': 'bg-blue-100 text-blue-800 border-blue-300',
    resolved: 'bg-green-100 text-green-800 border-green-300',
  };

  const urgencyColors = {
    low: 'bg-green-100 text-green-800 border-green-300',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    high: 'bg-orange-100 text-orange-800 border-orange-300',
    critical: 'bg-red-100 text-red-800 border-red-300',
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-900"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            {report.images && report.images.length > 0 && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="relative">
                  <img
                    src={report.images[currentImageIndex]}
                    alt="Waste report"
                    className="w-full h-96 object-cover"
                  />
                  
                  {/* Image Navigation */}
                  {report.images.length > 1 && (
                    <>
                      <button
                        onClick={() =>
                          setCurrentImageIndex((prev) =>
                            prev === 0 ? report.images.length - 1 : prev - 1
                          )
                        }
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                      >
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() =>
                          setCurrentImageIndex((prev) =>
                            prev === report.images.length - 1 ? 0 : prev + 1
                          )
                        }
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                      >
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>

                      {/* Image Indicators */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                        {report.images.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-2 h-2 rounded-full transition ${
                              index === currentImageIndex
                                ? 'bg-white w-8'
                                : 'bg-white bg-opacity-50'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Thumbnail Gallery */}
                {report.images.length > 1 && (
                  <div className="p-4 flex space-x-2 overflow-x-auto">
                    {report.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                          index === currentImageIndex
                            ? 'border-primary-600'
                            : 'border-transparent'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Report Details Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span
                      className="px-3 py-1 text-sm font-semibold rounded-full"
                      style={{
                        backgroundColor: getWasteTypeColor(report.wasteType) + '20',
                        color: getWasteTypeColor(report.wasteType),
                      }}
                    >
                      {report.wasteType.toUpperCase()}
                    </span>
                    <span
                      className={`px-3 py-1 text-sm font-semibold rounded-full border ${
                        statusColors[report.status]
                      }`}
                    >
                      {report.status.toUpperCase()}
                    </span>
                    <span
                      className={`px-3 py-1 text-sm font-semibold rounded-full border ${
                        urgencyColors[report.urgency]
                      }`}
                    >
                      {report.urgency.toUpperCase()}
                    </span>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {report.wasteType.charAt(0).toUpperCase() + report.wasteType.slice(1)} Waste Report
                  </h1>
                </div>

                {/* Upvote Button */}
                <button
                  onClick={handleUpvote}
                  disabled={upvoting}
                  className={`flex flex-col items-center px-4 py-2 rounded-lg border-2 transition ${
                    hasUpvoted
                      ? 'border-primary-600 bg-primary-50 text-primary-600'
                      : 'border-gray-300 hover:border-primary-600 hover:bg-primary-50'
                  }`}
                >
                  <svg
                    className={`w-6 h-6 ${hasUpvoted ? 'fill-current' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                    />
                  </svg>
                  <span className="text-sm font-semibold mt-1">{report.upvotes}</span>
                </button>
              </div>

              {/* Location */}
              <div className="flex items-start text-gray-600 mb-4">
                <svg
                  className="w-5 h-5 mr-2 mt-0.5 shrink-0"
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
                <span>{report.address}</span>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
                <p className="text-gray-700 leading-relaxed">{report.description}</p>
              </div>

              {/* Admin Notes */}
              {report.adminNotes && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h3 className="text-sm font-semibold text-blue-900 mb-2">
                    Admin Notes
                  </h3>
                  <p className="text-sm text-blue-800">{report.adminNotes}</p>
                </div>
              )}

              {/* Metadata */}
              <div className="border-t pt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Reported by:</span>
                  <p className="font-medium text-gray-900">{report.user.name}</p>
                </div>
                <div>
                  <span className="text-gray-500">Date:</span>
                  <p className="font-medium text-gray-900">
                    {new Date(report.createdAt).toLocaleString()}
                  </p>
                </div>
                {report.status === 'resolved' && report.updatedAt !== report.createdAt && (
                  <div className="col-span-2">
                    <span className="text-gray-500">Resolved on:</span>
                    <p className="font-medium text-gray-900">
                      {new Date(report.updatedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              {isOwner && (
                <div className="flex space-x-3 mt-6 pt-6 border-t">
                  {canEdit && (
                    <Link
                      to={`/reports/${id}/edit`}
                      className="flex-1 px-4 py-2 text-center bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition"
                    >
                      Edit Report
                    </Link>
                  )}
                  {report.status === 'pending' && (
                    <button
                      onClick={handleDelete}
                      className="flex-1 px-4 py-2 border border-red-600 text-red-600 rounded-lg font-medium hover:bg-red-50 transition"
                    >
                      Delete Report
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Map */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-64">
                <MapContainer
                  center={[
                    report.location.coordinates[1],
                    report.location.coordinates[0],
                  ]}
                  zoom={15}
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker
                    position={[
                      report.location.coordinates[1],
                      report.location.coordinates[0],
                    ]}
                  >
                    <Popup>{report.address}</Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Upvotes</span>
                  <span className="text-lg font-semibold text-gray-900">
                    {report.upvotes}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Status</span>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded ${
                      statusColors[report.status]
                    }`}
                  >
                    {report.status}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Urgency</span>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded ${
                      urgencyColors[report.urgency]
                    }`}
                  >
                    {report.urgency}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDetails;