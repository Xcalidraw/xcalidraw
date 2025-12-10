import * as Dialog from '@radix-ui/react-dialog';
import { useUpgradeOrgMutation } from '../../hooks/api.hooks';
import { Zap, Check } from 'lucide-react';
import './UpgradeModal.scss';

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgId: string;
  currentTeamCount: number;
}

export const UpgradeModal = ({
  open,
  onOpenChange,
  orgId,
  currentTeamCount,
}: UpgradeModalProps) => {
  const upgradeOrg = useUpgradeOrgMutation();

  const handleUpgrade = async () => {
    try {
      await upgradeOrg.mutateAsync({ orgId });
      onOpenChange(false);
      // Show success message - could integrate with a toast system
    } catch (error: any) {
      console.error('Upgrade failed:', error);
      // Error handling - could show error toast
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="upgrade-modal-overlay" />
        <Dialog.Content className="upgrade-modal-content">
          <div className="upgrade-modal-icon">
            <Zap size={32} />
          </div>
          
          <Dialog.Title className="upgrade-modal-title">
            Upgrade to Organization Plan
          </Dialog.Title>
          
          <Dialog.Description className="upgrade-modal-description">
            You've reached the team limit for solo accounts. Upgrade to unlock unlimited teams and collaborative features.
          </Dialog.Description>

          <div className="upgrade-modal-features">
            <h4 className="upgrade-modal-features-title">What you'll get:</h4>
            <ul className="upgrade-modal-features-list">
              <li>
                <Check size={16} className="upgrade-modal-check-icon" />
                <span>Unlimited teams and workspaces</span>
              </li>
              <li>
                <Check size={16} className="upgrade-modal-check-icon" />
                <span>Invite team members to collaborate</span>
              </li>
              <li>
                <Check size={16} className="upgrade-modal-check-icon" />
                <span>Advanced permission controls</span>
              </li>
              <li>
                <Check size={16} className="upgrade-modal-check-icon" />
                <span>Priority support</span>
              </li>
            </ul>
          </div>

          <div className="upgrade-modal-pricing">
            <div className="upgrade-modal-price">
              <span className="upgrade-modal-price-amount">$12</span>
              <span className="upgrade-modal-price-period">/user/month</span>
            </div>
            <div className="upgrade-modal-price-note">
              Based on {currentTeamCount} team{currentTeamCount !== 1 ? 's' : ''}
            </div>
          </div>

          <div className="upgrade-modal-actions">
            <button
              type="button"
              className="upgrade-modal-button-secondary"
              onClick={() => onOpenChange(false)}
              disabled={upgradeOrg.isPending}
            >
              Maybe Later
            </button>
            <button
              type="button"
              className="upgrade-modal-button-primary"
              onClick={handleUpgrade}
              disabled={upgradeOrg.isPending}
            >
              {upgradeOrg.isPending ? 'Processing...' : 'Upgrade Now'}
            </button>
          </div>

          <p className="upgrade-modal-footer-note">
            Your existing teams, boards, and data will remain unchanged.
          </p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
