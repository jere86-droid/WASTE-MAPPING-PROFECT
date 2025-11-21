// Waste types
export const WASTE_TYPES = [
  { value: 'plastic', label: 'Plastic', color: '#3B82F6' },
  { value: 'organic', label: 'Organic', color: '#84cc16' },
  { value: 'metal', label: 'Metal', color: '#6B7280' },
  { value: 'electronic', label: 'Electronic', color: '#8B5CF6' },
  { value: 'mixed', label: 'Mixed', color: '#F59E0B' },
  { value: 'hazardous', label: 'Hazardous', color: '#EF4444' },
];

// Urgency levels
export const URGENCY_LEVELS = [
  { value: 'low', label: 'Low', color: '#10B981' },
  { value: 'medium', label: 'Medium', color: '#F59E0B' },
  { value: 'high', label: 'High', color: '#F97316' },
  { value: 'critical', label: 'Critical', color: '#EF4444' },
];

// Status types
export const STATUS_TYPES = [
  { value: 'pending', label: 'Pending', color: '#F59E0B' },
  { value: 'in-progress', label: 'In Progress', color: '#3B82F6' },
  { value: 'resolved', label: 'Resolved', color: '#10B981' },
];

// Get color by waste type
export const getWasteTypeColor = (type) => {
  return WASTE_TYPES.find((w) => w.value === type)?.color || '#6B7280';
};

// Get color by urgency
export const getUrgencyColor = (urgency) => {
  return URGENCY_LEVELS.find((u) => u.value === urgency)?.color || '#10B981';
};

// Get color by status
export const getStatusColor = (status) => {
  return STATUS_TYPES.find((s) => s.value === status)?.color || '#6B7280';
};

// Default map center (Athi River, Kenya)
export const DEFAULT_CENTER = [-1.4354, 36.9815];
export const DEFAULT_ZOOM = 13;