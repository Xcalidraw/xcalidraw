import { useState } from "react";
import { Sidebar } from "./Sidebar/Sidebar";
import clsx from "clsx";
import { TextField } from "./TextField";
import "./EmojiPicker.scss";

export const EmojiPicker = () => {
  const [activeTab, setActiveTab] = useState("stickers");

  return (
    <Sidebar name="emoji" className="emoji-picker-sidebar">
      <div className="emoji-picker-container">
        <TextField
            placeholder="Search"
            fullWidth
            type="search"
            defaultValue=""
            icon={
                <svg aria-hidden="true" focusable="false" role="img" viewBox="0 0 24 24" className="emoji-search-icon" fill="none" strokeWidth="2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><circle cx="10" cy="10" r="7"></circle><line x1="21" y1="21" x2="15" y2="15"></line></svg>
            }
        />
        
        <div className="emoji-picker-tabs">
            {["All", "Stickers", "Emojis", "GIFs"].map((tab) => (
                <button
                    key={tab}
                    className={clsx("emoji-picker-tab", { active: (tab === "Stickers" && activeTab === "stickers") || tab.toLowerCase() === activeTab })}
                    onClick={() => setActiveTab(tab.toLowerCase())}
                >
                    {tab}
                </button>
            ))}
        </div>

        {/* Categories Row (Simulated) */}
        <div className="emoji-categories-row">
             <div className="emoji-category-icon active">🕒</div>
             <div className="emoji-category-icon">💖</div>
             <div className="emoji-category-icon">❤️</div>
             <div className="emoji-category-icon">✨</div>
             <div className="emoji-category-icon">⚠️</div>
             <div className="emoji-category-icon">👍</div>
             <div className="emoji-category-icon">🚀</div>
        </div>

        <div className="emoji-picker-scroll-content">
            <div className="emoji-section-title">Recent <span className="emoji-clear-btn">Clear</span></div>
            <div className="emoji-grid-row">
                <div className="emoji-item">🔥</div>
                <div className="emoji-item">🏃</div>
                <div className="emoji-item">🚨</div>
                <div className="emoji-item">💻</div>
            </div>

            <div className="emoji-grid-row">
                 <div className="emoji-item">🤛</div>
                 <div className="emoji-item">🤜</div>
            </div>

            <div className="emoji-section-title">Interactive Stickers</div>
             <div className="emoji-grid-row">
                <div className="emoji-item">🙂</div>
                <div className="emoji-item">👾</div>
                <div className="emoji-item">👻</div>
                <div className="emoji-item">🔥</div>
            </div>
             <div className="emoji-grid-row">
                <div className="emoji-item">💖</div>
                <div className="emoji-item">👍</div>
            </div>

            <div className="emoji-section-title">Simple</div>
            <div className="emoji-grid-row">
                <div className="emoji-item">🧡</div>
                <div className="emoji-item">😍</div>
                <div className="emoji-item">💯</div>
                <div className="emoji-item">👋</div>
            </div>
        </div>
      </div>
    </Sidebar>
  );
};
