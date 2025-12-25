import { Plus } from "lucide-react";
import { Card } from "../../ui/card";
import { useTemplateActions } from "../hooks";

export const BlankBoardCard = () => {
  const { handleNewBoard } = useTemplateActions();

  return (
    <Card
      className="shrink-0 w-[160px] min-w-[160px] cursor-pointer snap-start group hover:border-primary/50 transition-all py-0! gap-0! bg-card"
      onClick={handleNewBoard}
    >
      {/* Template Preview */}
      <div className="h-[80px] w-full rounded-xl bg-gray-100 flex items-center justify-center relative overflow-hidden">
        {/* Illustration: Mini Canvas/Easel */}
        <div className="relative flex flex-col items-center">
          {/* Canvas frame */}
          <div className="w-12 h-9 rounded border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-white relative">
            {/* Canvas content - grid lines suggesting blank canvas */}
            <div className="absolute inset-1 border border-dashed border-gray-200 rounded-sm" />
            {/* Small accent shapes suggesting potential content */}
            <div className="absolute top-1.5 left-1.5 w-1.5 h-1.5 rounded-full bg-primary/20" />
            <div className="absolute bottom-1.5 right-1.5 w-2 h-1 rounded-sm bg-amber-200/50" />
          </div>
          {/* Easel legs */}
          <div className="flex gap-4 -mt-0.5">
            <div className="w-0.5 h-2 bg-gray-200 rounded-full transform -rotate-12" />
            <div className="w-0.5 h-2 bg-gray-200 rounded-full transform rotate-12" />
          </div>
        </div>
        {/* Plus overlay */}
        <div className="absolute bottom-1.5 right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
          <Plus size={12} strokeWidth={2.5} className="text-white" />
        </div>
      </div>
      {/* Label */}
      <div className="px-2.5 py-2 flex items-center gap-1">
        <span className="text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors">
          New Board
        </span>
      </div>
    </Card>
  );
};
