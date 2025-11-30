// eslint-disable-next-line no-restricted-imports
import { useAtom } from "jotai";
import { Plus } from "lucide-react";

import { templatesAtom } from "../../store";

import "./Templates.scss";

export const Templates = () => {
  const [templates] = useAtom(templatesAtom);

  return (
    <div className="dashboard-templates">
      <div className="templates-scroll-container">
        <div className="template-card new-board">
          <div className="card-preview">
            <Plus size={32} />
          </div>
          <div className="card-info">
            <span className="template-name">New board</span>
          </div>
        </div>

        {templates.map((template) => (
          <div key={template.id} className="template-card">
            <div className={`card-preview ${template.image || "default"}`}>
              {/* Placeholder for template preview image */}
              <span className="preview-tag">Blueprint</span>
            </div>
            <div className="card-info">
              <span className="template-name">{template.name}</span>
            </div>
          </div>
        ))}

        <div className="template-card more-templates">
          <div className="card-preview">
            <span>More...</span>
          </div>
        </div>
      </div>
    </div>
  );
};
