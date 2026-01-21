import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";
import { logCall } from "@/utils/callLogUtils";
import dynamic from "next/dynamic";
import React, { useEffect } from "react";

const Container = dynamic(() => import("./Container"), { ssr: false });

function VideoCall() {
  const [{ videoCall, socket, userInfo }, dispatch] = useStateProvider();

  useEffect(() => {
    if (!socket || !videoCall || videoCall.type !== "out-going") return;
    socket.emit("outgoing-video-call", {
      to: videoCall.id,
      from: {
        id: userInfo.id,
        profilePicture: userInfo.profileImage,
        name: userInfo.name,
      },
      callType: videoCall.callType,
      roomId: videoCall.roomId,
    });

    const handleRejection = () => {
      if (userInfo && videoCall) {
        logCall({
          userId: userInfo.id,
          otherUserId: videoCall.id,
          otherUserName: videoCall.name,
          direction: "outgoing",
          callType: "video",
          status: "rejected",
          dispatch,
        });
      }
    };
    socket.on("video-call-rejected", handleRejection);
    return () => {
      socket.off("video-call-rejected", handleRejection);
    };
  }, [videoCall, socket, userInfo, dispatch]);

  const handleEndWithLog = (status) => {
    if (!videoCall || !userInfo) return;

    logCall({
      userId: userInfo.id,
      otherUserId: videoCall.id,
      otherUserName: videoCall.name,
      direction: videoCall.type === "out-going" ? "outgoing" : "incoming",
      callType: videoCall.callType || "video",
      status,
      dispatch,
    });
  };

  return videoCall ? (
    <Container data={videoCall} onCallEnd={handleEndWithLog} />
  ) : null;
}

export default VideoCall;