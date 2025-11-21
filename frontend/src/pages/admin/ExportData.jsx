import { useState } from 'react';
import API from '../../utils/api';
import { toast } from 'react-toastify';

const ExportData = () => {
  const [exporting, setExporting] = useState(false);
  const [announcement, setAnnouncement] = useState({
    title: '',
    message: '',
  });
  const [sending, setSending] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await API.get('/admin/reports/export', {
        responseType: 'blob',
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `wastemap-reports-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success('Reports exported successfully');
    } catch (error) {
      toast.error('Failed to export reports');
    } finally {
      setExporting(false);
    }
  };

  const handleAnnouncementChange = (e) => {
    setAnnouncement({
      ...announcement,
      [e.target.name]: e.target.value,
    });
  };

  const handleSendAnnouncement = async (e) => {
    e.preventDefault();

    if (!announcement.title || !announcement.message) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!window.confirm('Send announcement to all verified users?')) {
      return;
    }

    setSending(true);
    try {
      const { data } = await API.post('/admin/announcements', announcement);
      toast.success(data.message);
      setAnnouncement({ title: '', message: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send announcement');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Export & Announcements
          </h1>
          <p className="mt-2 text-gray-600">
            Download data and send announcements to users
          </p>
        </div>

        <div className="space-y-6">
          {/* Export Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
                    <svg
                      className="w-6 h-6 text-primary-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Export Reports
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Download all reports as CSV file
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-800">
                    The exported CSV file will include all report details:
                  </p>
                  <ul className="mt-2 text-sm text-blue-700 list-disc list-inside space-y-1">
                    <li>Report ID and user information</li>
                    <li>Location and address</li>
                    <li>Waste type, urgency, and status</li>
                    <li>Description and upvotes</li>
                    <li>Created and updated timestamps</li>
                  </ul>
                </div>

                <button
                  onClick={handleExport}
                  disabled={exporting}
                  className="w-full md:w-auto px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {exporting ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Exporting...
                    </>
                  ) : (
                    <>
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
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Export to CSV
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Announcements Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Send Announcement
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Broadcast a message to all verified users
                </p>
              </div>
            </div>

            <form onSubmit={handleSendAnnouncement} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Announcement Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={announcement.title}
                  onChange={handleAnnouncementChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., System Maintenance Notice"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  name="message"
                  value={announcement.message}
                  onChange={handleAnnouncementChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  placeholder="Write your announcement message here..."
                />
              </div>

              {/* Warning */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex">
                  <svg
                    className="w-5 h-5 text-yellow-600 mr-3 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-yellow-800">
                      Important Notice
                    </p>
                    <p className="text-sm text-yellow-700 mt-1">
                      This announcement will be sent to all verified users via
                      email and in-app notifications. Please review carefully
                      before sending.
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={sending}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? 'Sending...' : 'Send Announcement'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportData;