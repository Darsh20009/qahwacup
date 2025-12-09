import { Badge } from "@/components/ui/badge";
import { 
 getCoffeeStrengthConfig, 
 getCoffeeStrengthDisplay,
 getStrengthLevelDisplay 
} from "@/lib/utils";
import { cn } from "@/lib/utils";

interface CoffeeStrengthBadgeProps {
 strength: string | null;
 strengthLevel: number | null;
 className?: string;
 size?: "sm" | "md" | "lg";
}

export default function CoffeeStrengthBadge({ 
 strength, 
 strengthLevel, 
 className,
 size = "md" 
}: CoffeeStrengthBadgeProps) {
 const config = getCoffeeStrengthConfig(strength);
 const displayText = getCoffeeStrengthDisplay(strength, strengthLevel);
 const levelText = getStrengthLevelDisplay(strengthLevel);

 // Size variants
 const sizeClasses = {
 sm: "px-2 py-0.5 text-xs",
 md: "px-3 py-1 text-sm", 
 lg: "px-4 py-1.5 text-base"
 };

 const iconSizes = {
 sm: "text-xs",
 md: "text-sm",
 lg: "text-base"
 };

 return (
 <div className={cn("flex items-center gap-1", className)} data-testid={`strength-badge-${strength}`}>
 {/* Main Strength Badge */}
 <Badge 
 variant="outline"
 className={cn(
 "font-semibold rounded-full transition-all duration-300 hover:scale-105 border-2",
 config.bgColor,
 config.textColor, 
 config.borderColor,
 sizeClasses[size]
 )}
 data-testid={`badge-strength-${strength}`}
 >
 <span className={cn("mr-1", iconSizes[size])} role="img" aria-label="coffee strength icon">
 {config.icon}
 </span>
 {config.labelAr}
 </Badge>

 {/* Level Indicator (if available) */}
 {strengthLevel !== null && (
 <Badge 
 variant="secondary"
 className={cn(
 "font-mono text-xs bg-secondary/20 text-secondary-foreground border border-secondary/30 rounded-full",
 size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs"
 )}
 data-testid={`badge-level-${strengthLevel}`}
 >
 {levelText}
 </Badge>
 )}
 </div>
 );
}

/**
 * Animated Coffee Strength Indicator - For detailed views
 */
export function CoffeeStrengthIndicator({ 
 strength, 
 strengthLevel, 
 className,
 showDescription = false 
}: CoffeeStrengthBadgeProps & { showDescription?: boolean }) {
 const config = getCoffeeStrengthConfig(strength);
 const maxLevel = 12;
 const currentLevel = strengthLevel || 0;
 const percentage = strengthLevel ? (strengthLevel / maxLevel) * 100 : 0;

 return (
 <div 
 className={cn("p-4 rounded-lg border", config.bgColor, config.borderColor, className)}
 data-testid={`strength-indicator-${strength}`}
 >
 <div className="flex items-center justify-between mb-2">
 <div className="flex items-center gap-2">
 <span className="text-xl" role="img" aria-label="coffee strength icon">
 {config.icon}
 </span>
 <span className={cn("font-bold text-lg", config.textColor)}>
 قوة القهوة 
 </span>
 </div>
 <Badge 
 variant="outline" 
 className={cn(
 "font-semibold",
 config.bgColor,
 config.textColor,
 config.borderColor
 )}
 >
 {config.labelAr}
 </Badge>
 </div>

 {/* Strength Level Bar */}
 {strengthLevel !== null && (
 <div className="mb-3">
 <div className="flex items-center justify-between text-sm mb-1">
 <span className={config.textColor}>المستوى:</span>
 <span className={cn("font-mono font-bold", config.textColor)}>
 {strengthLevel}/12
 </span>
 </div>
 <div className="relative h-2 bg-secondary/20 rounded-full overflow-hidden">
 <div 
 className={cn(
 "absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out",
 config.textColor.replace('text-', 'bg-')
 )}
 style={{ width: `${percentage}%` }}
 data-testid={`strength-bar-${strengthLevel}`}
 />
 {/* Animated shine effect */}
 <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-pulse" />
 </div>
 </div>
 )}

 {/* Description */}
 {showDescription && (
 <p className={cn("text-sm leading-relaxed", config.textColor)}>
 {config.description}
 </p>
 )}
 </div>
 );
}

/**
 * Compact strength display for list views
 */
export function CoffeeStrengthCompact({ 
 strength, 
 strengthLevel, 
 className 
}: CoffeeStrengthBadgeProps) {
 const config = getCoffeeStrengthConfig(strength);
 
 return (
 <div 
 className={cn(
 "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
 config.bgColor,
 config.textColor,
 config.borderColor,
 "border",
 className
 )}
 data-testid={`strength-compact-${strength}`}
 >
 <span role="img" aria-label="strength icon">{config.icon}</span>
 <span>{config.labelAr}</span>
 {strengthLevel && (
 <span className="font-mono">({strengthLevel})</span>
 )}
 </div>
 );
}