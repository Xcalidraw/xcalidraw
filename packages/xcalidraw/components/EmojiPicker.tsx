import { useState } from "react";
import { Sidebar } from "./Sidebar/Sidebar";
import clsx from "clsx";
import "./EmojiPicker.scss";

export const EmojiPicker = () => {
  const [activeTab, setActiveTab] = useState("stickers");

  return (
    <Sidebar name="emoji" className="emoji-picker-sidebar">
      <Sidebar.Header className="emoji-picker-header">
        <div className="emoji-picker-search-container">
            {/* Search Icon Placeholder */}
            <svg aria-hidden="true" focusable="false" role="img" viewBox="0 0 24 24" className="emoji-search-icon" fill="none" strokeWidth="2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><circle cx="10" cy="10" r="7"></circle><line x1="21" y1="21" x2="15" y2="15"></line></svg>
            <input
                type="search"
                className="emoji-picker-search"
                placeholder="Search"
            />
        </div>
      </Sidebar.Header>
      <div className="emoji-picker-content">
        <div className="emoji-picker-tabs">
            {["All", "Stickers", "Emojis", "GIFs"].map((tab) => (
                <button
                    key={tab}
                    className={clsx("emoji-picker-tab", { active: (tab === "All" && activeTab === "all") || tab.toLowerCase() === activeTab })}
                    onClick={() => setActiveTab(tab.toLowerCase())}
                >
                    {tab}
                </button>
            ))}
        </div>
        
        <div className="emoji-picker-grid">
            <div className="emoji-section-title">Recent <span className="emoji-clear-btn">Clear</span></div>
            <div className="emoji-grid-row">
                {/* Placeholders for Recent */}
                <div className="emoji-item placeholder">🔥</div>
                <div className="emoji-item placeholder">🍪</div>
                <div className="emoji-item placeholder">🧘</div>
                <div className="emoji-item placeholder">💻</div>
            </div>

            <div className="emoji-section-title">Interactive Stickers</div>
             <div className="emoji-grid-row">
                {/* Placeholders for Interactive */}
                <div className="emoji-item placeholder">🙂</div>
                <div className="emoji-item placeholder">👾</div>
                <div className="emoji-item placeholder">👻</div>
                <div className="emoji-item placeholder">🔥</div>
            </div>
             <div className="emoji-grid-row">
                <div className="emoji-item placeholder">💖</div>
                <div className="emoji-item placeholder">👍</div>
            </div>
        </div>
      </div>
    </Sidebar>
  );
};
