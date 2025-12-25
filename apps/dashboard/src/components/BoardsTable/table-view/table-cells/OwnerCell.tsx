interface OwnerCellProps {
  owner: string;
}

export const OwnerCell = ({ owner }: OwnerCellProps) => {
  return (
    <td className="p-4 max-lg:hidden text-muted-foreground text-[13px] truncate max-w-[300px]">
      {owner}
    </td>
  );
};
