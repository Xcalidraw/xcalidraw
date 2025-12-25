import { useAtom } from "jotai";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { selectedRoleAtom, roleOptions } from "./templates.store";

export const RoleFilter = () => {
  const [selectedRole, setSelectedRole] = useAtom(selectedRoleAtom);

  return (
    <div className="flex items-center justify-between px-8 max-md:px-4">
      <Select value={selectedRole} onValueChange={setSelectedRole}>
        <SelectTrigger className="w-auto">
          <SelectValue>
            <span className="text-sm font-medium">
              Templates for {selectedRole}
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="w-56">
          {roleOptions.map((role) => (
            <SelectItem key={role} value={role}>
              {role}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
