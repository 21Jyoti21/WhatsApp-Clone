import React from "react";
import Image from "next/image";
function Empty() {
  return <div className="w-full
        h-screen
        bg-conversation-panel-background 
        flex
        items-center
        justify-center">
    <Image src="/whatsapp.png" alt="whatsapp" height={500} width={500} priority/>
  </div>;
}
export default Empty;