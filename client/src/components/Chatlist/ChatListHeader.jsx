import React, { useState } from "react";
import Avatar from "../common/Avatar";
import { useStateProvider } from "@/context/StateContext";
import { BsFillChatLeftTextFill, BsThreeDotsVertical, BsTelephone } from "react-icons/bs";
import { reducerCases } from "@/context/constants";
import ContextMenu from "../common/ContextMenu";
import { useRouter } from "next/router";
function ChatListHeader() {
  const [{ userInfo, showCallLogs }, dispatch] = useStateProvider();
  const router=useRouter()
  const [isContextMenuVisible, setIsContextMenuVisible] = useState(false);
  const [contextMenuCordinates, setContextMenuCordinates] = useState({
    x: 0,
    y: 0,
  });
  
  const showContextMenu = (e) => {
    e.preventDefault();
    setContextMenuCordinates({ x: e.pageX, y: e.pageY});
    setIsContextMenuVisible(true);
  };
  const contextMenuOptions=[
    {
      name:"Logout",
      callback:async()=>{
        setIsContextMenuVisible(false);
        router.push("/logout")
      },
    },
  ]
  const handleAllContactsPage = () => {
    dispatch({ type: reducerCases.SET_ALL_CONTACTS_PAGE });
  };

  const handleToggleCallLogs = () => {
    if (!showCallLogs) {
      dispatch({ type: reducerCases.SET_ALL_CONTACTS_PAGE, contactsPage: false });
    }
    dispatch({ type: reducerCases.SET_SHOW_CALL_LOGS });
  };

  return (
    <div className="h-16 px-4 py-3 flex justify-between items-center">
      <div className="cursor-pointer">
        <Avatar type="sm" image={userInfo?.profileImage} />
      </div>
      <div className="flex gap-6 items-center">
        <BsFillChatLeftTextFill
          className="text-panel-header-icon cursor-pointer text-xl"
          title="New Chat"
          onClick={handleAllContactsPage}
        />
        <BsTelephone
          className={`cursor-pointer text-xl ${
            showCallLogs ? "text-icon-green" : "text-panel-header-icon"
          }`}
          title="Call logs"
          onClick={handleToggleCallLogs}
        />
        <BsThreeDotsVertical
          className="text-panel-header-icon cursor-pointer text-xl"
          title="Menu"
          onClick={(e)=>showContextMenu(e)}
          id="context-opener"
        />
        {isContextMenuVisible &&(
          <ContextMenu
          options={contextMenuOptions}
          cordinates={contextMenuCordinates}
          contextMenu={isContextMenuVisible}
          setContextMenu={setIsContextMenuVisible}
          />
        )
        }
      </div>
    </div>
  );
}
export default ChatListHeader;