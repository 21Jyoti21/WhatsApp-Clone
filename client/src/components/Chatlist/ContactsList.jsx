import { reducerCases } from "@/context/constants";
import { useStateProvider } from "@/context/StateContext";
import { GET_ALL_CONTACTS } from "@/utils/ApiRoutes";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { BiArrowBack, BiSearchAlt2 } from "react-icons/bi";
import ChatLIstItem from "./ChatLIstItem";

function ContactsList() {
  const [allContacts, setAllContacts] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [searchContacts, setSearchContacts] = useState([]);
  const [{}, dispatch] = useStateProvider();
  useEffect(()=>{
    if(searchTerm.length){
      const filteredData={};
      Object.keys(allContacts).forEach((key)=>{
        filteredData[key]=allContacts[key].filter((obj)=>obj.name.toLowerCase().includes(searchTerm.toLowerCase()))
      })
      setSearchContacts(filteredData)
    }else{
      setSearchContacts(allContacts)
    }
  },[searchTerm])
  useEffect(() => {
    const getContacts = async () => {
      try {
        const response = await axios.get(GET_ALL_CONTACTS);
        const users = response?.data?.users;
        if (!users || typeof users !== 'object' || Array.isArray(users)) {
          console.error("[ContactsList] Invalid users format! Expected object, got:", typeof users, users);
          setAllContacts({});
          return;
        }
        setAllContacts(users);
        setSearchContacts(users)
      } catch (err) {
        console.log(err);
        setAllContacts({});
      }
    };
    getContacts();
  }, []);
  return (
    <div className="h-full flex flex-col">
      <div className="h-24 flex items-end px-3 py-4 ">
        <div className="flex items-center gap-12 text-white">
          <BiArrowBack
            className="cursor-pointer text-xl"
            onClick={() =>
              dispatch({ type: reducerCases.SET_ALL_CONTACTS_PAGE})
            }
          />
          <span>New Chat</span>
        </div>
      </div>
      <div className="bg-conversation-panel-background h-full flex-auto overflow-auto custom-scrollbar">
        <div className="flex py-3 items-center gap-3 h-14">
          <div className="bg-panel-header-background flex items-center gap-5 px-3 py-1 rounded-lg flex-grow mx-4">
            <div>
              <BiSearchAlt2 className="text-panel-header-icon cursor-pointer text-l" />
            </div>

            <div>
              <input
                type="text"
                placeholder="Search Contacts"
                className="bg-transparent text-sm focus:outline-none text-white w-full"
                value={searchTerm}
                onChange={e=>setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
        {
          (() => {
            if (!allContacts) {
              console.warn("[ContactsList] allContacts is falsy");
              return null;
            }
            if (typeof allContacts !== 'object') {
              console.error("[ContactsList] allContacts is not an object:", typeof allContacts);
              return null;
            }
            if (Array.isArray(allContacts)) {
              console.error("[ContactsList] allContacts is an array, expected object!");
              return null;
            }
            try {
              const entries = Object.entries(searchContacts);
              return entries.map(([initialLetter,userList])=>{
            if (!Array.isArray(userList)) {
              console.warn("[ContactsList] userList is not an array:", userList);
              return null;
            }
            return ( userList.length >0 &&(
            <div key={Date.now()+initialLetter}>
              <div className="text-teal-light pl-10 py-5 ">{initialLetter}</div>
              {
                userList.filter(Boolean).map((contact, index)=>{
                  if (!contact) {
                    console.warn("[ContactsList] Contact is falsy at index", index);
                    return null;
                  }
                  if (!contact.id) {
                    console.error("[ContactsList] Contact missing id at index", index, ":", contact);
                    return null;
                  }
                  return (<ChatLIstItem
                  data={contact}
                  isContactsPage={true}
                  key={contact.id || index}
                  />)
                })
              }
            </div>))
              });
            } catch (error) {
              console.error("[ContactsList] Error in Object.entries:", error);
              console.error("[ContactsList] allContacts value:", allContacts);
              return null;
            }
          })()
        }
      </div>
    </div>
  );
}
export default ContactsList;