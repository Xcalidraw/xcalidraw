import React, { useEffect, useRef, useState } from "react";

import { KEYS } from "@xcalidraw/common";

import { useTunnels } from "../context/tunnels";

import { HomeIcon } from "./icons";

import "./HeaderBar.scss";

type HeaderBarProps = {
  boardName?: string;
  onBoardNameChange?: (name: string) => void;
  onHomeClick?: () => void;
};

export const HeaderBar = ({
  boardName = "Untitled",
  onBoardNameChange,
  onHomeClick,
}: HeaderBarProps) => {
  const { MainMenuTunnel } = useTunnels();
  const [isEditing, setIsEditing] = useState(false);
  const [localName, setLocalName] = useState(boardName);
  const [inputWidth, setInputWidth] = useState<number | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    setLocalName(boardName);
  }, [boardName]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEditing = () => {
    // Capture span width before switching to input
    if (spanRef.current) {
      setInputWidth(spanRef.current.offsetWidth);
    }
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    setInputWidth(undefined);
    const trimmedName = localName.trim();
    if (trimmedName && trimmedName !== boardName && onBoardNameChange) {
      onBoardNameChange(trimmedName);
    } else {
      setLocalName(boardName);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === KEYS.ENTER) {
      e.preventDefault();
      handleSave();
    } else if (e.key === KEYS.ESCAPE) {
      setIsEditing(false);
      setInputWidth(undefined);
      setLocalName(boardName);
    }
  };

  return (
    <div className="HeaderBar">
      <button
        className="HeaderBar__home-btn"
        onClick={onHomeClick}
        title="Home"
        type="button"
      >
        {HomeIcon}
      </button>

      <span className="HeaderBar__logo">Xcalidraw</span>

      <div className="HeaderBar__board-name-wrapper">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            className="HeaderBar__board-name-input"
            value={localName}
            onChange={(e) => setLocalName(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            style={inputWidth ? { width: inputWidth } : undefined}
          />
        ) : (
          <span
            ref={spanRef}
            className="HeaderBar__board-name"
            onClick={handleStartEditing}
            title="Click to rename"
          >
            {boardName}
          </span>
        )}
      </div>

      <div className="HeaderBar__menu">
        <MainMenuTunnel.Out />
      </div>
    </div>
  );
};
