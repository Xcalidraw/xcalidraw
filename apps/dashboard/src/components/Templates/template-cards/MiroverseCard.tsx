import { ArrowRight } from "lucide-react";
import { Card } from "../../ui/card";

export const MiroverseCard = () => {
  return (
    <Card className="shrink-0 w-[160px] min-w-[160px] cursor-pointer snap-start group hover:border-primary/50 transition-all py-0! gap-0! bg-card">
      <div className="h-[80px] w-full rounded-t-xl flex items-center justify-center bg-linear-to-br from-violet-100 via-pink-50 to-amber-100 relative overflow-hidden">
        {/* Collage of circles */}
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-linear-to-br from-violet-400 to-purple-500 border-2 border-white shadow-sm" />
          <div className="absolute top-4 left-0 w-6 h-6 rounded-full bg-linear-to-br from-amber-400 to-orange-500 border-2 border-white shadow-sm" />
          <div className="absolute top-4 right-0 w-6 h-6 rounded-full bg-linear-to-br from-cyan-400 to-blue-500 border-2 border-white shadow-sm" />
          <div className="absolute bottom-0 left-1/4 w-6 h-6 rounded-full bg-linear-to-br from-rose-400 to-pink-500 border-2 border-white shadow-sm" />
          <div className="absolute bottom-0 right-1/4 w-6 h-6 rounded-full bg-linear-to-br from-emerald-400 to-green-500 border-2 border-white shadow-sm" />
        </div>
      </div>
      <div className="px-2.5 py-2 flex items-center gap-1">
        <span className="text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors">
          From Miroverse
        </span>
        <ArrowRight size={10} className="text-muted-foreground shrink-0" />
      </div>
    </Card>
  );
};
