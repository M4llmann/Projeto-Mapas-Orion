// src/utils/regionUtils.js
export const calculateRegionFromPoints = (points) => {
  if (!points || points.length === 0) return null;

  const { minLat, maxLat, minLng, maxLng } = points.reduce(
    (acc, point) => ({
      minLat: Math.min(acc.minLat, point.latitude),
      maxLat: Math.max(acc.maxLat, point.latitude),
      minLng: Math.min(acc.minLng, point.longitude),
      maxLng: Math.max(acc.maxLng, point.longitude),
    }),
    { minLat: 90, maxLat: -90, minLng: 180, maxLng: -180 }
  );

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: (maxLat - minLat) * 1.5 || 0.05,
    longitudeDelta: (maxLng - minLng) * 1.5 || 0.05,
  };
};
