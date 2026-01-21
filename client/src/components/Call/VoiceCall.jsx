import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";
import { logCall } from "@/utils/callLogUtils";
import dynamic from "next/dynamic";
import React, { useEffect } from "react";

const Container = dynamic(() => import("./Container"), { ssr: false });

function VoiceCall() {
  const [{ voiceCall, socket, userInfo }, dispatch] = useStateProvider();

  useEffect(() => {
    if (!socket || !voiceCall || voiceCall.type !== "out-going") return;

    socket.emit("outgoing-voice-call", {
      to: voiceCall.id,
      from: {
        id: userInfo.id,
        profilePicture: userInfo.profileImage,
        name: userInfo.name,
      },
      callType: voiceCall.callType,
      roomId: voiceCall.roomId,
    });

    const handleRejection = () => {
      if (userInfo && voiceCall) {
        logCall({
          userId: userInfo.id,
          otherUserId: voiceCall.id,
          otherUserName: voiceCall.name,
          direction: "outgoing",
          callType: "voice",
          status: "rejected",
          dispatch,
        });
      }
    };
    socket.on("voice-call-rejected", handleRejection);
    return () => {
      socket.off("voice-call-rejected", handleRejection);
    };
  }, [voiceCall, socket, userInfo, dispatch]);

  const handleEndWithLog = (status) => {
    if (!voiceCall || !userInfo) return;

    logCall({
      userId: userInfo.id,
      otherUserId: voiceCall.id,
      otherUserName: voiceCall.name,
      direction: voiceCall.type === "out-going" ? "outgoing" : "incoming",
      callType: voiceCall.callType || "voice",
      status,
      dispatch,
    });
  };

  return voiceCall ? (
    <Container data={voiceCall} onCallEnd={handleEndWithLog} />
  ) : null;
}

export default VoiceCall;