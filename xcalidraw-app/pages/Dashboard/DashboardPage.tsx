import { useNavigate } from "react-router-dom";
import { nanoid } from "nanoid";

import "./DashboardPage.scss";

export const DashboardPage = () => {
  const navigate = useNavigate();

  const handleCreateNewBoard = () => {
    const boardId = nanoid();
    navigate(`/board/${boardId}`);
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h1>Xcalidraw</h1>
      </header>

      <main className="dashboard-content">
        <section className="dashboard-welcome">
          <h2>Welcome to Xcalidraw</h2>
          <p>Create and collaborate on whiteboards in real-time</p>

          <button
            className="create-board-btn"
            onClick={handleCreateNewBoard}
            type="button"
          >
            Create New Board
          </button>
        </section>

        <section className="dashboard-boards">
          <h3>Recent Boards</h3>
          <p className="empty-state">
            No recent boards yet. Create one to get started!
          </p>
          {/* TODO: List recent boards from localStorage/backend */}
        </section>
      </main>
    </div>
  );
};
