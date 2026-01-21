import React, { useEffect } from "react";
import { useStateProvider } from "@/context/StateContext";
import { calculateTime } from "@/utils/CalculateTime";
import { LuPhoneCall } from "react-icons/lu";
import { MdVideocam } from "react-icons/md";

function CallLogs() {
  const [{ callLogs }] = useStateProvider();

  if (!callLogs || callLogs.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-secondary text-sm">
        No call logs yet
      </div>
    );
  }
  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      {callLogs.map((log) => {
        const Icon = log.callType === "video" ? MdVideocam : LuPhoneCall;
        const statusColor =
          log.status === "missed"
            ? "text-red-400"
            : log.status === "rejected"
            ? "text-yellow-300"
            : "text-icon-green";

        return (
          <div
            key={log.id}
            className="flex items-center justify-between px-4 py-3 hover:bg-background-default-hover cursor-pointer border-b border-conversation-border"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-panel-header-background flex items-center justify-center">
                <Icon className="text-panel-header-icon" />
              </div>
              <div className="flex flex-col">
                <span className="text-primary-strong text-sm font-medium">
                  {log.withUserName || "Unknown"}
                </span>
                <span className={`text-xs ${statusColor}`}>
                  {log.direction === "outgoing" ? "Outgoing" : "Incoming"} •{" "}
                  {log.status || "ended"}
                </span>
              </div>
            </div>
            <div className="text-xs text-secondary">
              {log.createdAt ? calculateTime(log.createdAt) : ""}
            </div>
          </div>
        );
      })}
    </div>
  );
}
export default CallLogs;