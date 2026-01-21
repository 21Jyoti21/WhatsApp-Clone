import { reducerCases } from "@/context/constants";
import { useStateProvider } from "@/context/StateContext";
import { GET_INITIAL_CONTACTS_ROUTE } from "@/utils/ApiRoutes";
import React, { useEffect, useMemo } from "react";
import ChatLIstItem from "./ChatLIstItem";
import axios from "axios";
function List() {
  const [{ userInfo, userContacts, filteredContacts, archivedChatIds }, dispatch] =
    useStateProvider();
  useEffect(()=>{
    if (!userInfo?.id) return;
    const getContacts=async()=>{
      try{
        const{data:{users,onlineUsers},}=await axios(`${GET_INITIAL_CONTACTS_ROUTE}/${userInfo.id}`)
        dispatch({type:reducerCases.SET_ONLINE_USERS,onlineUsers:onlineUsers})
        dispatch({type:reducerCases.SET_USER_CONTACTS,userContacts:users})
      }catch(err){
        console.log(err)
      }
    }
    getContacts()
  },[userInfo, dispatch])
  const sortedContacts = useMemo(() => {
    if (!userContacts || !Array.isArray(userContacts)) return [];

    const sortByLatest = (arr) =>
      [...arr].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    const isArchived = (contact) =>
      Array.isArray(archivedChatIds) &&
      archivedChatIds.includes(contact.id);

    const baseList =
      filteredContacts && filteredContacts.length > 0
        ? filteredContacts
        : userContacts;

    const visible = baseList.filter((c) => !isArchived(c));

    return sortByLatest(visible);
  }, [userContacts, filteredContacts, archivedChatIds]);

  return (
    <div className="bg-conversation-panel-background h-full flex-auto overflow-auto custom-scrollbar">
      {sortedContacts.map((contact) => (
        <ChatLIstItem data={contact} key={contact.id} />
      ))}
    </div>
  );
}
export default List;