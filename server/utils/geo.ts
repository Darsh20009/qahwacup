interface Point {
  lat: number;
  lng: number;
}

export function isPointInPolygon(point: Point, polygon: Point[]): boolean {
  if (polygon.length < 3) {
    return false;
  }

  let inside = false;
  const x = point.lng;
  const y = point.lat;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng;
    const yi = polygon[i].lat;
    const xj = polygon[j].lng;
    const yj = polygon[j].lat;

    const intersect = ((yi > y) !== (yj > y)) &&
      (x < (xj - xi) * (y - yi) / (yj - yi) + xi);

    if (intersect) {
      inside = !inside;
    }
  }

  return inside;
}

export function getDeliveryZoneForPoint(
  point: Point,
  zones: Array<{ coordinates: Point[]; nameAr: string; deliveryFee: number; _id: string }>
): { zone: string; zoneId: string; deliveryFee: number; isInZone: boolean } | null {
  for (const zone of zones) {
    if (isPointInPolygon(point, zone.coordinates)) {
      return {
        zone: zone.nameAr,
        zoneId: zone._id.toString(),
        deliveryFee: zone.deliveryFee,
        isInZone: true,
      };
    }
  }
  return null;
}

export function calculateDistance(point1: Point, point2: Point): number {
  const R = 6371;
  const dLat = toRad(point2.lat - point1.lat);
  const dLng = toRad(point2.lng - point1.lng);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(point1.lat)) * Math.cos(toRad(point2.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export const BADIAH_CENTER: Point = {
  lat: 26.3472,
  lng: 43.9750
};

export const DEFAULT_DELIVERY_FEE = 10;
