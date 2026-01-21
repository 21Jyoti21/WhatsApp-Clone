import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";
import { logCall } from "@/utils/callLogUtils";
import React from "react";
import Image from "next/image";

function IncomingCall() {
  const [{ incomingVoiceCall, socket, userInfo }, dispatch] = useStateProvider();
  const acceptCall = () => {
    dispatch({
      type: reducerCases.SET_VOICE_CALL,
      voiceCall: {
        ...incomingVoiceCall,
        type: "in-coming",
      },
    });
    dispatch({
      type: reducerCases.SET_INCOMING_VOICE_CALL,
      incomingVoiceCall: undefined,
    });
    if (socket) {
      socket.emit("accept-incoming-call", {
        id: incomingVoiceCall.id,
      });
    }
  };

  const rejectCall = () => {
    if (userInfo && incomingVoiceCall) {
      logCall({
        userId: userInfo.id,
        otherUserId: incomingVoiceCall.id,
        otherUserName: incomingVoiceCall.name,
        direction: "incoming",
        callType: "voice",
        status: "rejected",
        dispatch,
      });
    }
    if (socket) {
      socket.emit("reject-voice-call", {
        from: incomingVoiceCall.id,
      });
    }
    dispatch({
      type: reducerCases.SET_INCOMING_VOICE_CALL,
      incomingVoiceCall: undefined,
    });
  };

  if (!incomingVoiceCall) return null;
  return (
    <div className="h-24 w-80 fixed bottom-8 mb-0 right-6 z-50 rounded-sm flex gap-5 items-center justify-start p-4 bg-conversation-panel-background text-white drop-shadow-2xl border-icon-green border-2 py-14">
      <div>
        <Image
          src={incomingVoiceCall.profilePicture || "/default_avatar.png"}
          alt="avatar"
          width={70}
          height={70}
          className="rounded-full"
        />
      </div>
      <div>
        <div>{incomingVoiceCall.name}</div>
        <div className="text-xs">Incoming Voice Call</div>
        <div className="flex gap-2 mt-2">
          <button
            className="bg-red-500 p-1 px-3 text-sm rounded-full hover:bg-red-600"
            onClick={rejectCall}
          >
            Reject
          </button>
          <button
            className="bg-green-500 p-1 px-3 text-sm rounded-full hover:bg-green-600"
            onClick={acceptCall}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
export default IncomingCall;