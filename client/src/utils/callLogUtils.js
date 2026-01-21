import { ADD_CALL_LOG_ROUTE } from "@/utils/ApiRoutes";
import axios from "axios";
import { reducerCases } from "@/context/constants";

/**
 * Logs a call to both local state and backend
 * @param {Object} params
 * @param {number} params.userId - Current user's ID
 * @param {number} params.otherUserId - Other user's ID
 * @param {string} params.otherUserName - Other user's name
 * @param {string} params.direction - "outgoing" or "incoming"
 * @param {string} params.callType - "voice" or "video"
 * @param {string} params.status - "ended" | "rejected" | "missed" | "answered"
 * @param {Function} params.dispatch - Redux dispatch function
 */
export const logCall = async ({
  userId,
  otherUserId,
  otherUserName,
  direction,
  callType,
  status,
  dispatch,
}) => {
  if (!userId || !otherUserId || !otherUserName) {
    console.error("[logCall] Missing required parameters");
    return;
  }

  const log = {
    id: Date.now(),
    withUserId: otherUserId,
    withUserName: otherUserName,
    direction,
    callType,
    status,
    createdAt: new Date().toISOString(),
  };

  dispatch({
    type: reducerCases.ADD_CALL_LOG,
    callLog: log,
  });

  try {
    const payload = {
      callerId: direction === "outgoing" ? userId : otherUserId,
      calleeId: direction === "outgoing" ? otherUserId : userId,
      direction,
      callType,
      status,
      createdAt: log.createdAt,
    };
    console.log("[logCall] Saving call log to backend:", payload);
    const response = await axios.post(ADD_CALL_LOG_ROUTE, payload);
    console.log("[logCall] Call log saved to backend:", response.data);
  } catch (err) {
    console.error("[logCall] Failed to persist call log:", err.response?.data || err.message);
    console.error("[logCall] Full error:", err);
  }
};
