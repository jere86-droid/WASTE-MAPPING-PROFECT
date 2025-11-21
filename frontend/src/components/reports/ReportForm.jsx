import React from 'react';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import API from '../../utils/api';
import { WASTE_TYPES, URGENCY_LEVELS } from '../../utils/constants';

const ReportForm = ({ location, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    wasteType: 'plastic',
    urgency: 'medium',
    description: '',
    address: '',
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    if (location) {
      // Reverse geocode to get address
      reverseGeocode(location.lat, location.lng);
    }
  }, [location]);

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

    if (files.length + images.length > 3) {
      toast.error('Maximum 3 images allowed');
      return;
    }

    setImages([...images, ...files]);

    // Create previews
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviews(newPreviews);

    // Revoke the object URL to free memory
    URL.revokeObjectURL(imagePreviews[index]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!location) {
      toast.error('Please select a location on the map');
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('longitude', location.lng);
      formDataToSend.append('latitude', location.lat);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('wasteType', formData.wasteType);
      formDataToSend.append('urgency', formData.urgency);
      formDataToSend.append('description', formData.description);

      images.forEach((image) => {
        formDataToSend.append('images', image);
      });

      await API.post('/reports', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Report submitted successfully!');
      
      // Clean up previews
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
      
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  return (
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
          placeholder="Address will be auto-filled"
        />
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
          placeholder="Describe the waste issue..."
        />
        <p className="text-xs text-gray-500 mt-1">
          {formData.description.length}/500 characters
        </p>
      </div>

      {/* Images */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Photos (Max 3)
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
          disabled={images.length >= 3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />

        {/* Image Previews */}
        {imagePreviews.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-3">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
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
          onClick={onCancel}
          disabled={loading}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || !location}
          className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Submitting...' : 'Submit Report'}
        </button>
      </div>
    </form>
  );
};

export default ReportForm;