import { Sparkles } from "lucide-react";
import { Card } from "../../ui/card";
import { TemplatePreview } from "./TemplatePreview";
import { templateColors } from "../templates.store";

interface TemplateCardProps {
  template: {
    id: string;
    name: string;
  };
  index: number;
}

export const TemplateCard = ({ template, index }: TemplateCardProps) => {
  const colors = templateColors[index % templateColors.length];

  return (
    <Card className="shrink-0 w-[160px] min-w-[160px] cursor-pointer snap-start group hover:border-primary/50 transition-all py-0! gap-0! bg-card">
      <TemplatePreview
        index={index}
        bgColor={colors.bg}
        accentColor={colors.accent}
      />
      {/* Label */}
      <div className="px-2.5 py-2 flex items-center gap-1">
        <Sparkles size={10} className="text-amber-500 shrink-0" />
        <span className="text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors">
          {template.name}
        </span>
      </div>
    </Card>
  );
};
