import { cn } from "@/lib/utils";

interface WavyLineProps {
  className?: string;
  color?: "primary" | "accent" | "success";
}

export function WavyLine({ className, color = "accent" }: WavyLineProps) {
  const colorClasses = {
    primary: "text-primary",
    accent: "text-accent",
    success: "text-success",
  };
  
  return (
    <svg 
      className={cn("w-12 h-3", colorClasses[color], className)} 
      viewBox="0 0 48 12" 
      fill="none"
    >
      <path 
        d="M0 6C4 6 4 2 8 2C12 2 12 6 16 6C20 6 20 2 24 2C28 2 28 6 32 6C36 6 36 2 40 2C44 2 44 6 48 6" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

interface HexagonIconProps {
  icon: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  borderColor?: string;
}

export function HexagonIcon({ icon, className, size = "md", borderColor }: HexagonIconProps) {
  const sizeClasses = {
    sm: "w-12 h-14",
    md: "w-16 h-[4.5rem]",
    lg: "w-20 h-[5.5rem]",
    xl: "w-24 h-[6.5rem]",
  };
  
  return (
    <div 
      className={cn(
        "relative flex items-center justify-center",
        sizeClasses[size],
        className
      )}
    >
      <svg viewBox="0 0 100 115" className="absolute inset-0 w-full h-full">
        <polygon 
          points="50 1 95 25 95 75 50 99 5 75 5 25" 
          fill="white" 
          stroke={borderColor || "currentColor"} 
          strokeWidth="3"
        />
      </svg>
      <div className="relative z-10">{icon}</div>
    </div>
  );
}

interface FloatingShapeProps {
  variant: "diamond" | "square" | "triangle" | "dots" | "lines";
  className?: string;
  color?: string;
}

export function FloatingShape({ variant, className, color }: FloatingShapeProps) {
  const shapes = {
    diamond: (
      <svg viewBox="0 0 24 24" className={cn("w-8 h-8", className)}>
        <path 
          d="M12 2L22 12L12 22L2 12L12 2Z" 
          fill={color || "hsl(var(--accent))"} 
          opacity="0.6"
        />
      </svg>
    ),
    square: (
      <div className={cn("w-4 h-4 rotate-12", className)} style={{ backgroundColor: color || "hsl(50 100% 50%)" }} />
    ),
    triangle: (
      <svg viewBox="0 0 24 24" className={cn("w-6 h-6", className)}>
        <path 
          d="M12 2L22 20H2L12 2Z" 
          fill="none"
          stroke={color || "hsl(38 92% 50%)"}
          strokeWidth="2"
        />
      </svg>
    ),
    dots: (
      <div className={cn("grid grid-cols-3 gap-1", className)}>
        {[...Array(9)].map((_, i) => (
          <div 
            key={i} 
            className="w-1 h-1 rounded-full" 
            style={{ backgroundColor: color || "hsl(var(--muted-foreground))" }}
          />
        ))}
      </div>
    ),
    lines: (
      <svg viewBox="0 0 24 24" className={cn("w-6 h-6", className)}>
        <path 
          d="M4 4L12 12M12 4L20 12" 
          stroke={color || "hsl(var(--primary))"} 
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  };
  
  return shapes[variant];
}

export function SectionIcon({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn(
      "w-20 h-20 mx-auto mb-6 flex items-center justify-center",
      "rounded-2xl border-2 border-primary/20 bg-card shadow-sm",
      className
    )}>
      {children}
    </div>
  );
}
