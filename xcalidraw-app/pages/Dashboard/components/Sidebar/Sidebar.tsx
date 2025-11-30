// eslint-disable-next-line no-restricted-imports
import { useAtom } from "jotai";
import {
  Home,
  Clock,
  Star,
  Search,
  Plus,
  ChevronRight,
  Settings,
  MoreHorizontal,
  Command,
  Hash, // Used for spaces
} from "lucide-react";
import clsx from "clsx";

import {
  currentTeamAtom,
  yourSpacesAtom,
  spacesAtom,
  yourSpacesExpandedAtom,
  spacesExpandedAtom,
} from "../../store";

import "./Sidebar.scss";

export const Sidebar = () => {
  const [currentTeam] = useAtom(currentTeamAtom);
  const [yourSpaces] = useAtom(yourSpacesAtom);
  const [spaces] = useAtom(spacesAtom);
  const [yourSpacesExpanded, setYourSpacesExpanded] = useAtom(
    yourSpacesExpandedAtom,
  );
  const [spacesExpanded, setSpacesExpanded] = useAtom(spacesExpandedAtom);

  const NavItem = ({
    icon: Icon,
    label,
    active = false,
    badge,
  }: {
    icon: any;
    label: string;
    active?: boolean;
    badge?: string;
  }) => (
    <button type="button" className={clsx("sidebar-nav-item", { active })}>
      <div className="nav-content">
        <Icon className="nav-icon" size={18} strokeWidth={1.5} />
        <span className="nav-label">{label}</span>
      </div>
      {badge && <span className="nav-badge">{badge}</span>}
    </button>
  );

  const SpaceGroup = ({
    title,
    expanded,
    onToggle,
    children,
    onAdd,
  }: {
    title: string;
    expanded: boolean;
    onToggle: () => void;
    children: React.ReactNode;
    onAdd?: () => void;
  }) => (
    <div className="sidebar-group">
      <div className="group-header">
        <button className="header-toggle" onClick={onToggle}>
          <ChevronRight
            size={12}
            strokeWidth={3}
            className={clsx("arrow", { expanded })}
          />
          <span>{title}</span>
        </button>
        {onAdd && (
          <button className="header-action" onClick={onAdd}>
            <Plus size={14} strokeWidth={2} />
          </button>
        )}
      </div>
      {expanded && <div className="group-items">{children}</div>}
    </div>
  );

  return (
    <aside className="dashboard-sidebar">
      {/* 1. Workspace Header */}
      <header className="sidebar-header">
        <button className="workspace-btn">
          <span className="workspace-avatar">{currentTeam.initials}</span>
          <div className="workspace-details">
            <span className="name">{currentTeam.name}</span>
            <span className="role">Free Plan</span>
          </div>
          <MoreHorizontal size={16} className="workspace-options" />
        </button>
      </header>

      {/* 2. Search (Visual Fake Input) */}
      <div className="sidebar-search-container">
        <button className="search-btn">
          <Search size={16} strokeWidth={2} className="search-icon" />
          <span className="placeholder">Search...</span>
          <div className="shortcut">
            <Command size={10} />K
          </div>
        </button>
      </div>

      <div className="sidebar-scrollable">
        {/* 3. Main Navigation */}
        <nav className="nav-section">
          <NavItem icon={Home} label="Home" active />
          <NavItem icon={Clock} label="Recent" />
          <NavItem icon={Star} label="Starred" badge="3" />
        </nav>

        {/* 4. Spaces */}
        <div className="spaces-section">
          <div className="spaces-section-header">
            <span className="spaces-section-title">Spaces</span>
            <button className="spaces-add-btn" onClick={() => {}}>
              <Plus size={16} strokeWidth={2} />
            </button>
          </div>
          <SpaceGroup
            title="Your Spaces"
            expanded={yourSpacesExpanded}
            onToggle={() => setYourSpacesExpanded(!yourSpacesExpanded)}
          >
            {yourSpaces.map((space) => (
              <button key={space.id} className="space-item">
                <span className="space-indicator dot" />
                <span className="space-name">{space.name}</span>
              </button>
            ))}
          </SpaceGroup>

          <SpaceGroup
            title="Team Spaces"
            expanded={spacesExpanded}
            onToggle={() => setSpacesExpanded(!spacesExpanded)}
          >
            {spaces.map((space) => (
              <button key={space.id} className="space-item">
                <Hash size={14} className="space-indicator hash" />
                <span className="space-name">{space.name}</span>
              </button>
            ))}
          </SpaceGroup>
        </div>
      </div>

      {/* 5. Footer */}
      <footer className="sidebar-footer">
        <NavItem icon={Settings} label="Settings" />
      </footer>
    </aside>
  );
};
