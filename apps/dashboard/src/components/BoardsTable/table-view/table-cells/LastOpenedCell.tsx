interface LastOpenedCellProps {
  lastOpened: string;
}

export const LastOpenedCell = ({ lastOpened }: LastOpenedCellProps) => {
  return (
    <td className="p-4 max-lg:hidden text-muted-foreground text-[13px] truncate max-w-[300px]">
      {lastOpened}
    </td>
  );
};
