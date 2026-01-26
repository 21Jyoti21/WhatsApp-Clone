export const HOST = process.env.NEXT_PUBLIC_HOST;
export const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Auth
const AUTH_ROUTE = `${API_URL}/api/auth`;
export const CHECK_USER_ROUTE = `${AUTH_ROUTE}/check-user`;
export const ONBOARD_USER_ROUTE = `${AUTH_ROUTE}/onboard-user`;
export const GET_ALL_CONTACTS = `${AUTH_ROUTE}/get-contacts`;
export const GET_CALL_TOKEN = `${AUTH_ROUTE}/generate-token`;

// Messages
const MESSAGES_ROUTE = `${API_URL}/api/messages`;
export const ADD_MESSAGE_ROUTE = `${MESSAGES_ROUTE}/add-message`;
export const GET_MESSAGES_ROUTE = `${MESSAGES_ROUTE}/get-messages`;
export const ADD_IMAGE_MESSAGE_ROUTE = `${MESSAGES_ROUTE}/add-image-message`;
export const ADD_AUDIO_MESSAGE_ROUTE = `${MESSAGES_ROUTE}/add-audio-message`;
export const GET_INITIAL_CONTACTS_ROUTE = `${MESSAGES_ROUTE}/get-initial-contacts`;

// Calls
const CALLS_ROUTE = `${API_URL}/api/calls`;
export const ADD_CALL_LOG_ROUTE = `${CALLS_ROUTE}/add-log`;
export const GET_CALL_LOGS_ROUTE = `${CALLS_ROUTE}/get-logs`;
