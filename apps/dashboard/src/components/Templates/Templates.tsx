import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useAtom } from "jotai";
import { templatesAtom } from "../../store";
import { Card } from "../ui/card";
import { Separator } from "../ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const roleOptions = [
  "All roles",
  "Engineering",
  "Product management",
  "Project management",
  "Design",
  "Agile Coach",
];

export const Templates = () => {
  const [templates] = useAtom(templatesAtom);
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState("All roles");

  const handleNewBoard = () => {
    const boardId = `board-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    navigate(`/board/${boardId}`);
  };

  // Template preview colors for variety
  const templateColors = [
    { bg: 'bg-blue-50', accent: 'bg-blue-400' },
    { bg: 'bg-violet-50', accent: 'bg-violet-400' },
    { bg: 'bg-amber-50', accent: 'bg-amber-400' },
    { bg: 'bg-emerald-50', accent: 'bg-emerald-400' },
    { bg: 'bg-rose-50', accent: 'bg-rose-400' },
    { bg: 'bg-cyan-50', accent: 'bg-cyan-400' },
  ];

  return (
    <section className="flex flex-col gap-4 w-full max-w-full py-6 border-b border-border bg-muted/50 max-md:pt-4 max-md:pb-3 max-md:gap-3">
      {/* Header */}
      <div className="flex items-center justify-between px-8 max-md:px-4">
        <Select value={selectedRole} onValueChange={setSelectedRole}>
          <SelectTrigger className="w-auto h-9 px-3 bg-secondary hover:bg-secondary/80 border-none shadow-none rounded-lg text-foreground focus:ring-0 focus:ring-offset-0">
            <SelectValue>
              <span className="text-sm font-medium">Templates for {selectedRole}</span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="w-56 p-2 rounded-2xl border-border">
            {roleOptions.map((role) => (
              <SelectItem key={role} value={role} className="px-3 py-2.5 rounded-lg cursor-pointer">
                {role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Templates Track */}
      <div className="overflow-x-auto overflow-y-hidden py-1 pb-4 overscroll-contain touch-pan-x" style={{ scrollPaddingLeft: '32px' }}>
        <div className="flex gap-3 px-8 max-md:px-4 max-md:gap-2">
        
          {/* Blank Board Card */}
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

        {/* Vertical Divider */}
        <Separator orientation="vertical" className="self-stretch h-auto! bg-gray-200 mx-2" />

        {/* Template Cards */}
        {templates.map((template: { id: string; name: string }, index: number) => {
          const colors = templateColors[index % templateColors.length];
          return (
            <Card 
              key={template.id} 
              className="shrink-0 w-[160px] min-w-[160px] cursor-pointer snap-start group hover:border-primary/50 transition-all py-0! gap-0! bg-card"
            >
              {/* Template Preview */}
              <div className={`h-[80px] w-full rounded-xl relative overflow-hidden ${colors.bg}`}>
                {/* Fake diagram elements */}
                <div className="absolute inset-0 p-2">
                  {index % 8 === 0 && (
                    <>
                      <div className={`absolute top-4 left-3 w-8 h-6 ${colors.accent} rounded-sm opacity-80`} />
                      <div className="absolute top-4 right-3 w-6 h-6 bg-yellow-300 rounded-sm opacity-80" />
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-10 h-5 bg-emerald-300 rounded-sm opacity-80" />
                      <div className="absolute top-7 left-8 w-px h-6 bg-gray-400" />
                    </>
                  )}
                  {index % 8 === 1 && (
                    <>
                      <div className="absolute top-3 left-4 px-2 py-1 bg-indigo-500 text-white text-[8px] font-medium rounded">Blueprint</div>
                      <div className="absolute top-10 left-3 w-12 h-3 bg-gray-200 rounded-sm" />
                      <div className="absolute top-14 left-3 w-8 h-3 bg-gray-200 rounded-sm" />
                      <div className="absolute top-10 right-3 w-4 h-8 bg-pink-300 rounded-sm" />
                    </>
                  )}
                  {index % 8 === 2 && (
                    <>
                      <div className="absolute top-3 left-3 w-5 h-5 bg-orange-400 rounded-full opacity-80" />
                      <div className="absolute top-8 right-4 w-5 h-5 bg-cyan-400 rounded-sm rotate-45 opacity-80" />
                      <div className="absolute bottom-3 left-6 w-6 h-4 bg-violet-400 rounded-sm opacity-80" />
                      <div className="absolute bottom-5 right-3 w-4 h-4 bg-yellow-400 rounded-full opacity-80" />
                    </>
                  )}
                  {index % 8 === 3 && (
                    <>
                      {/* Kanban board style */}
                      <div className="absolute top-3 left-2 w-[30%] h-[60%] bg-blue-100 rounded-sm border border-blue-200" />
                      <div className="absolute top-3 left-[36%] w-[30%] h-[60%] bg-amber-100 rounded-sm border border-amber-200" />
                      <div className="absolute top-3 right-2 w-[30%] h-[60%] bg-emerald-100 rounded-sm border border-emerald-200" />
                      <div className="absolute top-5 left-3 w-4 h-2 bg-blue-400 rounded-sm" />
                      <div className="absolute top-8 left-3 w-5 h-2 bg-blue-300 rounded-sm" />
                      <div className="absolute top-5 left-[38%] w-5 h-2 bg-amber-400 rounded-sm" />
                    </>
                  )}
                  {index % 8 === 4 && (
                    <>
                      {/* Timeline/roadmap style */}
                      <div className="absolute top-1/2 left-3 right-3 h-0.5 bg-gray-300" />
                      <div className="absolute top-1/2 left-4 -translate-y-1/2 w-3 h-3 bg-rose-400 rounded-full" />
                      <div className="absolute top-1/2 left-10 -translate-y-1/2 w-3 h-3 bg-violet-400 rounded-full" />
                      <div className="absolute top-1/2 right-10 -translate-y-1/2 w-3 h-3 bg-cyan-400 rounded-full" />
                      <div className="absolute top-1/2 right-4 -translate-y-1/2 w-3 h-3 bg-emerald-400 rounded-full" />
                      <div className="absolute top-3 left-3 w-6 h-2 bg-rose-200 rounded-sm" />
                      <div className="absolute bottom-3 left-9 w-8 h-2 bg-violet-200 rounded-sm" />
                    </>
                  )}
                  {index % 8 === 5 && (
                    <>
                      {/* Mind map style */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-5 bg-primary/60 rounded-full" />
                      <div className="absolute top-2 left-2 w-5 h-3 bg-amber-300 rounded-full" />
                      <div className="absolute top-2 right-2 w-6 h-3 bg-rose-300 rounded-full" />
                      <div className="absolute bottom-2 left-3 w-5 h-3 bg-cyan-300 rounded-full" />
                      <div className="absolute bottom-2 right-3 w-4 h-3 bg-violet-300 rounded-full" />
                      <div className="absolute top-4 left-6 w-4 h-px bg-gray-400" />
                      <div className="absolute top-5 right-7 w-4 h-px bg-gray-400" />
                    </>
                  )}
                  {index % 8 === 6 && (
                    <>
                      {/* Grid/table style */}
                      <div className="absolute top-3 left-3 right-3 h-4 bg-indigo-100 rounded-t-sm border border-indigo-200" />
                      <div className="absolute top-7 left-3 right-3 h-3 bg-gray-50 border-x border-gray-200" />
                      <div className="absolute top-10 left-3 right-3 h-3 bg-gray-50 border-x border-gray-200" />
                      <div className="absolute top-13 left-3 right-3 h-3 bg-gray-50 rounded-b-sm border border-gray-200" />
                      <div className="absolute top-4 left-4 w-3 h-2 bg-indigo-400 rounded-sm" />
                    </>
                  )}
                  {index % 8 === 7 && (
                    <>
                      {/* Flowchart style */}
                      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-5 bg-emerald-400 rounded-sm opacity-80" />
                      <div className="absolute top-8 left-1/2 -translate-x-1/2 w-px h-3 bg-gray-400" />
                      <div className="absolute top-11 left-1/4 w-6 h-4 bg-amber-400 rounded-sm opacity-80" />
                      <div className="absolute top-11 right-1/4 w-6 h-4 bg-rose-400 rounded-sm opacity-80" />
                      <div className="absolute top-11 left-1/2 -translate-x-1/2 w-8 h-px bg-gray-400" />
                      <div className="absolute top-[42px] left-[28%] w-px h-3 bg-gray-400" />
                      <div className="absolute top-[42px] right-[28%] w-px h-3 bg-gray-400" />
                    </>
                  )}
                </div>
              </div>
              {/* Label */}
              <div className="px-2.5 py-2 flex items-center gap-1">
                <Sparkles size={10} className="text-amber-500 shrink-0" />
                <span className="text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors">
                  {template.name}
                </span>
              </div>
            </Card>
          );
        })}

          {/* From Miroverse Card */}
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

          {/* Spacer for end padding */}
          <div className="shrink-0 w-4 max-md:w-0" aria-hidden="true" />
        </div>
      </div>
    </section>
    
  );
};
