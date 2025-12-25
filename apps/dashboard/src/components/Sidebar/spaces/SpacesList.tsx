import { useAtom } from "jotai";
import { yourSpacesAtom, spacesAtom, workspacesQueryAtom } from "../../../store";
import { activeSpaceIdAtom } from "../sidebar.store";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../ui/accordion";
import { SidebarSpacesSkeleton } from "../SidebarSpacesSkeleton";
import { SpaceItem } from "./SpaceItem";

export const SpacesList = () => {
  const [yourSpaces] = useAtom(yourSpacesAtom);
  const [spaces] = useAtom(spacesAtom);
  const [activeSpaceId] = useAtom(activeSpaceIdAtom);
  const workspacesQueryResult = useAtom(workspacesQueryAtom)[0] as any;
  const isLoading = workspacesQueryResult.isLoading;

  return (
    <div className="flex-1 overflow-y-auto min-h-0 -mr-2.5 pr-2.5 scrollbar-hover">
      <Accordion
        type="multiple"
        defaultValue={["your-spaces", "team-spaces"]}
        className="w-full"
      >
        <AccordionItem value="your-spaces" className="border-none">
          <AccordionTrigger className="py-2 px-2 text-[11px] font-medium uppercase tracking-wider hover:text-foreground cursor-pointer hover:underline hover:text-primary">
            Your Spaces
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className="flex flex-col gap-0.5">
              {isLoading ? (
                <SidebarSpacesSkeleton />
              ) : (
                yourSpaces.map((space) => (
                  <SpaceItem
                    key={space.id}
                    space={space}
                    isActive={activeSpaceId === space.id}
                  />
                ))
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="team-spaces" className="border-none">
          <AccordionTrigger className="py-2 px-2 text-[11px] font-medium uppercase tracking-wider hover:text-foreground cursor-pointer hover:underline hover:text-primary">
            Team Spaces
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className="flex flex-col gap-0.5">
              {isLoading ? (
                <SidebarSpacesSkeleton />
              ) : (
                spaces.map((space) => (
                  <SpaceItem
                    key={space.id}
                    space={space}
                    isActive={activeSpaceId === space.id}
                  />
                ))
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
