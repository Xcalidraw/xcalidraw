import { Outlet } from 'react-router-dom'
import AuthImagePanel from './RightPanel'
import './Auth.scss'

function Auth() {
  return (
    <div className="auth-layout xcalidraw">
      <div className="auth-content">
        <Outlet />
      </div>
      <div className="auth-panel-container">
        <AuthImagePanel />
      </div>
    </div>
  )
}

export default Auth
