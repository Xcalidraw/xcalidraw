import { AlertCircle, Zap } from 'lucide-react';
import './TeamLimitBanner.scss';

interface TeamLimitBannerProps {
  onUpgradeClick: () => void;
  isAtLimit: boolean;
}

export const TeamLimitBanner = ({ onUpgradeClick, isAtLimit }: TeamLimitBannerProps) => {
  if (!isAtLimit) return null;

  return (
    <div className="team-limit-banner">
      <div className="team-limit-banner-content">
        <div className="team-limit-banner-icon">
          <AlertCircle size={20} />
        </div>
        <div className="team-limit-banner-text">
          <h4 className="team-limit-banner-title">Team limit reached</h4>
          <p className="team-limit-banner-description">
            You've reached the maximum of 1 team for solo accounts. Upgrade to create unlimited teams.
          </p>
        </div>
      </div>
      <button
        className="team-limit-banner-button"
        onClick={onUpgradeClick}
      >
        <Zap size={16} />
        <span>Upgrade Now</span>
      </button>
    </div>
  );
};
