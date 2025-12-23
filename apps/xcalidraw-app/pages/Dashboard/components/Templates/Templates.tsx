import { useNavigate } from "react-router-dom";
import {
  Plus,
  LayoutTemplate,
  ArrowRight,
  Grid3X3,
  Sparkles,
} from "lucide-react";
import clsx from "clsx";

import { useAtom } from "../../../../app-jotai";

import { templatesAtom } from "../../store";

import "./Templates.scss";

export const Templates = () => {
  const [templates] = useAtom(templatesAtom);
  const navigate = useNavigate();

  const handleNewBoard = () => {
    // Generate a unique ID for the new board
    const boardId = `board-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    navigate(`/board/${boardId}`);
  };

  // Helper to assign a specific visual pattern based on index/id for variety
  const getPatternClass = (index: number) => {
    const patterns = ["pattern-grid", "pattern-dots", "pattern-lines"];
    return patterns[index % patterns.length];
  };

  return (
    <section className="dashboard-templates">
      <div className="section-header">
        <div className="header-title">
          <Sparkles size={16} className="header-icon" />
          <h3>Start creating</h3>
        </div>
        <button className="view-all-btn">
          <span>View all templates</span>
          <ArrowRight size={14} />
        </button>
      </div>

      <div className="templates-track">
        {/* 1. New Board Card (Primary Action) */}
        <button
          type="button"
          className="template-card create-new"
          onClick={handleNewBoard}
        >
          <div className="card-preview">
            <div className="plus-icon-wrapper">
              <Plus size={20} strokeWidth={2} />
            </div>
            <span className="cta-text">New Board</span>
          </div>
          <div className="card-footer">
            <span className="template-name">Blank Canvas</span>
          </div>
        </button>

        <div className="divider-vertical" />

        {/* 2. Dynamic Templates */}
        {templates.map(
          (template: { id: string; name: string }, index: number) => (
            <button key={template.id} className="template-card">
              <div className={clsx("card-preview", getPatternClass(index))}>
                {/* Decorative "Fake UI" Elements to make it look like a blueprint */}
                <div className="fake-ui-nav" />
                <div className="fake-ui-sidebar" />
                <div className="fake-ui-content">
                  <div className="fake-block" />
                  <div className="fake-block short" />
                </div>

                {/* Optional: Icon overlay */}
                <div className="preview-overlay">
                  <LayoutTemplate size={20} />
                </div>
              </div>
              <div className="card-footer">
                <span className="template-name">{template.name}</span>
                <span className="template-tag">Team</span>
              </div>
            </button>
          ),
        )}

        {/* 3. "More" Action */}
        <button className="template-card ghost-card">
          <div className="card-preview">
            <Grid3X3 size={24} strokeWidth={1.5} />
            <span>More</span>
          </div>
        </button>
      </div>
    </section>
  );
};
