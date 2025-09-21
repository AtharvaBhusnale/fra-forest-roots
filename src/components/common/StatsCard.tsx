import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  trend?: string;
  color?: "primary" | "success" | "warning" | "info";
}

export default function StatsCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend,
  color = "primary" 
}: StatsCardProps) {
  const colorClasses = {
    primary: "from-primary/10 to-primary-glow/10 border-primary/20",
    success: "from-fra-success/10 to-fra-success/20 border-fra-success/20",
    warning: "from-fra-warning/10 to-fra-warning/20 border-fra-warning/20",
    info: "from-fra-info/10 to-fra-info/20 border-fra-info/20",
  };

  const iconColorClasses = {
    primary: "text-primary",
    success: "text-fra-success",
    warning: "text-fra-warning",
    info: "text-fra-info",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={`rounded-lg border bg-gradient-to-br p-6 shadow-soft hover:shadow-medium transition-all duration-300 ${colorClasses[color]}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="mt-2 flex items-baseline space-x-2">
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {trend && (
              <span className={`text-xs font-medium ${
                trend.startsWith('+') ? 'text-fra-success' : 'text-fra-warning'
              }`}>
                {trend}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </div>
        <div className={`rounded-full bg-background/50 p-3 ${iconColorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </motion.div>
  );
}