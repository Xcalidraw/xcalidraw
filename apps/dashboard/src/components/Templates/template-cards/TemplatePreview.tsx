interface TemplatePreviewProps {
  index: number;
  bgColor: string;
  accentColor: string;
}

export const TemplatePreview = ({
  index,
  bgColor,
  accentColor,
}: TemplatePreviewProps) => {
  const patternIndex = index % 8;

  return (
    <div
      className={`h-[80px] w-full rounded-xl relative overflow-hidden ${bgColor}`}
    >
      <div className="absolute inset-0 p-2">
        {/* Flowchart pattern */}
        {patternIndex === 0 && (
          <>
            <div
              className={`absolute top-4 left-3 w-8 h-6 ${accentColor} rounded-sm opacity-80`}
            />
            <div className="absolute top-4 right-3 w-6 h-6 bg-yellow-300 rounded-sm opacity-80" />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-10 h-5 bg-emerald-300 rounded-sm opacity-80" />
            <div className="absolute top-7 left-8 w-px h-6 bg-gray-400" />
          </>
        )}

        {/* Blueprint pattern */}
        {patternIndex === 1 && (
          <>
            <div className="absolute top-3 left-4 px-2 py-1 bg-indigo-500 text-white text-[8px] font-medium rounded">
              Blueprint
            </div>
            <div className="absolute top-10 left-3 w-12 h-3 bg-gray-200 rounded-sm" />
            <div className="absolute top-14 left-3 w-8 h-3 bg-gray-200 rounded-sm" />
            <div className="absolute top-10 right-3 w-4 h-8 bg-pink-300 rounded-sm" />
          </>
        )}

        {/* Shapes pattern */}
        {patternIndex === 2 && (
          <>
            <div className="absolute top-3 left-3 w-5 h-5 bg-orange-400 rounded-full opacity-80" />
            <div className="absolute top-8 right-4 w-5 h-5 bg-cyan-400 rounded-sm rotate-45 opacity-80" />
            <div className="absolute bottom-3 left-6 w-6 h-4 bg-violet-400 rounded-sm opacity-80" />
            <div className="absolute bottom-5 right-3 w-4 h-4 bg-yellow-400 rounded-full opacity-80" />
          </>
        )}

        {/* Kanban pattern */}
        {patternIndex === 3 && (
          <>
            <div className="absolute top-3 left-2 w-[30%] h-[60%] bg-blue-100 rounded-sm border border-blue-200" />
            <div className="absolute top-3 left-[36%] w-[30%] h-[60%] bg-amber-100 rounded-sm border border-amber-200" />
            <div className="absolute top-3 right-2 w-[30%] h-[60%] bg-emerald-100 rounded-sm border border-emerald-200" />
            <div className="absolute top-5 left-3 w-4 h-2 bg-blue-400 rounded-sm" />
            <div className="absolute top-8 left-3 w-5 h-2 bg-blue-300 rounded-sm" />
            <div className="absolute top-5 left-[38%] w-5 h-2 bg-amber-400 rounded-sm" />
          </>
        )}

        {/* Timeline pattern */}
        {patternIndex === 4 && (
          <>
            <div className="absolute top-1/2 left-3 right-3 h-0.5 bg-gray-300" />
            <div className="absolute top-1/2 left-4 -translate-y-1/2 w-3 h-3 bg-rose-400 rounded-full" />
            <div className="absolute top-1/2 left-10 -translate-y-1/2 w-3 h-3 bg-violet-400 rounded-full" />
            <div className="absolute top-1/2 right-10 -translate-y-1/2 w-3 h-3 bg-cyan-400 rounded-full" />
            <div className="absolute top-1/2 right-4 -translate-y-1/2 w-3 h-3 bg-emerald-400 rounded-full" />
            <div className="absolute top-3 left-3 w-6 h-2 bg-rose-200 rounded-sm" />
            <div className="absolute bottom-3 left-9 w-8 h-2 bg-violet-200 rounded-sm" />
          </>
        )}

        {/* Mind map pattern */}
        {patternIndex === 5 && (
          <>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-5 bg-primary/60 rounded-full" />
            <div className="absolute top-2 left-2 w-5 h-3 bg-amber-300 rounded-full" />
            <div className="absolute top-2 right-2 w-6 h-3 bg-rose-300 rounded-full" />
            <div className="absolute bottom-2 left-3 w-5 h-3 bg-cyan-300 rounded-full" />
            <div className="absolute bottom-2 right-3 w-4 h-3 bg-violet-300 rounded-full" />
            <div className="absolute top-4 left-6 w-4 h-px bg-gray-400" />
            <div className="absolute top-5 right-7 w-4 h-px bg-gray-400" />
          </>
        )}

        {/* Grid/table pattern */}
        {patternIndex === 6 && (
          <>
            <div className="absolute top-3 left-3 right-3 h-4 bg-indigo-100 rounded-t-sm border border-indigo-200" />
            <div className="absolute top-7 left-3 right-3 h-3 bg-gray-50 border-x border-gray-200" />
            <div className="absolute top-10 left-3 right-3 h-3 bg-gray-50 border-x border-gray-200" />
            <div className="absolute top-13 left-3 right-3 h-3 bg-gray-50 rounded-b-sm border border-gray-200" />
            <div className="absolute top-4 left-4 w-3 h-2 bg-indigo-400 rounded-sm" />
          </>
        )}

        {/* Flowchart pattern */}
        {patternIndex === 7 && (
          <>
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
  );
};
