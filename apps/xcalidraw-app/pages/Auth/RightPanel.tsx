export default function AuthImagePanel() {
  return (
    <div className="auth-right-panel">
      <div className="shapes-container">
        {Array.from({ length: 15 }).map((_, i) => (
          <div key={i} className={`shape shape-${i + 1}`} />
        ))}
      </div>

      <div className="panel-content">
        <h2>Unleash Your Creativity</h2>
        <p>
          Xcalidraw is the ultimate whiteboard tool for teams. Sketch, brainstorm, and collaborate in real-time with infinite possibilities.
        </p>

        <div className="features-grid">
          <div className="feature-item">
            <h3>Real-time</h3>
            <p>Collaborate with your team instantly, no matter where they are.</p>
          </div>
          <div className="feature-item">
            <h3>Infinite Canvas</h3>
            <p>Never run out of space. Let your ideas grow without boundaries.</p>
          </div>
          <div className="feature-item">
            <h3>Hand-drawn Style</h3>
            <p>Create diagrams that feel personal and approachable.</p>
          </div>
          <div className="feature-item">
            <h3>Secure</h3>
            <p>Your data is encrypted and safe with enterprise-grade security.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
