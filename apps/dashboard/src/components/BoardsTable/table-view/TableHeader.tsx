export const TableHeader = () => {
  return (
    <thead>
      <tr className="border-b border-border">
        <th className="text-left font-semibold text-xs uppercase tracking-wider text-muted-foreground px-4 py-3 bg-transparent max-lg:px-2.5">
          Name
        </th>
        <th className="text-left font-semibold text-xs uppercase tracking-wider text-muted-foreground px-4 py-3 bg-transparent max-lg:hidden w-[200px] max-w-[300px]">
          Online users
        </th>
        <th className="text-left font-semibold text-xs uppercase tracking-wider text-muted-foreground px-4 py-3 bg-transparent max-lg:hidden w-[150px] max-w-[300px]">
          Space
        </th>
        <th className="text-left font-semibold text-xs uppercase tracking-wider text-muted-foreground px-4 py-3 bg-transparent max-lg:hidden w-[140px] max-w-[300px]">
          Last opened
        </th>
        <th className="text-left font-semibold text-xs uppercase tracking-wider text-muted-foreground px-4 py-3 bg-transparent max-lg:hidden w-[140px] max-w-[300px]">
          Owner
        </th>
        <th className="w-20 max-lg:w-[60px]"></th>
      </tr>
    </thead>
  );
};
