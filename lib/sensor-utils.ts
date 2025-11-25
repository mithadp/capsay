export interface SensorReading {
  [key: string]: number;
}

export interface SensorPrediction {
  [key: string]: {
    trend: 'Naik' | 'Turun' | 'Stabil';
    '10': number | null;
    '30': number | null;
  };
}

export const SENSOR_NAMES = {
  temperature: { label: 'Temperature', unit: '°C', icon: '🌡️', color: '#FF6B6B' },
  humidity: { label: 'Humidity', unit: '%', icon: '💧', color: '#4ECDC4' },
  cahaya: { label: 'Light', unit: 'Lux', icon: '💡', color: '#FFD93D' },
  soil_moisture: { label: 'Soil Moisture', unit: '%', icon: '🌱', color: '#6BCB77' },
};

export const KEYS_TO_IGNORE = ['timestamp', 'Timestamp', 'LightDisplay'];

export const filterSensorKeys = (readings: Record<string, any>): string[] => {
  return Object.keys(readings).filter(k => !KEYS_TO_IGNORE.includes(k));
};

export const getSensorStatus = (value: number, sensorKey: string): 'optimal' | 'warning' | 'critical' => {
  const thresholds: Record<string, { optimal: [number, number], warning: [number, number] }> = {
    'Temperature': { optimal: [22, 28], warning: [18, 32] },
    'Humidity': { optimal: [40, 80], warning: [30, 90] },
    'Cahaya (LDR)': { optimal: [300, 1000], warning: [100, 1500] },
    'Soil Moisture': { optimal: [40, 80], warning: [20, 90] },
  };
  
  const threshold = thresholds[sensorKey] || { optimal: [0, 100], warning: [-Infinity, Infinity] };
  
  if (value >= threshold.optimal[0] && value <= threshold.optimal[1]) return 'optimal';
  if (value >= threshold.warning[0] && value <= threshold.warning[1]) return 'warning';
  return 'critical';
};

export const calculateStats = (history: Record<string, any>): Record<string, any> => {
  const stats: Record<string, any> = {};
  const values: Record<string, number[]> = {};
  
  if (!history || Object.keys(history).length === 0) return stats;
  
  Object.values(history).forEach((reading: any) => {
    Object.entries(reading).forEach(([key, val]: [string, any]) => {
      if (typeof val === 'number' && !KEYS_TO_IGNORE.includes(key)) {
        if (!values[key]) values[key] = [];
        values[key].push(val);
      }
    });
  });
  
  Object.entries(values).forEach(([key, vals]) => {
    if (vals.length === 0) return;
    const sorted = [...vals].sort((a, b) => a - b);
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
    stats[key] = {
      current: vals[vals.length - 1],
      min: sorted[0],
      max: sorted[sorted.length - 1],
      mean: Math.round(mean * 100) / 100,
    };
  });
  
  return stats;
};
