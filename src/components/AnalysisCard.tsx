import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface AnalysisCardProps {
  icon: LucideIcon;
  title: string;
  value: string;
  description: string;
  index: number;
  status?: "good" | "warning" | "bad";
}

const AnalysisCard = ({ icon: Icon, title, value, description, index, status = "good" }: AnalysisCardProps) => {
  const statusColors = {
    good: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    bad: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="bg-card rounded-xl border border-border p-5 hover:shadow-lg transition-shadow duration-300"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 rounded-lg bg-primary/5">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${statusColors[status]}`}>
          {value}
        </span>
      </div>
      <h3 className="font-semibold text-foreground text-sm mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
    </motion.div>
  );
};

export default AnalysisCard;
