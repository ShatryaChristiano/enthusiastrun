import React from "react";

export default function FlagOffItem({flagType="5k",flagOffTime= "05:30", cutOffTime= "01:30:00"} : {flagType?: string, flagOffTime?: string, cutOffTime?: string}) {
  return (
    <div className="bg-[#45AF89] rounded-lg w-[95%] relative border-4 border-white flex justify-between items-center p-8 gap-4 font-body">
      <div className="bg-[#F6DB73] text-xl sm:text-2xl text-background font-bold border-4 border-white px-4 py-2 absolute -top-[2.25rem] left-[2.5%]">{flagType}</div>
      <div className="flex flex-col gap text-xl sm:text-2xl">
        <h1>FLAG OFF</h1>
        <h1>{flagOffTime}</h1>
      </div>
      <div className="flex flex-col gap text-xl sm:text-2xl">
        <h1>CUT OFF</h1>
        <h1>{cutOffTime}</h1>
      </div>
    </div>
  );
}
