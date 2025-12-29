import { MapPin, Phone, MapOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Branch } from "@shared/schema";

interface BranchCardProps {
  branch: Branch;
  distance?: number;
  onViewMap?: () => void;
}

export default function BranchCard({ branch, distance, onViewMap }: BranchCardProps) {
  const getDistanceText = () => {
    if (!distance) return null;
    if (distance < 1000) return `${Math.round(distance)} متر`;
    return `${(distance / 1000).toFixed(1)} كم`;
  };

  return (
    <Card className="overflow-hidden border-2 border-primary/30 hover:border-primary/60 transition-all duration-300 hover:shadow-lg" data-testid={`card-branch-${branch.id}`}>
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h3 className="font-amiri text-lg sm:text-xl font-bold text-foreground" data-testid={`text-branch-name-${branch.id}`}>
                {branch.nameAr}
              </h3>
              {distance !== undefined && (
                <Badge variant="secondary" className="mt-2 bg-primary/20 text-primary">
                  {getDistanceText()}
                </Badge>
              )}
            </div>
          </div>

          {/* Address & City */}
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <div className="text-sm text-muted-foreground" data-testid={`text-branch-address-${branch.id}`}>
                <p>{branch.address}</p>
                <p>{branch.city}</p>
              </div>
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-primary flex-shrink-0" />
            <a 
              href={`tel:${branch.phone}`}
              className="text-sm text-primary hover:text-primary/80 transition-colors"
              data-testid={`link-branch-phone-${branch.id}`}
            >
              {branch.phone}
            </a>
          </div>

          {/* Action Button */}
          {onViewMap && branch.location && (
            <Button 
              onClick={onViewMap}
              variant="outline"
              size="sm"
              className="w-full mt-2"
              data-testid={`button-view-map-${branch.id}`}
            >
              <MapOpen className="w-4 h-4 ml-2" />
              عرض على الخريطة
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
