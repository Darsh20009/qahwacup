import { useEffect, useState, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Coffee, LogOut, MapPin, Camera, Clock, CheckCircle2, XCircle, 
  Loader2, ArrowRight, Calendar, AlertCircle, RefreshCw, FileText, Briefcase 
} from "lucide-react";
import LocationDistanceMap from "@/components/location-distance-map";
import type { Employee } from "@shared/schema";

interface AttendanceStatus {
  hasCheckedIn: boolean;
  hasCheckedOut: boolean;
  attendance: {
    id: string;
    checkInTime: string;
    checkOutTime?: string;
    isLate: number;
    lateMinutes?: number;
  } | null;
  todayCheckIn?: string;
  todayCheckOut?: string;
  leaveBalance?: number;
  totalLeaves?: number;
}

interface DistanceError {
  userLocation: { lat: number; lng: number };
  branchLocation: { lat: number; lng: number };
  distance: number;
  mapsUrl: string;
}

export default function EmployeeAttendance() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState<AttendanceStatus | null>(null);
  const [location, setLocationState] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [distanceError, setDistanceError] = useState<DistanceError | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const storedEmployee = localStorage.getItem("currentEmployee");
    if (storedEmployee) {
      setEmployee(JSON.parse(storedEmployee));
      fetchAttendanceStatus();
    } else {
      setLocation("/employee/gateway");
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [setLocation]);

  const fetchAttendanceStatus = async () => {
    try {
      const response = await fetch("/api/attendance/my-status", {
        credentials: "include"
      });
      if (response.ok) {
        const data = await response.json();
        setAttendanceStatus(data);
      }
    } catch (error) {
      console.error("Error fetching attendance status:", error);
    }
  };

  const getLocation = useCallback(() => {
    setLocationError(null);
    if (!navigator.geolocation) {
      setLocationError("المتصفح لا يدعم تحديد الموقع");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationState({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("تم رفض إذن تحديد الموقع. يرجى السماح بتحديد الموقع من إعدادات المتصفح.");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("معلومات الموقع غير متوفرة.");
            break;
          case error.TIMEOUT:
            setLocationError("انتهت مهلة طلب الموقع.");
            break;
          default:
            setLocationError("حدث خطأ غير معروف.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }, []);

  useEffect(() => {
    getLocation();
  }, [getLocation]);

  const startCamera = async () => {
    setIsCapturing(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "لا يمكن الوصول للكاميرا",
        variant: "destructive"
      });
      setIsCapturing(false);
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedPhoto(dataUrl);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsCapturing(false);

    const blob = await fetch(dataUrl).then(r => r.blob());
    const formData = new FormData();
    formData.append('photo', blob, 'attendance.jpg');

    try {
      const response = await fetch('/api/upload-attendance-photo', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setPhotoUrl(data.url);
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل رفع الصورة",
        variant: "destructive"
      });
    }
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    setPhotoUrl(null);
    startCamera();
  };

  const handleCheckIn = async () => {
    if (!location) {
      toast({
        title: "خطأ",
        description: "يرجى تحديد الموقع أولاً",
        variant: "destructive"
      });
      return;
    }

    if (!photoUrl) {
      toast({
        title: "خطأ",
        description: "يرجى التقاط صورة أولاً",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/attendance/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location, photoUrl }),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        // If error includes map URL, show it with a map instead of toast
        if (data.showMap && data.mapsUrl && data.userLocation && data.branchLocation) {
          setDistanceError({
            userLocation: data.userLocation,
            branchLocation: data.branchLocation,
            distance: data.distance,
            mapsUrl: data.mapsUrl
          });
        } else {
          toast({
            title: "خطأ",
            description: data.error || "فشل التحضير",
            variant: "destructive",
            duration: 10000
          });
        }
        return;
      }

      toast({
        title: "تم التحضير",
        description: data.message
      });

      fetchAttendanceStatus();
      setCapturedPhoto(null);
      setPhotoUrl(null);
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "فشل التحضير",
        variant: "destructive",
        duration: 10000
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!location) {
      toast({
        title: "خطأ",
        description: "يرجى تحديد الموقع أولاً",
        variant: "destructive"
      });
      return;
    }

    if (!photoUrl) {
      toast({
        title: "خطأ",
        description: "يرجى التقاط صورة أولاً",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/attendance/check-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location, photoUrl }),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        // If error includes map URL, show it with a map instead of toast
        if (data.showMap && data.mapsUrl && data.userLocation && data.branchLocation) {
          setDistanceError({
            userLocation: data.userLocation,
            branchLocation: data.branchLocation,
            distance: data.distance,
            mapsUrl: data.mapsUrl
          });
        } else {
          toast({
            title: "خطأ",
            description: data.error || "فشل الانصراف",
            variant: "destructive",
            duration: 10000
          });
        }
        return;
      }

      toast({
        title: "تم الانصراف",
        description: data.message
      });

      fetchAttendanceStatus();
      setCapturedPhoto(null);
      setPhotoUrl(null);
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "فشل الانصراف",
        variant: "destructive",
        duration: 10000
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("currentEmployee");
    setLocation("/employee/gateway");
  };

  if (!employee) {
    return null;
  }

  const today = new Date();
  const formattedDate = today.toLocaleDateString('ar-SA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1410] via-[#2d1f1a] to-[#1a1410] p-4" dir="rtl">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full flex items-center justify-center">
              <Coffee className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-amber-500">تسجيل الحضور</h1>
              <p className="text-gray-400 text-xs">{formattedDate}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="text-gray-400 hover:text-red-500"
            data-testid="button-logout"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>

        <Card className="bg-gradient-to-br from-[#2d1f1a] to-[#1a1410] border-amber-500/20 mb-4">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full flex items-center justify-center">
                <span className="text-white text-lg font-bold">
                  {employee.fullName?.charAt(0) || 'م'}
                </span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-white" data-testid="text-employee-name">
                  {employee.fullName}
                </h2>
                <p className="text-gray-400 text-sm">{employee.jobTitle || 'موظف'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Distance Error Map */}
        {distanceError && (
          <div className="mb-4">
            <LocationDistanceMap
              userLocation={distanceError.userLocation}
              branchLocation={distanceError.branchLocation}
              distance={distanceError.distance}
              mapsUrl={distanceError.mapsUrl}
              onClose={() => setDistanceError(null)}
            />
          </div>
        )}

        {attendanceStatus && (
          <Card className="bg-gradient-to-br from-[#2d1f1a] to-[#1a1410] border-amber-500/20 mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-amber-500 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                حالة اليوم والاجازات
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Check-in/Check-out Status */}
              <div className="space-y-2">
                {attendanceStatus.hasCheckedOut ? (
                  <div className="flex items-center gap-2 text-green-500">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>تم الانصراف</span>
                  </div>
                ) : attendanceStatus.hasCheckedIn ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-blue-400">
                      <Clock className="w-5 h-5" />
                      <span>
                        وقت الحضور: {new Date(attendanceStatus.attendance?.checkInTime || '').toLocaleTimeString('ar-SA')}
                      </span>
                    </div>
                    {attendanceStatus.attendance?.isLate === 1 && (
                      <Badge variant="destructive" className="text-xs">
                        تأخير {attendanceStatus.attendance.lateMinutes} دقيقة
                      </Badge>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-gray-400">
                    <XCircle className="w-5 h-5" />
                    <span>لم يتم التحضير بعد</span>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="h-px bg-amber-500/20"></div>

              {/* Check-in & Check-out Times */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-amber-950/30 rounded-lg p-3">
                  <p className="text-muted-foreground text-xs mb-1">وقت الحضور</p>
                  <p className="text-amber-400 font-semibold" data-testid="text-checkin-time">
                    {attendanceStatus.todayCheckIn 
                      ? new Date(attendanceStatus.todayCheckIn).toLocaleTimeString('ar-SA')
                      : 'لم يسجل بعد'}
                  </p>
                </div>
                <div className="bg-amber-950/30 rounded-lg p-3">
                  <p className="text-muted-foreground text-xs mb-1">وقت الانصراف</p>
                  <p className="text-amber-400 font-semibold" data-testid="text-checkout-time">
                    {attendanceStatus.todayCheckOut 
                      ? new Date(attendanceStatus.todayCheckOut).toLocaleTimeString('ar-SA')
                      : 'لم يسجل بعد'}
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-amber-500/20"></div>

              {/* Leave Balance */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-400">
                    <Briefcase className="w-5 h-5" />
                    <span className="text-sm">رصيد الاجازات</span>
                  </div>
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                    {attendanceStatus.leaveBalance || 0} يوم
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>إجمالي الاجازات السنوية</span>
                  <span>{attendanceStatus.totalLeaves || 0} يوم</span>
                </div>
              </div>

              {/* Apply for Leave Button */}
              <Button 
                onClick={() => setLocation("/employee/leave-request")}
                className="w-full gap-2 bg-amber-600 hover:bg-amber-700 text-white"
                data-testid="button-apply-leave"
              >
                <FileText className="w-4 h-4" />
                التقديم على اجازة
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className="bg-gradient-to-br from-[#2d1f1a] to-[#1a1410] border-amber-500/20 mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-amber-500 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              الموقع
            </CardTitle>
          </CardHeader>
          <CardContent>
            {locationError ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-red-400">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm">{locationError}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={getLocation}
                  className="border-amber-500/50 text-amber-500"
                  data-testid="button-retry-location"
                >
                  <RefreshCw className="w-4 h-4 ml-1" />
                  إعادة
                </Button>
              </div>
            ) : location ? (
              <div className="flex items-center gap-2 text-green-500">
                <CheckCircle2 className="w-5 h-5" />
                <span>تم تحديد الموقع</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-gray-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>جاري تحديد الموقع...</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#2d1f1a] to-[#1a1410] border-amber-500/20 mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-amber-500 flex items-center gap-2">
              <Camera className="w-5 h-5" />
              صورة الحضور
            </CardTitle>
            <CardDescription className="text-gray-400 text-xs">
              التقط صورة سيلفي للتأكيد
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isCapturing ? (
              <div className="space-y-3">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full rounded-lg"
                />
                <Button
                  onClick={capturePhoto}
                  className="w-full bg-amber-500 hover:bg-amber-600"
                  data-testid="button-capture"
                >
                  <Camera className="w-4 h-4 ml-2" />
                  التقاط
                </Button>
              </div>
            ) : capturedPhoto ? (
              <div className="space-y-3">
                <img
                  src={capturedPhoto}
                  alt="Captured"
                  className="w-full rounded-lg"
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={retakePhoto}
                    className="flex-1 border-amber-500/50 text-amber-500"
                    data-testid="button-retake"
                  >
                    إعادة التقاط
                  </Button>
                  {photoUrl && (
                    <div className="flex items-center text-green-500 text-sm">
                      <CheckCircle2 className="w-4 h-4 ml-1" />
                      تم الرفع
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Button
                onClick={startCamera}
                variant="outline"
                className="w-full border-amber-500/50 text-amber-500"
                data-testid="button-start-camera"
              >
                <Camera className="w-4 h-4 ml-2" />
                فتح الكاميرا
              </Button>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </CardContent>
        </Card>

        {!attendanceStatus?.hasCheckedOut && (
          <div className="space-y-3">
            {!attendanceStatus?.hasCheckedIn ? (
              <Button
                onClick={handleCheckIn}
                disabled={isLoading || !location || !photoUrl}
                className="w-full h-14 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-lg"
                data-testid="button-check-in"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin ml-2" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 ml-2" />
                )}
                تسجيل الحضور
              </Button>
            ) : (
              <Button
                onClick={handleCheckOut}
                disabled={isLoading || !location || !photoUrl}
                className="w-full h-14 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-lg"
                data-testid="button-check-out"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin ml-2" />
                ) : (
                  <ArrowRight className="w-5 h-5 ml-2" />
                )}
                تسجيل الانصراف
              </Button>
            )}
          </div>
        )}

        <div className="mt-6">
          <Button
            variant="ghost"
            onClick={() => setLocation("/employee/dashboard")}
            className="w-full text-gray-400 hover:text-amber-500"
            data-testid="button-back-dashboard"
          >
            العودة للوحة التحكم
          </Button>
        </div>
      </div>
    </div>
  );
}
