interface SpaceCellProps {
  space?: string;
}

export const SpaceCell = ({ space }: SpaceCellProps) => {
  return (
    <td className="p-4 max-lg:hidden truncate max-w-[300px]">
      {space ? (
        <span className="inline-block px-2.5 py-1 bg-muted rounded-xl text-xs text-muted-foreground font-medium">
          {space}
        </span>
      ) : null}
    </td>
  );
};
