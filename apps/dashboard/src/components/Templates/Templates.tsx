import { useNavigate } from "react-router-dom";
import {
  Plus,
  LayoutTemplate,
  ArrowRight,
  Grid3X3,
  Sparkles,
} from "lucide-react";
import { useAtom } from "jotai";
import { templatesAtom } from "../../store";

export const Templates = () => {
  const [templates] = useAtom(templatesAtom);
  const navigate = useNavigate();

  const handleNewBoard = () => {
    const boardId = `board-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    navigate(`/board/${boardId}`);
  };

  return (
    <section className="flex flex-col gap-6 w-full max-w-full py-8 border-b border-border bg-muted max-md:pt-5 max-md:pb-4 max-md:gap-4">
      {/* Header */}
      <div className="flex items-center justify-between px-8 max-md:px-4">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-primary" />
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
            Start creating
          </h3>
        </div>
        <button className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors">
          <span>View all templates</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Templates Track */}
      <div className="flex gap-4 overflow-x-auto overflow-y-hidden px-8 py-2 pb-4 snap-x snap-mandatory overscroll-contain touch-pan-x max-md:px-4 max-md:gap-3 scrollbar-hide">
        
        {/* Create New Card */}
        <button
          type="button"
          className="flex-none w-40 flex flex-col gap-2 cursor-pointer snap-start group"
          onClick={handleNewBoard}
        >
          <div className="h-[100px] w-full rounded-lg border border-dashed border-muted-foreground/40 relative overflow-hidden transition-all duration-200 bg-muted/50 flex flex-col items-center justify-center gap-2 group-hover:bg-primary/10 group-hover:border-primary group-hover:border-solid">
            <div className="flex items-center justify-center text-primary transition-transform group-hover:scale-110">
              <Plus size={20} strokeWidth={2} />
            </div>
            <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">
              New Board
            </span>
          </div>
          <div className="flex items-center justify-between px-0.5 w-full">
            <span className="text-[13px] font-medium text-foreground truncate group-hover:text-primary">
              Blank Canvas
            </span>
          </div>
        </button>

        {/* Divider */}
        <div className="w-px min-h-[100px] self-stretch bg-gradient-to-b from-transparent via-border to-transparent mx-2 flex-shrink-0" />

        {/* Template Cards */}
        {templates.map((template: { id: string; name: string }, index: number) => (
          <button key={template.id} className="flex-none w-40 flex flex-col gap-2 cursor-pointer snap-start group">
            <div className="h-[100px] w-full rounded-lg border border-border relative overflow-hidden transition-all duration-200 bg-card group-hover:-translate-y-0.5 group-hover:shadow-md group-hover:border-primary/50">
              {/* Pattern Background */}
              <div 
                className="absolute inset-0"
                style={{
                  backgroundImage: index % 3 === 0 
                    ? 'linear-gradient(to right, rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.04) 1px, transparent 1px)'
                    : index % 3 === 1
                    ? 'radial-gradient(hsl(var(--muted-foreground) / 0.2) 1px, transparent 1px)'
                    : 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.02) 10px, rgba(0,0,0,0.02) 11px)',
                  backgroundSize: index % 3 === 1 ? '10px 10px' : '14px 14px'
                }}
              />
              {/* Fake UI Elements */}
              <div className="absolute top-0 left-0 right-0 h-3 border-b border-black/5 bg-white/40" />
              <div className="absolute top-3 left-0 bottom-0 w-5 border-r border-black/5 bg-black/[0.02]" />
              <div className="absolute top-5 left-7 flex gap-1">
                <div className="w-[30px] h-5 bg-black/5 rounded-sm" />
                <div className="w-[15px] h-5 bg-black/5 rounded-sm" />
              </div>
              {/* Overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 bg-white/60 transition-opacity group-hover:opacity-100 text-primary">
                <LayoutTemplate size={20} />
              </div>
            </div>
            <div className="flex items-center justify-between px-0.5 w-full">
              <span className="text-[13px] font-medium text-foreground truncate group-hover:text-primary">
                {template.name}
              </span>
              <span className="text-[10px] text-muted-foreground bg-muted px-1 py-0.5 rounded">
                Team
              </span>
            </div>
          </button>
        ))}

        {/* More Card */}
        <button className="flex-none w-20 flex flex-col gap-2 cursor-pointer snap-start group">
          <div className="h-[100px] w-full rounded-lg border border-transparent relative overflow-hidden transition-all text-muted-foreground flex flex-col items-center justify-center gap-1.5 group-hover:bg-muted group-hover:text-foreground group-hover:border-border">
            <Grid3X3 size={24} strokeWidth={1.5} />
            <span className="text-[11px] font-medium">More</span>
          </div>
        </button>
      </div>
    </section>
  );
};
