import type React from "react";
import { useMessage } from "../contexts/message.context";
import assets from "../assets";
import {
  Bell,
  BellOff,
  LogOut,
  ShieldBan,
  SquarePen,
  Trash,
  UserPlus,
} from "lucide-react";
import { useState } from "react";
import EditConversationPopUp from "./EditConverSationPopup";
import type { MemberType } from "../types/api/message.type";
import { handleGetConversationMembers } from "../api/message.api";
import { useNavigate } from "react-router-dom";
import ConfirmDialog from "../components/ConfirmDialog"; // import dialog
import { handleRemoveMemberFromConversation } from "../api/message.api"; // import API xóa
import { useUser } from "../contexts/user.context";
import MemberInvitePopUp from "../components/MemberInvitePopUp";
import { toast } from "sonner";
import { timeAgo } from "../utils/timeAgot";
import MutePopUp from "../components/MutePopUp";
import { handleBlock, handleUnblock } from "../api/follow.api";

interface DetailConversationProps {
  open: boolean;
  onClose: () => void;
}

const DetailConversation: React.FC<DetailConversationProps> = ({ open }) => {
  const {
    selectedConversation,
    refetchConversations,
    memberList,
    fetchMember,
    setNullForConversation,
  } = useMessage();
  const { currentUser } = useUser();
  const [isOpenEdit, setIsOpenEdit] = useState(false);
  const [isOpenConfirm, setIsOpenConfirm] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MemberType | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isOpenInvite, setIsOpenInvite] = useState(false);
  const [isOpenLeave, setIsOpenLeave] = useState(false);
  const [isOpenMutePopUp, setIsOpenMutePopUp] = useState(false);
  const [isOpenBlockDialog, setIsOpenBlockDialog] = useState(false);
  const navigate = useNavigate();

  if (!selectedConversation) return null;

  const currentMember = memberList.find(
    (member) => member.userId === currentUser?.id,
  );

  const otherMember = memberList.find((m) => m.userId !== currentUser?.id);

  const handleRemoveMember = async () => {
    if (!selectedMember) return;

    setIsRemoving(true);
    try {
      const result = await handleRemoveMemberFromConversation(
        selectedMember.id,
      );
      if (result.success) {
        refetchConversations?.();
        fetchMember();
        handleGetConversationMembers(selectedConversation.id);
        toast.success(result.message);
      } else {
        console.error("Remove failed:", result.message);
      }
    } catch (error) {
      console.error("Error removing member:", error);
    } finally {
      setIsRemoving(false);
      setSelectedMember(null);
    }
  };

  const handleLeave = async () => {
    const myMember = memberList.find(
      (member) => member.userId === currentUser?.id,
    );

    if (!myMember) {
      toast.error("Cannot find your information in this group");
      return;
    }

    setIsRemoving(true);
    try {
      const result = await handleRemoveMemberFromConversation(myMember.id);
      if (result.success) {
        handleGetConversationMembers(selectedConversation.id);
        toast.success("You have left the group");
        setIsOpenLeave(false);
        setNullForConversation();
        refetchConversations();
        navigate("/inbox");
      } else {
        console.error(result.message);
      }
    } finally {
      setIsRemoving(false);
    }
  };

  const openConfirmDialog = (member: MemberType) => {
    setSelectedMember(member);
    setIsOpenConfirm(true);
  };

  return (
    <>
      <div
        className={`h-full relative bg-zinc-900 border-l border-zinc-700 flex flex-col
            transition-all duration-300 ease-out overflow-hidden
            ${open ? "w-100 opacity-100" : "w-0 opacity-0"}`}
      >
        <div className="min-w-100 p-4 flex flex-col items-center mt-10">
          {selectedConversation.type === "GROUP" ? (
            selectedConversation.mediaUrl ? (
              <img
                src={selectedConversation.mediaUrl}
                className="w-30 h-30 rounded-full object-cover"
              />
            ) : (
              <div className="flex">
                {selectedConversation.otherUsers
                  .slice(0, 3)
                  .map((user, index) => (
                    <img
                      key={user.userId}
                      src={user.avatarUrl || assets.profile}
                      alt={selectedConversation.name || user.username}
                      className="w-20 h-20 rounded-full object-cover border-2 border-white"
                      style={{
                        marginLeft: index === 0 ? "0" : "-15px",
                        zIndex: 3 - index,
                      }}
                    />
                  ))}
              </div>
            )
          ) : (
            <img
              src={
                selectedConversation.otherUsers[0].avatarUrl || assets.profile
              }
              alt={
                selectedConversation.name ||
                selectedConversation.otherUsers[0].username
              }
              className="w-30 h-30 rounded-full object-cover"
            />
          )}
          <div className="font-bold text-2xl mt-4 flex gap-3 items-center">
            <span>
              {selectedConversation.name ||
                selectedConversation.otherUsers[0].username}
            </span>
            {selectedConversation.type === "GROUP" && (
              <button
                className="cursor-pointer"
                onClick={() => setIsOpenEdit(true)}
              >
                <SquarePen size={20} />
              </button>
            )}
          </div>
        </div>

        {selectedConversation.type === "GROUP" && (
          <div className="flex flex-col gap-3 mt-4">
            <div className="flex items-center justify-between px-4 mb-2">
              <div className="font-semibold text-gray-300">Members</div>
              <div className="text-xs text-gray-500">
                {memberList.length} members
              </div>
            </div>

            <div className="space-y-1">
              {memberList.map((member) => (
                <div
                  className="flex justify-between items-center hover:bg-gray-800/50 px-4 group"
                  key={member.userId}
                >
                  <div
                    className="flex items-center gap-3 py-2 flex-1  rounded-lg cursor-pointer transition-colors"
                    onClick={() => navigate(`/${member.username}`)}
                  >
                    <div className="relative">
                      <img
                        src={member.avatarUrl || assets.profile}
                        className="w-10 h-10 object-cover rounded-full"
                        alt={member.username}
                      />
                      {member.lastSeen === null && (
                        <span className="absolute bottom-0 -right-0.5 w-3 h-3 bg-green-500 border-2 border-gray-800 rounded-full" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div>
                        <div className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">
                          {member.username}
                        </div>
                        <div className="text-xs text-gray-400">
                          {member.lastSeen === null
                            ? "Active now"
                            : `Active ${timeAgo(member.lastSeen)} ago`}
                        </div>
                      </div>
                    </div>
                  </div>
                  {currentUser &&
                    currentUser.id !== member.userId &&
                    memberList.length > 2 && (
                      <button
                        onClick={() => openConfirmDialog(member)}
                        className="cursor-pointer p-2 rounded-lg hover:bg-red-500/20 transition-colors opacity-0 group-hover:opacity-100"
                        disabled={isRemoving}
                      >
                        <Trash
                          size={18}
                          className="text-gray-400 hover:text-red-500"
                        />
                      </button>
                    )}
                </div>
              ))}
              <button
                className="flex items-center gap-3 px-4 py-4 w-full rounded-lg hover:bg-gray-800/50 transition-all duration-200 cursor-pointer group"
                onClick={() => setIsOpenInvite(true)}
              >
                <div className="p-3 bg-gray-100 rounded-full h-full flex items-center justify-center">
                  <UserPlus size={20} color="#000000" />
                </div>

                <span className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">
                  Invite
                </span>
              </button>
            </div>
          </div>
        )}
        <div className="flex flex-col absolute bottom-0 items-center w-full">
          <button
            className="flex items-center gap-3 px-4 py-3 w-full 
          bg-zinc-800 hover:bg-zinc-700
            border-t border-zinc-700
            transition-all duration-300 cursor-pointer group"
            onClick={() => setIsOpenMutePopUp(true)}
          >
            <div className="p-1 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
              {currentMember?.isMutedAt ? (
                <Bell size={18} color="#a1a1aa" />
              ) : (
                <BellOff size={18} color="#a1a1aa" />
              )}
            </div>
            <span className="text-sm font-medium text-zinc-400 tracking-wide">
              {currentMember?.isMutedAt
                ? "Turn on notifications"
                : "Turn off notifications"}
            </span>
          </button>
          {selectedConversation.type === "PRIVATE" && (
            <button
              className="flex items-center gap-3 px-4 py-3 w-full 
      bg-zinc-800 hover:bg-zinc-700
      border-t border-zinc-700
      transition-all duration-300 cursor-pointer group"
              onClick={() => setIsOpenBlockDialog(true)}
            >
              <div className="p-1 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                <ShieldBan size={18} color="#f87171" />
              </div>
              <span className="text-sm font-medium text-red-400 tracking-wide">
                {selectedConversation.isBlocked ? "Unblock user" : "Block user"}
              </span>
            </button>
          )}
          {selectedConversation.type === "GROUP" && (
            <button
              className="flex items-center gap-3 px-4 py-3 w-full 
            bg-zinc-800 hover:bg-zinc-700
              border-t border-zinc-700
              transition-all duration-300 cursor-pointer group"
              onClick={() => setIsOpenLeave(true)}
            >
              <div className="p-1 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                <LogOut size={18} color="#f87171" />
              </div>
              <span className="text-sm font-medium text-red-400 tracking-wide">
                Leave group
              </span>
            </button>
          )}
        </div>
      </div>

      <EditConversationPopUp
        onClose={() => setIsOpenEdit(false)}
        open={isOpenEdit}
      />

      <ConfirmDialog
        open={isOpenConfirm}
        onClose={() => {
          setIsOpenConfirm(false);
          setSelectedMember(null);
        }}
        onConfirm={handleRemoveMember}
        title="Remove Member"
        message={`Are you sure you want to remove "${selectedMember?.username}" from this group?`}
        confirmText="Remove"
        cancelText="Cancel"
      />

      <ConfirmDialog
        open={isOpenLeave}
        onClose={() => {
          setIsOpenLeave(false);
        }}
        onConfirm={handleLeave}
        title="Remove Member"
        message={`Are you sure you want to  leave from this group?`}
        confirmText="Remove"
        cancelText="Cancel"
      />

      <MemberInvitePopUp
        open={isOpenInvite}
        onClose={() => setIsOpenInvite(false)}
      />

      {currentMember && (
        <MutePopUp
          open={isOpenMutePopUp}
          onClose={() => setIsOpenMutePopUp(false)}
          converstationId={selectedConversation.id}
          isMuted={!!currentMember.isMutedAt}
        />
      )}

      {memberList.length === 2 && otherMember && (
        <ConfirmDialog
          open={isOpenBlockDialog}
          onClose={() => setIsOpenBlockDialog(false)}
          onConfirm={async () => {
            if (!otherMember?.userId) return;
            if (selectedConversation.isBlocked) {
              await handleUnblock(otherMember.userId);
            } else {
              await handleBlock(otherMember.userId);
            }
            window.location.reload();
          }}
          message={
            selectedConversation.isBlocked
              ? "Do you want to unblock this user?"
              : "Do you want to block this user?"
          }
          title={selectedConversation.isBlocked ? "Unblock user" : "Block user"}
        />
      )}
    </>
  );
};

export default DetailConversation;
