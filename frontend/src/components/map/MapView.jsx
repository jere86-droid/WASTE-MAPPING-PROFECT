import React from 'react';
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { DEFAULT_CENTER, DEFAULT_ZOOM, getWasteTypeColor } from '../../utils/constants';
import { createCustomIcon } from '../../utils/leafletIcons';
import 'leaflet/dist/leaflet.css';

const MapView = ({ reports, onMapClick, selectedLocation }) => {
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.log('Error getting location:', error);
        }
      );
    }
  }, []);

  // Component to handle map clicks
  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        if (onMapClick) {
          onMapClick(e.latlng);
        }
      },
    });
    return null;
  };

  const center = userLocation || DEFAULT_CENTER;

  return (
    <MapContainer
      center={center}
      zoom={DEFAULT_ZOOM}
      style={{ height: '100%', width: '100%' }}
      className="rounded-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapClickHandler />

      {/* User's current location marker */}
      {userLocation && (
        <Marker position={userLocation}>
          <Popup>
            <div className="text-center">
              <p className="font-semibold">Your Location</p>
            </div>
          </Popup>
        </Marker>
      )}

      {/* Selected location marker (when creating report) */}
      {selectedLocation && (
        <Marker
          position={[selectedLocation.lat, selectedLocation.lng]}
          icon={createCustomIcon('#10B981')}
        >
          <Popup>
            <div className="text-center">
              <p className="font-semibold">New Report Location</p>
            </div>
          </Popup>
        </Marker>
      )}

      {/* Report markers */}
      {reports &&
        reports.map((report) => (
          <Marker
            key={report._id}
            position={[
              report.location.coordinates[1],
              report.location.coordinates[0],
            ]}
            icon={createCustomIcon(getWasteTypeColor(report.wasteType))}
          >
            <Popup>
              <ReportPopup report={report} />
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
};

// Report Popup Component
const ReportPopup = ({ report }) => {
  const statusColors = {
    pending: 'text-yellow-600',
    'in-progress': 'text-blue-600',
    resolved: 'text-green-600',
  };

  return (
    <div className="min-w-[200px]">
      {report.images && report.images.length > 0 && (
        <img
          src={report.images[0]}
          alt="Waste"
          className="w-full h-32 object-cover rounded mb-2"
        />
      )}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-gray-900 capitalize">
            {report.wasteType}
          </span>
          <span className={`text-xs font-semibold ${statusColors[report.status]}`}>
            {report.status}
          </span>
        </div>
        <p className="text-xs text-gray-600">{report.address}</p>
        <p className="text-sm text-gray-700 line-clamp-2">{report.description}</p>
        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
          <span>👍 {report.upvotes}</span>
          <span>{new Date(report.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

export default MapView;