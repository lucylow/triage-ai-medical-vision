import React from 'react';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ConfidenceIndicatorProps {
  score: number;
  label?: string;
  size?: "sm" | "md" | "lg";
}

export const ConfidenceIndicator: React.FC<ConfidenceIndicatorProps> = ({ 
  score, 
  label = "Confidence",
  size = "md" 
}) => {
  const getConfidenceColor = (score: number) => {
    if (score >= 80) return "hsl(var(--confidence-high))";
    if (score >= 60) return "hsl(var(--confidence-medium))";
    return "hsl(var(--confidence-low))";
  };

  const getConfidenceText = (score: number) => {
    if (score >= 80) return "High";
    if (score >= 60) return "Medium";
    return "Low";
  };

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-2"
  };

  return (
    <div className="flex items-center gap-2">
      <span className={cn("text-muted-foreground", {
        "text-xs": size === "sm",
        "text-sm": size === "md",
        "text-base": size === "lg"
      })}>
        {label}:
      </span>
      <Badge 
        variant="outline" 
        className={cn(
          sizeClasses[size],
          "border-2 font-medium"
        )}
        style={{ 
          borderColor: getConfidenceColor(score),
          color: getConfidenceColor(score)
        }}
      >
        {getConfidenceText(score)} ({score}%)
      </Badge>
    </div>
  );
};