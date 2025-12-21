import { trackEvent } from "@xcalidraw/xcalidraw/analytics";
import { copyTextToSystemClipboard } from "@xcalidraw/xcalidraw/clipboard";
import { Dialog } from "@xcalidraw/xcalidraw/components/Dialog";
import { FilledButton } from "@xcalidraw/xcalidraw/components/FilledButton";
import { TextField } from "@xcalidraw/xcalidraw/components/TextField";
import {
  copyIcon,
  share,
  shareIOS,
  shareWindows,
} from "@xcalidraw/xcalidraw/components/icons";
import { useUIAppState } from "@xcalidraw/xcalidraw/context/ui-appState";
import { useCopyStatus } from "@xcalidraw/xcalidraw/hooks/useCopiedIndicator";
import { useI18n } from "@xcalidraw/xcalidraw/i18n";
import { useEffect, useState } from "react";

import { atom, useAtom } from "../app-jotai";
import { useShareBoardMutation, useBoardMembersQuery } from "../hooks/api.hooks";

import "./ShareDialog.scss";

import type { CollabAPI } from "../collab/Collab";

type OnExportToBackend = () => void;
type ShareDialogType = "share" | "collaborationOnly";

export const shareDialogStateAtom = atom<
  { isOpen: false } | { isOpen: true; type: ShareDialogType }
>({ isOpen: false });

export type ShareDialogProps = {
  collabAPI: CollabAPI | null;
  handleClose: () => void;
  onExportToBackend: OnExportToBackend;
  type: ShareDialogType;
  boardId?: string;
};

const MemberList = ({ boardId }: { boardId: string }) => {
    const { data: members, isLoading } = useBoardMembersQuery(boardId);

    if (isLoading) return <div>Loading members...</div>;

    return (
        <div className="ShareDialog__members">
            <h3>Board Access</h3>
            <div className="ShareDialog__members__list">
                {members?.map((m: any) => (
                    <div key={m.user_id} className="ShareDialog__memberItem">
                        <div className="ShareDialog__memberItem__avatar">
                            {/* Avatar placeholder or image */}
                            {m.user?.displayName?.[0] || "?"}
                        </div>
                        <div className="ShareDialog__memberItem__info">
                            <span className="name">{m.user?.displayName || "Unknown"}</span>
                            <span className="email">{m.user?.email}</span>
                        </div>
                        <div className="ShareDialog__memberItem__role">
                            {m.role}
                        </div>
                    </div>
                ))}
            </div>
            <style>{`
                .ShareDialog__members { margin-top: 1.5rem; }
                .ShareDialog__members h3 { font-size: 0.9rem; font-weight: bold; margin-bottom: 0.5rem; }
                .ShareDialog__members__list { display: flex; flex-direction: column; gap: 0.5rem; max-height: 200px; overflow-y: auto; }
                .ShareDialog__memberItem { display: flex; align-items: center; gap: 0.8rem; padding: 0.5rem; border-radius: 6px; background: var(--color-gray-10); }
                .ShareDialog__memberItem__avatar { width: 32px; height: 32px; background: var(--color-primary); color: white; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-weight: bold; }
                .ShareDialog__memberItem__info { flex: 1; display: flex; flex-direction: column; }
                .ShareDialog__memberItem__info .name { font-weight: 500; font-size: 0.9rem; }
                .ShareDialog__memberItem__info .email { font-size: 0.75rem; color: var(--text-color-secondary); }
                .ShareDialog__memberItem__role { font-size: 0.8rem; color: var(--text-color-secondary); text-transform: capitalize; }
            `}</style>
        </div>
    );
}

