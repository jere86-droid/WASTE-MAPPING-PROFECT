import React from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../utils/api';
import Loader from '../../components/common/Loader';
import { toast } from 'react-toastify';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await API.get('/admin/stats');
      setStats(data);
    } catch (error) {
      toast.error('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  const COLORS = ['#F59E0B', '#3B82F6', '#10B981'];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Overview of waste reports and users</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Reports"
            value={stats.totalReports}
            icon="📊"
            color="bg-blue-500"
          />
          <StatCard
            title="Pending"
            value={stats.reportsByStatus.pending}
            icon="⏳"
            color="bg-yellow-500"
          />
          <StatCard
            title="In Progress"
            value={stats.reportsByStatus.inProgress}
            icon="🔄"
            color="bg-blue-500"
          />
          <StatCard
            title="Resolved"
            value={stats.reportsByStatus.resolved}
            icon="✅"
            color="bg-green-500"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Reports by Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Reports by Status
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Pending', value: stats.reportsByStatus.pending },
                    { name: 'In Progress', value: stats.reportsByStatus.inProgress },
                    { name: 'Resolved', value: stats.reportsByStatus.resolved },
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Reports by Waste Type */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Reports by Waste Type
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.reportsByWasteType}>
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Reports */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Reports
            </h3>
            <Link
              to="/admin/reports"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
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
                {stats.recentReports.map((report) => (
                  <tr key={report._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {report.user?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {report.address.substring(0, 30)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800">
                        {report.wasteType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded ${
                          report.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : report.status === 'in-progress'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Link
                        to={`/admin/reports/${report._id}`}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/admin/reports"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition text-center"
          >
            <div className="text-3xl mb-2">📋</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Manage Reports
            </h3>
            <p className="text-sm text-gray-600">
              View and update all waste reports
            </p>
          </Link>

          <Link
            to="/admin/users"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition text-center"
          >
            <div className="text-3xl mb-2">👥</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              User Management
            </h3>
            <p className="text-sm text-gray-600">
              View and manage registered users
            </p>
          </Link>

          <Link
            to="/admin/export"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition text-center"
          >
            <div className="text-3xl mb-2">📥</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Export Data
            </h3>
            <p className="text-sm text-gray-600">
              Download reports as CSV
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon, color }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center text-2xl`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;