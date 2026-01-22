import React, { useEffect, useRef, useState } from "react";
import ChatList from "./Chatlist/ChatList";
import Empty from "./Empty";
import { onAuthStateChanged } from "firebase/auth";
import { firebaseAuth } from "@/utils/FirebaseConfig";
import {
  CHECK_USER_ROUTE,
  GET_MESSAGES_ROUTE,
  GET_CALL_LOGS_ROUTE,
  HOST,
} from "@/utils/ApiRoutes";
import { useRouter } from "next/router";
import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";
import axios from "axios";
import Chat from "./Chat/Chat";
import { io } from "socket.io-client";
import SearchMessages from "./Chat/SearchMessages";
import ResizableDivider from "./common/ResizableDivider";
import VoiceCall from "./Call/VoiceCall";
import VideoCall from "./Call/VideoCall";
import IncomingVideoCall from "./common/IncomingVideoCall";
import IncomingCall from "./common/IncomingCall";

function Main() {
  const [sidebarWidth, setSidebarWidth] = useState(360);
  const router = useRouter();
  const [socketEvent, setSocketEvent] = useState(false);
  const [
    {
      userInfo,
      currentChatUser,
      messagesSearch,
      videoCall,
      voiceCall,
      incomingVoiceCall,
      incomingVideoCall,
    },
    dispatch,
  ] = useStateProvider();
  const socket = useRef();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      firebaseAuth,
      async (currentUser) => {
        if (!currentUser) {
          router.replace("/login");
          return;
        }

        if (!userInfo && currentUser.email) {
          try {
            const { data } = await axios.post(CHECK_USER_ROUTE, {
              email: currentUser.email,
            });

            if (!data.status) {
              router.replace("/login");
              return;
            }
            const {
              id,
              name,
              email,
              profilePicture: profileImage,
              status = "",
            } = data.data;

            dispatch({
              type: reducerCases.SET_USER_INFO,
              userInfo: {
                id,
                name,
                email,
                profileImage,
                status,
              },
            });
          } catch (err) {
            console.error(err);
            router.replace("/login");
          }
        }
      },
    );

    return () => unsubscribe();
  }, [userInfo]);
  useEffect(() => {
    if (!userInfo?.id) {
      return;
    }
    const loadCallLogs = async () => {
      try {
        const response = await axios.get(
          `${GET_CALL_LOGS_ROUTE}/${userInfo.id}`,
        );
        const logsData = response.data;
        if (logsData && Array.isArray(logsData.logs)) {
          dispatch({
            type: reducerCases.SET_CALL_LOGS,
            callLogs: logsData.logs,
          });
        } else {
          console.warn("[Main] Unexpected API response format:", logsData);
          dispatch({
            type: reducerCases.SET_CALL_LOGS,
            callLogs: [],
          });
        }
      } catch (err) {
        console.error("[Main] Failed to fetch call logs:", err);
        console.error("[Main] Error details:", {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
          url: `${GET_CALL_LOGS_ROUTE}/${userInfo.id}`,
        });
        dispatch({
          type: reducerCases.SET_CALL_LOGS,
          callLogs: [],
        });
      }
    };
    const timeoutId = setTimeout(() => {
      loadCallLogs();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [userInfo?.id, dispatch]);

  useEffect(() => {
    if (userInfo) {
      // socket.current = io(HOST);
      socket.current = io(HOST, {
  transports: ["websocket"],
  secure: true,
        reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
});

      socket.current.emit("add-user", userInfo.id);
      dispatch({
        type: reducerCases.SET_SOCKET,
        socket: socket.current,
      });
    }
  }, [userInfo]);
  useEffect(() => {
    if (socket.current && !socketEvent) {
      socket.current.on("incoming-voice-call", ({ from, roomId, callType }) => {
        dispatch({
          type: reducerCases.SET_INCOMING_VOICE_CALL,
          incomingVoiceCall: { ...from, roomId, callType },
        });
      });
      socket.current.on("incoming-video-call", ({ from, roomId, callType }) => {
        dispatch({
          type: reducerCases.SET_INCOMING_VIDEO_CALL,
          incomingVideoCall: { ...from, roomId, callType },
        });
      });
      socket.current.on("voice-call-rejected", () => {
        dispatch({
          type: reducerCases.END_CALL,
        });
      });
      socket.current.on("video-call-rejected", () => {
        dispatch({
          type: reducerCases.END_CALL,
        });
      });
      socket.current.on("end-call", () => {
        dispatch({ type: reducerCases.END_CALL });
      });
      socket.current.on("online-users", ({ onlineUsers }) => {
        dispatch({
          type: reducerCases.SET_ONLINE_USERS,
          onlineUsers,
        });
      });

      setSocketEvent(true);
    }
  }, [socket.current]);
  useEffect(() => {
    if (!socket.current) return;
    const handleMsgReceive = (message) => {
      const isMessageForOpenChat =
        currentChatUser &&
        message.senderId === currentChatUser.id &&
        message.recieverId === userInfo.id;

      if (isMessageForOpenChat) {
        dispatch({
          type: reducerCases.ADD_MESSAGE,
          newMessage: {
            ...message,
            fromSelf: false,
          },
        });
      }

      dispatch({
        type: reducerCases.UPDATE_CONTACT_LAST_MESSAGE,
        payload: {
          contactId: message.senderId,
          message,
        },
      });
    };
    socket.current.on("msg-recieve", handleMsgReceive);
    return () => {
      socket.current.off("msg-recieve", handleMsgReceive);
    };
  }, [socket.current, currentChatUser, userInfo, dispatch]);
  useEffect(() => {
    if (!userInfo || !currentChatUser) {
      console.log(
        "[Main] getMessages skipped - missing userInfo or currentChatUser",
      );
      return;
    }
    const getMessages = async () => {
      try {
        const { data } = await axios.get(
          `${GET_MESSAGES_ROUTE}/${userInfo.id}/${currentChatUser.id}`,
        );

        dispatch({
          type: reducerCases.SET_MESSAGES,
          messages: data.messages,
        });
      } catch (error) {
        console.error("Failed to fetch messages", error);
      }
    };

    getMessages();
  }, [userInfo, currentChatUser, dispatch]);
  return (
    <>
      {incomingVideoCall && <IncomingVideoCall />}
      {incomingVoiceCall && <IncomingCall />}
      {(videoCall || voiceCall) && (
        <div className="fixed inset-0 z-[9999] bg-black">
          {videoCall && <VideoCall />}
          {voiceCall && <VoiceCall />}
        </div>
      )}

      {!videoCall && !voiceCall && (
        <div className="flex h-screen w-screen overflow-hidden">
          <div
            className="bg-panel-header-background shrink-0"
            style={{ width: sidebarWidth }}
          >
            <ChatList />
          </div>

          <ResizableDivider setSidebarWidth={setSidebarWidth} />

          <div className="flex-1 bg-[#0b141a]">
            {currentChatUser ? (
              <div
                className={
                  messagesSearch ? "grid grid-cols-2 h-full" : "h-full"
                }
              >
                <Chat />
                {messagesSearch && <SearchMessages />}
              </div>
            ) : (
              <Empty />
            )}
          </div>
        </div>
      )}
    </>
  );
}
export default Main;
