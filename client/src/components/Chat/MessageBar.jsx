import { reducerCases } from "@/context/constants";
import { useStateProvider } from "@/context/StateContext";
import { ADD_IMAGE_MESSAGE_ROUTE, ADD_MESSAGE_ROUTE } from "@/utils/ApiRoutes";
import axios from "axios";
import EmojiPicker from "emoji-picker-react";
import React, { useEffect, useRef, useState } from "react";
import { BsEmojiSmile } from "react-icons/bs";
import { FaMicrophone } from "react-icons/fa";
import { ImAttachment } from "react-icons/im";
import { MdSend } from "react-icons/md";
import PhotoPicker from "../common/PhotoPicker";
import dynamic from "next/dynamic";

const CaptureAudio = dynamic(() => import("../common/CaptureAudio"), {
  ssr: false,
});

function MessageBar() {
  const [{ userInfo, currentChatUser, socket }, dispatch] = useStateProvider();
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emoijPickerRef = useRef(null);
  const [grabPhoto, setGrabPhoto] = useState(false);
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  const textareaRef = useRef(null);

  const photoPickerChange = async (e) => {
    try {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("image", file);
      formData.append("from", userInfo.id);
      formData.append("to", currentChatUser.id);

      const response = await axios.post(ADD_IMAGE_MESSAGE_ROUTE, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      if (response.status === 201) {
        socket.emit("send-msg", {
          to: currentChatUser?.id,
          from: userInfo?.id,
          message: {
            ...response.data.message,
            type: "image",
          },
        });
        
        dispatch({
          type: reducerCases.ADD_MESSAGE,
          newMessage: {
            ...response.data.message,
            fromSelf: true,
          },
        });
        
        dispatch({
          type: reducerCases.UPDATE_CONTACT_LAST_MESSAGE,
          payload: {
            contactId: currentChatUser.id,
            message: response.data.message,
          },
        });
      }
    } catch (err) {
      console.log(err);
    } finally {
      setGrabPhoto(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        emoijPickerRef.current &&
        !emoijPickerRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  const handleEmojiClick = (emoji) => {
    setMessage((prevMessage) => prevMessage + emoji.emoji);
  };

  const sendMessage = async () => {
    if (!message.trim()) return;
    
    if (currentChatUser.id === userInfo.id) {
      console.warn("Sending message to self — skipping socket");
      dispatch({
        type: reducerCases.ADD_MESSAGE,
        newMessage: {
          id: Date.now(),
          senderId: userInfo.id,
          recieverId: userInfo.id,
          type: "text",
          message,
          messageStatus: "read",
          createdAt: new Date().toISOString(),
          fromSelf: true,
        },
      });
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
      return;
    }

    const messageId = Date.now();
    const socketMessage = {
      id: messageId,
      senderId: userInfo.id,
      recieverId: currentChatUser.id,
      type: "text",
      message,
      messageStatus: "delivered",
      createdAt: new Date().toISOString(),
    };

    dispatch({
      type: reducerCases.ADD_MESSAGE,
      newMessage: {
        ...socketMessage,
        fromSelf: true,
      },
    });

    dispatch({
      type: reducerCases.UPDATE_CONTACT_LAST_MESSAGE,
      payload: {
        contactId: currentChatUser.id,
        message: socketMessage,
      },
    });

    setMessage("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    if (!socket || typeof socket.emit !== "function") return;

    socket.emit("send-msg", {
      to: currentChatUser.id,
      from: userInfo.id,
      message: socketMessage,
    });

    try {
      await axios.post(ADD_MESSAGE_ROUTE, {
        to: currentChatUser.id,
        from: userInfo.id,
        message,
      });
    } catch (err) {
      console.error("Message failed", err);
    }
  };

  useEffect(() => {
    if (grabPhoto) {
      const input = document.getElementById("photo-picker");
      if (input) {
        input.click();
      }
    }
  }, [grabPhoto]);

  return (
    <div className="px-4 py-3 flex items-center gap-3 min-h-[68px]">
      {!showAudioRecorder && (
        <div className="flex items-center w-full bg-input-background rounded-lg px-4 py-2 gap-3 min-h-[52px]">
          <div className="relative flex-shrink-0" ref={emoijPickerRef}>
            <BsEmojiSmile
              className="text-panel-header-icon cursor-pointer text-xl"
              onClick={(e) => {
                e.stopPropagation();
                setShowEmojiPicker((prev) => !prev);
              }}
            />
            {showEmojiPicker && (
              <div className="absolute bottom-12 left-0 z-40">
                <EmojiPicker onEmojiClick={handleEmojiClick} theme="dark" />
              </div>
            )}
          </div>

          <ImAttachment
            className="text-panel-header-icon cursor-pointer text-xl flex-shrink-0"
            onClick={() => setGrabPhoto(true)}
          />

          <textarea
            ref={textareaRef}
            placeholder="Type a message"
            rows={1}
            className="
              bg-transparent
              text-sm
              text-white
              focus:outline-none
              w-full
              resize-none
              overflow-y-auto
              leading-5
              max-h-[100px]
              py-1
            "
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#374045 transparent'
            }}
            onChange={(e) => {
              setMessage(e.target.value);
              e.target.style.height = "auto";
              const newHeight = Math.min(e.target.scrollHeight, 100);
              e.target.style.height = newHeight + "px";
            }}
            value={message}
            onKeyDown={handleKeyDown}
          />

          <div className="flex-shrink-0">
            {message.length ? (
              <MdSend
                className="text-panel-header-icon cursor-pointer text-xl"
                onClick={sendMessage}
              />
            ) : (
              <FaMicrophone
                className="text-panel-header-icon cursor-pointer text-xl"
                onClick={() => setShowAudioRecorder(true)}
              />
            )}
          </div>
        </div>
      )}
      
      {grabPhoto && <PhotoPicker onChange={photoPickerChange} />}
      {showAudioRecorder && <CaptureAudio hide={setShowAudioRecorder} />}
    </div>
  );
}
export default MessageBar;