const InviteTab = ({ boardId }: { boardId: string }) => {
    const [email, setEmail] = useState("");
    const shareMutation = useShareBoardMutation();
    const { t } = useI18n(); // Assuming t is available or we use strings

    const handleInvite = async () => {
        if (!email) return;
        try {
            await shareMutation.mutateAsync({ boardId, email });
            setEmail("");
            // Optional: Success toast
        } catch (e) {
            console.error(e);
            // Optional: Error handling
        }
    };

    return (
        <div className="ShareDialog__invite">
            <div className="ShareDialog__invite__inputRow">
                <TextField
                    value={email}
                    onChange={(val) => setEmail(val)}
                    placeholder="Enter email to invite"
                    label="Email"
                    fullWidth
                    onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
                />
                <FilledButton
                    label="Invite"
                    onClick={handleInvite}
                    disabled={shareMutation.isPending || !email}
                    className="ShareDialog__inviteButton"
                />
            </div>
            {shareMutation.error && (
                <div style={{ color: "red", fontSize: "0.8rem", marginTop: "0.5rem" }}>
                    {(shareMutation.error as any).message || "Failed to invite"}
                </div>
            )}
            
            <MemberList boardId={boardId} />
            
            <style>{`
                .ShareDialog__invite__inputRow { display: flex; gap: 0.5rem; align-items: flex-end; }
                .ShareDialog__inviteButton { height: 40px; margin-bottom: 2px; }
            `}</style>
        </div>
    );
};

const ShareDialogInner = (props: ShareDialogProps) => {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<'invite' | 'embed' | 'publish'>('invite');

  // If we don't have a boardId, we can't share specifically.
  // Fallback to old UI logic or show error? 
  // For now, if boardId is missing, maybe just show "Save to backend" option?
  // But props.boardId is passed now.

  return (
    <Dialog size="small" onCloseRequest={props.handleClose} title="Share Board">
      <div className="ShareDialog">
          {props.boardId ? (
             <>
                {/* Simple Tab Bar */}
                <div className="ShareDialog__tabs">
                    <button 
                        className={activeTab === 'invite' ? 'active' : ''} 
                        onClick={() => setActiveTab('invite')}
                    >
                        Invite
                    </button>
                    <button className="disabled" disabled title="Coming soon">Embed</button>
                    <button className="disabled" disabled title="Coming soon">Publish</button>
                </div>
                
                <div className="ShareDialog__content">
                    {activeTab === 'invite' && <InviteTab boardId={props.boardId} />}
                </div>

                <style>{`
                    .ShareDialog__tabs { display: flex; border-bottom: 1px solid var(--color-gray-20); margin-bottom: 1rem; }
                    .ShareDialog__tabs button { background: none; border: none; padding: 0.5rem 1rem; cursor: pointer; border-bottom: 2px solid transparent; font-weight: 500; color: var(--text-color-primary); }
                    .ShareDialog__tabs button.active { border-bottom-color: var(--color-primary); color: var(--color-primary); }
                    .ShareDialog__tabs button.disabled { opacity: 0.5; cursor: not-allowed; }
                `}</style>
             </>
          ) : (
             <div style={{ padding: '1rem' }}>
                 Please save the board to a workspace to share it.
                 <br />
                 <FilledButton 
                    label="Save to Backend" 
                    onClick={props.onExportToBackend}
                    style={{ marginTop: '1rem' }} 
                 />
             </div>
          )}
      </div>
    </Dialog>
  );
};

export const ShareDialog = (props: {
  collabAPI: CollabAPI | null;
  onExportToBackend: OnExportToBackend;
  boardId?: string;
}) => {
  const [shareDialogState, setShareDialogState] = useAtom(shareDialogStateAtom);
  const { openDialog } = useUIAppState();

  useEffect(() => {
    if (openDialog) {
      setShareDialogState({ isOpen: false });
    }
  }, [openDialog, setShareDialogState]);

  if (!shareDialogState.isOpen) {
    return null;
  }

  return (
    <ShareDialogInner
      handleClose={() => setShareDialogState({ isOpen: false })}
      collabAPI={props.collabAPI}
      onExportToBackend={props.onExportToBackend}
      type={shareDialogState.type}
      boardId={props.boardId}
    />
  );
};
