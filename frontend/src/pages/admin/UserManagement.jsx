import React from 'react';
import { useState, useEffect } from 'react';
import API from '../../utils/api';
import Loader from '../../components/common/Loader';
import { toast } from 'react-toastify';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [userReports, setUserReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await API.get('/admin/users');
      setUsers(data.users);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const viewUserDetails = async (user) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
    setLoadingReports(true);

    try {
      const { data } = await API.get(`/admin/users/${user._id}`);
      setUserReports(data.reports);
    } catch (error) {
      toast.error('Failed to load user reports');
    } finally {
      setLoadingReports(false);
    }
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="mt-2 text-gray-600">
            Manage registered users ({users.length} total)
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {users.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Verified Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {users.filter((u) => u.emailVerified).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Admins</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {users.filter((u) => u.role === 'admin').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👑</span>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white font-medium">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {user.name}
                          </p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {user.role === 'admin' ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.emailVerified ? (
                        <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          ✓ Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => viewUserDetails(user)}
                        className="text-primary-600 hover:text-primary-900 text-sm font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      {showDetailsModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                User Details
              </h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* User Info */}
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mr-4">
                  <span className="text-2xl text-white font-medium">
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900">
                    {selectedUser.name}
                  </h4>
                  <p className="text-gray-600">{selectedUser.email}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedUser.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {selectedUser.role}
                    </span>
                    {selectedUser.emailVerified && (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Member Since</p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    {new Date(selectedUser.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Total Reports</p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    {loadingReports ? '...' : userReports.length}
                  </p>
                </div>
              </div>

              {/* User Reports */}
              <div>
                <h5 className="text-sm font-semibold text-gray-700 mb-3">
                  Recent Reports
                </h5>
                {loadingReports ? (
                  <div className="py-8">
                    <Loader />
                  </div>
                ) : userReports.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">
                    No reports submitted yet
                  </p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {userReports.map((report) => (
                      <div
                        key={report._id}
                        className="border rounded-lg p-4 hover:bg-gray-50"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-xs font-semibold px-2 py-1 rounded bg-blue-100 text-blue-800 capitalize">
                                {report.wasteType}
                              </span>
                              <span
                                className={`text-xs font-semibold px-2 py-1 rounded ${
                                  report.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : report.status === 'in-progress'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-green-100 text-green-800'
                                }`}
                              >
                                {report.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 line-clamp-2">
                              {report.description}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(report.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          {report.images && report.images.length > 0 && (
                            <img
                              src={report.images[0]}
                              alt="Report"
                              className="w-16 h-16 rounded-lg object-cover ml-3"
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;