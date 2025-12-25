import { useAtom } from "jotai";
import { templatesAtom } from "../../store";
import { Separator } from "../ui/separator";
import { BlankBoardCard, TemplateCard, MiroverseCard } from "./template-cards";

export const TemplatesTrack = () => {
  const [templates] = useAtom(templatesAtom);

  return (
    <div
      className="overflow-x-auto py-1 pb-4 overscroll-contain touch-pan-x scrollbar-hover"
      style={{ scrollPaddingLeft: "32px" }}
    >
      <div className="flex gap-3 px-8 max-md:px-4 max-md:gap-2">
        {/* Blank Board Card */}
        <BlankBoardCard />

        {/* Vertical Divider */}
        <Separator
          orientation="vertical"
          className="self-stretch h-auto! bg-gray-200 mx-2"
        />

        {/* Template Cards */}
        {templates.map(
          (template: { id: string; name: string }, index: number) => (
            <TemplateCard key={template.id} template={template} index={index} />
          )
        )}

        {/* From Miroverse Card */}
        <MiroverseCard />

        {/* Spacer for end padding */}
        <div className="shrink-0 w-4 max-md:w-0" aria-hidden="true" />
      </div>
    </div>
  );
};
