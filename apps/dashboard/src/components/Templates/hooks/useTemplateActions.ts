import { useNavigate } from "react-router-dom";

export const useTemplateActions = () => {
  const navigate = useNavigate();

  const handleNewBoard = () => {
    const boardId = `board-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    navigate(`/board/${boardId}`);
  };

  const handleOpenTemplate = (templateId: string) => {
    // TODO: Open template in a new board
    const boardId = `board-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    navigate(`/board/${boardId}?template=${templateId}`);
  };

  const handleOpenMiroverse = () => {
    // TODO: Navigate to Miroverse
    window.open("https://miro.com/miroverse/", "_blank");
  };

  return {
    handleNewBoard,
    handleOpenTemplate,
    handleOpenMiroverse,
  };
};
