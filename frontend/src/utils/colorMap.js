// colorMap.js

const colorMap = {
  // Color names with inline styles
  blue: {
    backgroundColor: '#DBEAFE',
    borderColor: '#60A5FA',
    color: '#1D4ED8',
    hex: '#3B82F6',
  },
  red: {
    backgroundColor: '#FECACA',
    borderColor: '#F87171',
    color: '#DC2626',
    hex: '#EF4444',
  },
  yellow: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FBBF24',
    color: '#D97706',
    hex: '#F59E0B',
  },
  orange: {
    backgroundColor: '#FED7AA',
    borderColor: '#FB923C',
    color: '#EA580C',
    hex: '#F97316',
  },
  purple: {
    backgroundColor: '#E9D5FF',
    borderColor: '#C084FC',
    color: '#9333EA',
    hex: '#A855F7',
  },
  pink: {
    backgroundColor: '#FCE7F3',
    borderColor: '#F472B6',
    color: '#DB2777',
    hex: '#EC4899',
  },
  cyan: {
    backgroundColor: '#CFFAFE',
    borderColor: '#22D3EE',
    color: '#0891B2',
    hex: '#06B6D4',
  },
  green: {
    backgroundColor: '#D1FAE5',
    borderColor: '#34D399',
    color: '#059669',
    hex: '#10B981',
  },
  // Hex color mappings
  '#3B82F6': {
    backgroundColor: '#DBEAFE',
    borderColor: '#60A5FA',
    color: '#1D4ED8',
    hex: '#3B82F6',
  },
  '#EF4444': {
    backgroundColor: '#FECACA',
    borderColor: '#F87171',
    color: '#DC2626',
    hex: '#EF4444',
  },
  '#F59E0B': {
    backgroundColor: '#FEF3C7',
    borderColor: '#FBBF24',
    color: '#D97706',
    hex: '#F59E0B',
  },
  '#F97316': {
    backgroundColor: '#FED7AA',
    borderColor: '#FB923C',
    color: '#EA580C',
    hex: '#F97316',
  },
  '#A855F7': {
    backgroundColor: '#E9D5FF',
    borderColor: '#C084FC',
    color: '#9333EA',
    hex: '#A855F7',
  },
  '#EC4899': {
    backgroundColor: '#FCE7F3',
    borderColor: '#F472B6',
    color: '#DB2777',
    hex: '#EC4899',
  },
  '#06B6D4': {
    backgroundColor: '#CFFAFE',
    borderColor: '#22D3EE',
    color: '#0891B2',
    hex: '#06B6D4',
  },
  '#10B981': {
    backgroundColor: '#D1FAE5',
    borderColor: '#34D399',
    color: '#059669',
    hex: '#10B981',
  },
};

// Helper function to get color mapping by hex or name
export const getColorMapping = (color) => {
  if (!color) return colorMap.blue;
  
  // First try exact match
  if (colorMap[color]) return colorMap[color];
  
  // If it's a hex color, try to find a close match
  if (color.startsWith('#')) {
    const upperColor = color.toUpperCase();
    if (colorMap[upperColor]) return colorMap[upperColor];
    
    // Try to match by comparing hex values
    for (const [key, value] of Object.entries(colorMap)) {
      if (value.hex && value.hex.toUpperCase() === upperColor) {
        return value;
      }
    }
  }
  
  // Fallback to blue
  return colorMap.blue;
};

export default colorMap;
