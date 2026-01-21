import React from "react";
import ChatHeader from "./ChatHeader";
import ChatContainer from "./ChatContainer";
import MessageBar from "./MessageBar";

function Chat() {
  return (
    <div className="border-[#202c33] border-l w-full flex flex-col h-screen z-10 relative">
      <div
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage: "url('/chat-bg.png')",
          backgroundRepeat: "repeat",
          backgroundSize: "auto",
          backgroundColor: "#0b141a",
          opacity: 0.08,
        }}
      />      
      <div className="relative z-10 flex flex-col h-full bg-transparent">
        <ChatHeader />
        <ChatContainer />
        <MessageBar />
      </div>
    </div>
  );
}
export default Chat;