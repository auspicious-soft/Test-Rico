import VideoPlayer from "@/app/(website)/components/VideoPlayer";
import React from "react";

const page = () => {
  return (
    <>
      <h1 className="font-antic text-[#283C63] text-[30px] leading-[1.2em] mb-[25px] lg:text-[40px] lg:mb-[50px]">
        How to Book a Session
      </h1>
      <div className="flex w-full flex-col items-center gap-4">
        <VideoPlayer url="/tut-btn.mp4" muted={false} controls />
        {/* <p className="font-bold">This is how you book an appointment</p> */}
      </div>
    </>
  );
};

export default page;
