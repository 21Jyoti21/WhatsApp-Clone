import { useStateProvider } from "@/context/StateContext";
import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { MdOutlineCallEnd } from "react-icons/md";
import { reducerCases } from "@/context/constants";
import { GET_CALL_TOKEN } from "@/utils/ApiRoutes";
import axios from "axios";

function Container({ data, onCallEnd }) {
  const zgRef = useRef(null);
  const localStreamRef = useRef(null);
  const publishStreamIdRef = useRef(null);
  const hasJoinedRoom = useRef(false);
  const isEndingCall = useRef(false);

  const [{ socket, userInfo }, dispatch] = useStateProvider();
  const [callAccepted, setCallAccepted] = useState(false);
  const [token, setToken] = useState(undefined);
  const avatarSrc =
  userInfo?.profileImage && userInfo.profileImage.trim() !== ""
    ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/uploads/images/${userInfo.profileImage.replace(/^\/+/, "")}`
    : `${process.env.NEXT_PUBLIC_BACKEND_URL}/uploads/images/default_avatar.png`;
  
  useEffect(() => {
    if (!socket) return;
    if (data.type === "out-going") {
      const handleAccept = () => {
        console.log("Call accepted");
        setCallAccepted(true);
      };
      socket.on("accept-call", handleAccept);
      return () => socket.off("accept-call", handleAccept);
    } else {
      setTimeout(() => {
        console.log("Auto-accepting incoming call");
        setCallAccepted(true);
      }, 1000);
    }
  }, [data, socket]);

  useEffect(() => {
    const getToken = async () => {
      try {
        const { data: { token: returnedToken } } = await axios.get(
          `${GET_CALL_TOKEN}/${userInfo.id}`
        );
        setToken(returnedToken);
      } catch (err) {
        console.error("Failed to get token:", err);
      }
    };
    if (callAccepted) getToken();
  }, [callAccepted, userInfo.id]);

  useEffect(() => {
    if (!token || hasJoinedRoom.current) return;
    const startCall = async () => {
      try {
        const { ZegoExpressEngine } = await import("zego-express-engine-webrtc");
        if (!zgRef.current) {
          zgRef.current = new ZegoExpressEngine(
            Number(process.env.NEXT_PUBLIC_ZEGO_APP_ID),
            process.env.NEXT_PUBLIC_ZEGO_SERVER_ID
          );
          zgRef.current.setLogConfig({ logLevel: "error", remoteLogLevel: "disable" });
        }
        const zg = zgRef.current;
        const streamID = `stream_${userInfo.id}_${Date.now()}`;
        publishStreamIdRef.current = streamID;
        zg.off("roomStreamUpdate");
        zg.on("roomStreamUpdate", async (roomID, updateType, streamList) => {
          if (updateType === "ADD") {
            for (const stream of streamList) {
              if (stream.streamID === publishStreamIdRef.current) {
                continue;
              }
              const remoteContainer = document.getElementById(
                data.callType === "video" ? "remote-video" : "remote-audio"
              );
              if (!remoteContainer) continue;

              remoteContainer.innerHTML = "";
              const mediaEl = document.createElement(data.callType === "video" ? "video" : "audio");
              mediaEl.autoplay = true;
              mediaEl.playsInline = true;
              mediaEl.muted = false;
              if (data.callType === "video") {
                mediaEl.style.width = "100%";
                mediaEl.style.height = "100%";
                mediaEl.style.objectFit = "cover";
              }
              remoteContainer.appendChild(mediaEl);

              const remoteStream = await zg.startPlayingStream(stream.streamID, {
                audio: true,
                video: data.callType === "video"
              });
              mediaEl.srcObject = remoteStream;
              break;
            }
          }
        });

        await zg.loginRoom(
          data.roomId.toString(),
          token,
          { userID: userInfo.id.toString(), userName: userInfo.name },
          { userUpdate: true }
        );
        hasJoinedRoom.current = true;

        const localStream = await zg.createStream({
          camera: { audio: true, video: data.callType === "video" }
        });
        localStreamRef.current = localStream;

        const localContainer = document.getElementById(
          data.callType === "video" ? "local-video" : "local-audio"
        );
        if (localContainer) {
          localContainer.innerHTML = "";
          const mediaEl = document.createElement(data.callType === "video" ? "video" : "audio");
          mediaEl.autoplay = true;
          mediaEl.muted = true;
          mediaEl.playsInline = true;
          if (data.callType === "video") {
            mediaEl.style.width = "100%";
            mediaEl.style.height = "100%";
            mediaEl.style.objectFit = "cover";
          }
          mediaEl.srcObject = localStream;
          localContainer.appendChild(mediaEl);
        }
        await zg.startPublishingStream(streamID, localStream);

      } catch (err) {
        console.error("Error:", err);
        hasJoinedRoom.current = false;
      }
    };
    startCall();
  }, [token, data, userInfo]);

  const endCall = async () => {
    if (isEndingCall.current) return;
    isEndingCall.current = true;

    if (zgRef.current && hasJoinedRoom.current) {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
      }
      if (publishStreamIdRef.current) {
        await zgRef.current.stopPublishingStream(publishStreamIdRef.current);
      }
      if (localStreamRef.current) {
        zgRef.current.destroyStream(localStreamRef.current);
      }
      try {
        zgRef.current.logoutRoom(data.roomId.toString());
      } catch (err) {
        console.error("logoutRoom failed (endCall):", err);
      }

      hasJoinedRoom.current = false;
      zgRef.current = null;
    }

    if (socket) {
      socket.emit("end-call", { roomId: data.roomId, to: data.id });
    }
    if (typeof onCallEnd === "function") {
      try {
        onCallEnd("ended");
      } catch (e) {
        console.error("Failed to call onCallEnd", e);
      }
    }
    dispatch({ type: reducerCases.END_CALL });
  };

  useEffect(() => {
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
      }
      const zg = zgRef.current;
      if (zg && hasJoinedRoom.current) {
        try {
          zg.logoutRoom(data.roomId.toString());
        } catch (err) {
          console.error("logoutRoom failed (cleanup):", err);
        }
      }

      hasJoinedRoom.current = false;
      zgRef.current = null;
    };
  }, [data.roomId]);

  if (data.callType !== "video") {

    return (
      <div className="w-full h-screen bg-slate-900 flex flex-col items-center justify-center relative">
        <div className="flex flex-col items-center text-center mb-8">
          <h1 className="text-white text-5xl font-normal mb-3">
            {data.name}
          </h1>
          <p className="text-white text-base">
            {callAccepted ? "On going call" : "Calling"}
          </p>
        </div>

        <div className="flex flex-col items-center mb-10">
          <Image
            src={data.profilePicture || "/default_avatar.png"}
            alt="Caller avatar"
            width={160}
            height={160}
            className="rounded-full object-cover"
          />
        </div>

        <div
          className="absolute bottom-12 left-1/2 -translate-x-1/2 h-16 w-16 bg-red-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-red-700 transition shadow-xl"
          onClick={endCall}
        >
          <MdOutlineCallEnd className="text-white text-3xl" />
        </div>

        <div id="remote-audio" style={{ display: "none" }} />
        <div id="local-audio" style={{ display: "none" }} />
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-black flex flex-col items-center justify-center relative">
      <div
        id="remote-video"
        className="absolute inset-0 w-full h-full bg-gray-900"
      />

      <div className="absolute top-10 left-1/2 transform -translate-x-1/2 z-20 text-center">
        <span className="text-white text-4xl font-semibold">{data.name}</span>
        <p className="text-white text-lg mt-2">
          {callAccepted ? "On going call" : "Calling"}
        </p>
      </div>

      <div
        id="local-video"
        className="absolute bottom-24 right-8 w-40 h-56 bg-gray-800 rounded-lg overflow-hidden z-30 shadow-2xl border-2 border-white/20"
      />

      <div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 h-16 w-16 bg-red-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-red-700 transition shadow-xl"
        onClick={endCall}
      >
        <MdOutlineCallEnd className="text-white text-3xl" />
      </div>
    </div>
  );
}
export default Container;