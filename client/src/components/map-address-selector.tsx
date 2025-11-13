import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Polygon, Marker, useMapEvents, Popup } from "react-leaflet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MapPin, Check, X, Navigation, Search } from "lucide-react";
import { DELIVERY_ZONES, getZoneForLocation, type DeliveryZone } from "@shared/zones";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
 iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
 iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
 shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface MapAddressSelectorProps {
 onAddressSelected: (address: {
 fullAddress: string;
 lat: number;
 lng: number;
 zone: string;
 }) => void;
 onCancel: () => void;
}

function LocationMarker({
 position,
 setPosition,
 setSelectedZone,
}: {
 position: { lat: number; lng: number } | null;
 setPosition: (pos: { lat: number; lng: number }) => void;
 setSelectedZone: (zone: DeliveryZone | null) => void;
}) {
 useMapEvents({
 click(e) {
 const newPos = {
 lat: e.latlng.lat,
 lng: e.latlng.lng,
 };
 setPosition(newPos);
 const zone = getZoneForLocation(newPos);
 setSelectedZone(zone);
 },
 });

 return position === null ? null : (
 <Marker position={[position.lat, position.lng]}>
 <Popup>الموقع المحدد</Popup>
 </Marker>
 );
}

export default function MapAddressSelector({
 onAddressSelected,
 onCancel,
}: MapAddressSelectorProps) {
 const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
 const [selectedZone, setSelectedZone] = useState<DeliveryZone | null>(null);
 const [address, setAddress] = useState("");
 const [isLoadingLocation, setIsLoadingLocation] = useState(false);
 const mapRef = useRef<L.Map>(null);

 const centerPosition: [number, number] = [24.7093, 46.6802];

 const handleGetCurrentLocation = () => {
 setIsLoadingLocation(true);
 if (!navigator.geolocation) {
 alert("المتصفح لا يدعم تحديد الموقع الجغرافي");
 setIsLoadingLocation(false);
 return;
 }

 navigator.geolocation.getCurrentPosition(
 (position) => {
 const newPos = {
 lat: position.coords.latitude,
 lng: position.coords.longitude,
 };
 setPosition(newPos);
 const zone = getZoneForLocation(newPos);
 setSelectedZone(zone);

 if (mapRef.current) {
 mapRef.current.setView([newPos.lat, newPos.lng], 15);
 }
 setIsLoadingLocation(false);
 },
 (error) => {
 console.error("Error getting location:", error);
 let errorMessage = "فشل في تحديد الموقع";
 if (error.code === error.PERMISSION_DENIED) {
 errorMessage = "يرجى السماح بالوصول إلى الموقع من إعدادات المتصفح";
 } else if (error.code === error.POSITION_UNAVAILABLE) {
 errorMessage = "الموقع غير متاح حالياً";
 } else if (error.code === error.TIMEOUT) {
 errorMessage = "انتهت مهلة تحديد الموقع، يرجى المحاولة مرة أخرى";
 }
 alert(errorMessage);
 setIsLoadingLocation(false);
 }
 );
 };

 const handleConfirm = () => {
 if (!position || !selectedZone) return;

 const fullAddress = address || `${selectedZone.nameAr}، الرياض`;
 
 onAddressSelected({
 fullAddress,
 lat: position.lat,
 lng: position.lng,
 zone: selectedZone.nameAr,
 });
 };

 return (
 <div className="space-y-4" data-testid="map-address-selector">
 <Card className="border-2 border-primary/20">
 <CardContent className="p-4 space-y-4">
 <div className="flex items-start gap-2">
 <MapPin className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
 <div className="flex-1 space-y-2">
 <p className="text-sm font-semibold">حدد موقع التوصيل</p>
 <p className="text-xs text-muted-foreground">
 اضغط على الخريطة لاختيار موقعك أو استخدم زر تحديد الموقع الحالي
 </p>
 </div>
 </div>

 {selectedZone ? (
 <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-500 rounded-lg p-3 flex items-start gap-2">
 <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
 <div className="flex-1">
 <p className="font-semibold text-green-700 dark:text-green-400">
 موقعك داخل منطقة التوصيل
 </p>
 <p className="text-sm text-green-600 dark:text-green-300 mt-1">
 {selectedZone.nameAr} - رسوم التوصيل: {selectedZone.deliveryFee} ريال
 </p>
 </div>
 </div>
 ) : position ? (
 <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-lg p-3 flex items-start gap-2">
 <X className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
 <div className="flex-1">
 <p className="font-semibold text-red-700 dark:text-red-400">
 موقعك خارج منطقة التوصيل
 </p>
 <p className="text-sm text-red-600 dark:text-red-300 mt-1">
 التوصيل متاح فقط في البديعةوظهران البديعة
 </p>
 </div>
 </div>
 ) : null}
 </CardContent>
 </Card>

 <div className="space-y-2">
 <Button
 variant="outline"
 className="w-full"
 onClick={handleGetCurrentLocation}
 disabled={isLoadingLocation}
 data-testid="button-get-current-location"
 >
 <Navigation className="w-4 h-4 ml-2" />
 {isLoadingLocation ? "جاري تحديد الموقع..." : "استخدام موقعي الحالي"}
 </Button>
 </div>

 <div className="h-96 rounded-lg overflow-hidden border-2 border-border" data-testid="map-container">
 <MapContainer
 center={centerPosition}
 zoom={14}
 style={{ height: "100%", width: "100%" }}
 ref={mapRef}
 >
 <TileLayer
 attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
 url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
 />

 {DELIVERY_ZONES.map((zone) => (
 <Polygon
 key={zone.id}
 positions={zone.coordinates.map((c) => [c.lat, c.lng])}
 pathOptions={{
 color: zone.color,
 fillColor: zone.color,
 fillOpacity: 0.2,
 weight: 2,
 }}
 >
 <Popup>
 <div className="text-right">
 <p className="font-semibold">{zone.nameAr}</p>
 <p className="text-sm">رسوم التوصيل: {zone.deliveryFee} ريال</p>
 </div>
 </Popup>
 </Polygon>
 ))}

 <LocationMarker
 position={position}
 setPosition={setPosition}
 setSelectedZone={setSelectedZone}
 />
 </MapContainer>
 </div>

 <div className="space-y-2">
 <label className="text-sm font-medium">العنوان التفصيلي (اختياري)</label>
 <Input
 placeholder="مثال: شارع الأمير سلطان، مبنى 123"
 value={address}
 onChange={(e) => setAddress(e.target.value)}
 data-testid="input-detailed-address"
 />
 </div>

 <div className="flex gap-2">
 <Button
 className="flex-1"
 onClick={handleConfirm}
 disabled={!position || !selectedZone}
 data-testid="button-confirm-address"
 >
 <Check className="w-4 h-4 ml-2" />
 تأكيد العنوان
 </Button>
 <Button
 variant="outline"
 onClick={onCancel}
 data-testid="button-cancel-address"
 >
 إلغاء
 </Button>
 </div>

 <div className="bg-muted/50 p-3 rounded-lg flex items-center justify-center gap-2">
 <MapPin className="w-4 h-4 text-muted-foreground" />
 <p className="text-xs text-muted-foreground">
 المناطق الخضراء والزرقاء تمثل مناطق التوصيل المتاحة 
 </p>
 </div>
 </div>
 );
}
