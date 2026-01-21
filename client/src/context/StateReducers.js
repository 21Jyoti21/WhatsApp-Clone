import VoiceCall from "@/components/Call/VoiceCall";
import { reducerCases } from "./constants";

export const initialState = {
  userInfo: undefined,
  newUser: false,
  contactsPage: false,
  currentChatUser: undefined,
  messages: [],
  socket: undefined,
  messagesSearch: false,
  userContacts: [],
  onlineUsers: [],
  filteredContacts: [],
  videoCall:undefined,
  voiceCall:undefined,
  incomingVoiceCall:undefined,
  incomingVideoCall:undefined,
  callLogs: [],
  archivedChatIds: [],
  showCallLogs: false,

};
const reducer = (state, action) => {
  switch (action.type) {
    case reducerCases.SET_USER_INFO:
      return {
        ...state,
        userInfo: action.userInfo,
      };
    case reducerCases.SET_NEW_USER:
      return {
        ...state,
        newUser: action.newUser,
      };
    case reducerCases.SET_ALL_CONTACTS_PAGE:
      return {
        ...state,
        contactsPage:
          action.contactsPage !== undefined
            ? action.contactsPage
            : !state.contactsPage,
      };
    case reducerCases.CHANGE_CURRENT_CHAT_USER:
      return {
        ...state,
        currentChatUser: action.user,
        messages: [],
      };
    case reducerCases.SET_MESSAGES:
      return {
        ...state,
        messages: action.messages,
      };
    case reducerCases.SET_SOCKET:
      return {
        ...state,
        socket: action.socket,
      };
    case reducerCases.ADD_MESSAGE:
      const msg = action.newMessage;

      if (!msg || !msg.id) {
        console.error("ADD_MESSAGE ignored invalid message:", msg);
        return state;
      }
      const exists = state.messages.some(
        (existingMsg) => existingMsg.id === msg.id
      );
      if (exists) {
        console.warn("ADD_MESSAGE: Duplicate message ignored:", msg.id);
        return state;
      }
      return {
        ...state,
        messages: [...state.messages, msg],
      };
    case reducerCases.REPLACE_MESSAGE:
      if (!action.newMessage || !action.newMessage.id) {
        console.error("[Reducer] REPLACE_MESSAGE - invalid newMessage:", action.newMessage);
        return state;
      }
      return {
        ...state,
        messages: state.messages.map((msg) => {
          return msg.id === action.tempId ? action.newMessage : msg;
        }),
      };
    case reducerCases.SET_MESSAGE_SEARCH:
      return {
        ...state,
        messagesSearch: !state.messagesSearch,
      };
    case reducerCases.SET_USER_CONTACTS:
      return {
        ...state,
        userContacts: action.userContacts,
      };
    case reducerCases.UPDATE_CONTACT_LAST_MESSAGE: {
      const { payload } = action;
      if (!payload || !payload.contactId || !payload.message) {
        return state;
      }
      const { contactId, message } = payload;
      const updatedContacts = state.userContacts.map((contact) => {
        if (contact.id !== contactId) return contact;
        const isIncoming =
          message.senderId && message.senderId !== state.userInfo?.id;
        const currentUnread =
          typeof contact.totalUnreadMessages === "number"
            ? contact.totalUnreadMessages
            : 0;
        return {
          ...contact,
          message: message.message ?? contact.message,
          type: message.type ?? contact.type,
          createdAt: message.createdAt || new Date().toISOString(),
          senderId: message.senderId ?? contact.senderId,
          recieverId: message.recieverId ?? contact.recieverId,
          messageStatus: message.messageStatus ?? contact.messageStatus,
          totalUnreadMessages: isIncoming && !(state.currentChatUser && state.currentChatUser.id == contactId) ? currentUnread + 1 : currentUnread,
        };
      });
      return {
        ...state,
        userContacts: updatedContacts,
      };
    }
    case reducerCases.CLEAR_CONTACT_UNREAD: {
      const contactId = action.contactId;
      if (!contactId) return state;
      const updatedContacts = state.userContacts.map((contact) => {
        if (contact.id !== contactId) return contact;
        return {
          ...contact,
          totalUnreadMessages: 0,
        };
      });
      return {
        ...state,
        userContacts: updatedContacts,
      };
    }
    case reducerCases.SET_ONLINE_USERS:
      return {
        ...state,
        onlineUsers: action.onlineUsers,
      };
    case reducerCases.SET_CONTACT_SEARCH:{
      const filteredContacts=state.userContacts.filter((contact)=>contact.name.toLowerCase().includes(action.contactSearch.toLowerCase()))
      return{
        ...state,
        contactSearch:action.contactSearch,
        filteredContacts,
      }
    }
    case reducerCases.SET_VIDEO_CALL:
      return{
        ...state,
        videoCall:action.videoCall,
      };
    case reducerCases.SET_VOICE_CALL:
      return{
        ...state,
        voiceCall:action.voiceCall,
      };
    case reducerCases.SET_INCOMING_VOICE_CALL:
      return{
        ...state,
        incomingVoiceCall:action.incomingVoiceCall,
      };
    case reducerCases.SET_INCOMING_VIDEO_CALL:
      return{
        ...state,
        incomingVideoCall:action.incomingVideoCall,
      };
    case reducerCases.END_CALL:
      return{
        ...state,
        voiceCall:undefined,
        videoCall:undefined,
        incomingVideoCall:undefined,
        incomingVoiceCall:undefined,
      };
    case reducerCases.SET_CALL_LOGS:
      return {
        ...state,
        callLogs: Array.isArray(action.callLogs) ? action.callLogs : [],
      };
    case reducerCases.ADD_CALL_LOG:
      return {
        ...state,
        callLogs: [action.callLog, ...(state.callLogs || [])],
      };
    case reducerCases.TOGGLE_ARCHIVE_CHAT: {
      const chatId = action.chatId;
      if (!chatId) return state;
      const isArchived = state.archivedChatIds.includes(chatId);
      return {
        ...state,
        archivedChatIds: isArchived
          ? state.archivedChatIds.filter((id) => id !== chatId)
          : [...state.archivedChatIds, chatId],
      };
    }
    case reducerCases.SET_SHOW_CALL_LOGS: {
      return {
        ...state,
        showCallLogs:
          typeof action.showCallLogs === "boolean"
            ? action.showCallLogs
            : !state.showCallLogs,
      };
    }
    case reducerCases.SET_EXIT_CHAT:
      return{
        ...state,
        currentChatUser:undefined,
      }
    default:
      return state;
  }
};
export default reducer;