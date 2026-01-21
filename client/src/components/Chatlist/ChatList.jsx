import React, { useState,useEffect } from "react";
import ChatListHeader from "./ChatListHeader";
import SearchBar from "./SearchBar";
import List from "./List";
import { useStateProvider } from "@/context/StateContext";
import ContactsList from "./ContactsList";
import CallLogs from "@/components/Call/CallLogs";

function ChatList() {
  const [{contactsPage, showCallLogs}]=useStateProvider()
  const [pageType, setPageType] = useState("default")
  useEffect(()=>{
    if(contactsPage){
      setPageType("all-contacts")
    }else if(showCallLogs){
      setPageType("call-logs")
    }else{
      setPageType("default")
    }
  },[contactsPage, showCallLogs])
  return <div className="bg-conversation-panel-background flex flex-col h-screen z-20">
    {
    pageType==="default" && (
    <>
    <ChatListHeader/>
    <SearchBar/>
    <List />
    </>
  )}
  {
    pageType==="all-contacts" && <ContactsList/>
  }
  {pageType==="call-logs" && (
    <>
      <ChatListHeader/>
      <SearchBar/>
      <CallLogs />
    </>
  )}
  </div>;
}
export default ChatList;