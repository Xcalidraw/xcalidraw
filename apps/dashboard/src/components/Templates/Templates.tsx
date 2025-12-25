import { RoleFilter } from "./RoleFilter";
import { TemplatesTrack } from "./TemplatesTrack";

export const Templates = () => {
  return (
    <section className="flex flex-col gap-4 w-full max-w-full py-6 border-b border-border bg-muted/50 max-md:pt-4 max-md:pb-3 max-md:gap-3">
      {/* Header */}
      <RoleFilter />

      {/* Templates Track */}
      <TemplatesTrack />
    </section>
  );
};
