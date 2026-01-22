import { useStateProvider } from "@/context/StateContext";
import { calculateTime } from "@/utils/CalculateTime";
import React, { useEffect, useRef } from "react";
import MessageStatus from "../common/MessageStatus";
import ImageMessage from "./ImageMessage";
import { reducerCases } from "@/context/constants";
import dynamic from "next/dynamic";
const VoiceMessage = dynamic(() => import("./VoiceMessage"), { ssr: false });

function ChatContainer() {
  const [{ messages, currentChatUser, userInfo, socket }, dispatch] =
    useStateProvider();
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const isFirstLoad = useRef(true);
  useEffect(() => {
    isFirstLoad.current = true;
    containerRef.current?.scrollTo(0, 0);
  }, [currentChatUser]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (isFirstLoad.current && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
      isFirstLoad.current = false;
      return;
    }
    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      100;

    if (isNearBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  if (!currentChatUser) {
    return null;
  }
  return (
    <div className="relative flex-1 w-full overflow-hidden bg-transparent">
      <div className="flex w-full h-full">
        <div
          ref={containerRef}
          className="flex flex-col w-full gap-1 overflow-auto p-4 custom-scrollbar"
        >
          {messages
            ?.filter((m) => {
              const isValid = m && m.id;
              if (!isValid) {
                console.error("[ChatContainer] Invalid message filtered out:", m);
              }
              return isValid;
            })
            .map((message) => {
              if (!message || !message.id) {
                console.error("[ChatContainer] Message missing id!", message);
                return null;
              }
              if (!userInfo || !userInfo.id) {
                console.error("[ChatContainer] userInfo or userInfo.id is missing!", userInfo);
                return null;
              }
              return (
                <div
                  key={message.id}
                  className={`flex ${message.senderId === userInfo.id
                      ? "justify-end"
                      : "justify-start"
                    }`}
                >
                  {message.type === "text" && (
                    <div
                      className={`text-white px-2 py-[5px] text-sm rounded-md flex gap-2 items-start max-w-[45%] ${message.senderId === userInfo.id
                          ? "bg-outgoing-background"
                          : "bg-incoming-background"
                        }`}
                    >
                      <span className="break-all whitespace-pre-wrap">
                        {message.message}
                      </span>

                      <div className="flex gap-1 items-end">
                        <span className="text-bubble-meta text-[11px] pt-1 min-w-fit">
                          {calculateTime(message.createdAt || new Date())}
                        </span>

                        {message.senderId === userInfo.id && (
                          <MessageStatus messageStatus={message.messageStatus} />
                        )}
                      </div>
                    </div>
                  )}

                  {message.type === "image" && <ImageMessage message={message} />}
                  {message.type === "audio" && <VoiceMessage message={message} />}
                </div>
              );
            })}

          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
}
export default ChatContainer;