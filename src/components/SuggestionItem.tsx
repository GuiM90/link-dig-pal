import { motion } from "framer-motion";
import { CheckCircle2, AlertCircle, XCircle } from "lucide-react";

interface SuggestionItemProps {
  text: string;
  priority: "high" | "medium" | "low";
  index: number;
}

const SuggestionItem = ({ text, priority, index }: SuggestionItemProps) => {
  const icons = {
    high: <XCircle className="w-4 h-4 text-red-500 shrink-0" />,
    medium: <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />,
    low: <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />,
  };

  const labels = { high: "Urgente", medium: "Recomendado", low: "Bom" };

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.5 + index * 0.08 }}
      className="flex items-start gap-3 py-3 border-b border-border last:border-0"
    >
      {icons[priority]}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground">{text}</p>
      </div>
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {labels[priority]}
      </span>
    </motion.div>
  );
};

export default SuggestionItem;
