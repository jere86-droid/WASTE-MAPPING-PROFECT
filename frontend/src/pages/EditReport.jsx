import React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import API from '../utils/api';
import Loader from '../components/common/Loader';
import { toast } from 'react-toastify';
import { WASTE_TYPES, URGENCY_LEVELS } from '../utils/constants';

const EditReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [report, setReport] = useState(null);
  const [formData, setFormData] = useState({
    wasteType: '',
    urgency: '',
    description: '',
    address: '',
  });
  const [location, setLocation] = useState(null);
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    fetchReport();
  }, [id]);

  const fetchReport = async () => {
    try {
      const { data } = await API.get(`/reports/${id}`);
      
      if (data.status !== 'pending') {
        toast.error('Can only edit pending reports');
        navigate(`/reports/${id}`);
        return;
      }

      setReport(data);
      setFormData({
        wasteType: data.wasteType,
        urgency: data.urgency,
        description: data.description,
        address: data.address,
      });
      setLocation({
        lat: data.location.coordinates[1],
        lng: data.location.coordinates[0],
      });
      setExistingImages(data.images || []);
    } catch (error) {
      toast.error('Failed to load report');
      navigate('/my-reports');
    } finally {
      setLoading(false);
    }
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      setFormData((prev) => ({
        ...prev,
        address: data.display_name || `${lat}, ${lng}`,
      }));
    } catch (error) {
      setFormData((prev) => ({
        ...prev,
        address: `${lat}, ${lng}`,
      }));
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const totalImages = existingImages.length + images.length + files.length;

    if (totalImages > 3) {
      toast.error('Maximum 3 images allowed');
      return;
    }

    setImages([...images, ...files]);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  const removeNewImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    
    URL.revokeObjectURL(imagePreviews[index]);
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const removeExistingImage = (index) => {
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formDataToSend = new FormData();
      if (location) {
        formDataToSend.append('longitude', location.lng);
        formDataToSend.append('latitude', location.lat);
      }
      formDataToSend.append('address', formData.address);
      formDataToSend.append('wasteType', formData.wasteType);
      formDataToSend.append('urgency', formData.urgency);
      formDataToSend.append('description', formData.description);

      images.forEach((image) => {
        formDataToSend.append('images', image);
      });

      await API.put(`/reports/${id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Report updated successfully!');
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
      navigate(`/reports/${id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update report');
    } finally {
      setSubmitting(false);
    }
  };

  // Map click handler component
  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        setLocation(e.latlng);
        reverseGeocode(e.latlng.lat, e.latlng.lng);
      },
    });
    return null;
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center text-gray-600 hover:text-gray-900"
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
          <h1 className="text-3xl font-bold text-gray-900">Edit Report</h1>
          <p className="mt-2 text-gray-600">Update your waste report details</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Waste Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Waste Type *
                </label>
                <select
                  name="wasteType"
                  value={formData.wasteType}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {WASTE_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Urgency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Urgency Level *
                </label>
                <select
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {URGENCY_LEVELS.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location Address *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Click on the map to update location
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  maxLength={500}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.description.length}/500 characters
                </p>
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photos (Max 3 total)
                </label>

                {/* Existing Images */}
                {existingImages.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-2">Current images:</p>
                    <div className="grid grid-cols-3 gap-2">
                      {existingImages.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image}
                            alt={`Existing ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeExistingImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Images */}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  disabled={existingImages.length + images.length >= 3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />

                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`New ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Updating...' : 'Update Report'}
                </button>
              </div>
            </form>
          </div>

          {/* Map */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-[600px]">
              {location && (
                <MapContainer
                  center={[location.lat, location.lng]}
                  zoom={15}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <MapClickHandler />
                  <Marker position={[location.lat, location.lng]} />
                </MapContainer>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditReport;