import CircularAvatar from "./circularAvatar";
import Dataset from "./dataset";
import ImageSlider from "./ImageSlider";
import "../../globals.css";
import PollDonutSlider from "./PollDonutSlider";
import LeaderboardList from "./LeaderboardList";
import SessionControls from "./SessionControls";
import AvatarRow from "../AvatarRow";

export default function MobileAdminDashboard() {

  const leaderboardData = [
    { roll: "21CS001", marks: 98, time: "10:02" },
    { roll: "21CS023", marks: 95, time: "10:45" },
    { roll: "21CS017", marks: 90, time: "11:12" },
    { roll: "21CS011", marks: 88, time: "11:30" },
    { roll: "21CS027", marks: 85, time: "12:10" },
    { roll: "21CS030", marks: 82, time: "12:40" },
  ];


  return (
    <div className="min-h-screen w-full text-black bg-white flex justify-center items-start p-2 overflow-auto">
      <div className="bg-white flex flex-col items-center gap-6 w-full max-w-md rounded-b-md">

        {/* Top Avatars Row */}
        <div className="w-full px-2 overflow-x-auto hide-scrollbar">
          <AvatarRow/>
        </div>

        {/* Manual Image Slider */}
        <div className="w-full px-2">
          <ImageSlider />
        </div>

        {/* Dataset Component */}
        <div className="w-full px-2">
          <Dataset />
        </div>

        {/* Poll Donut Slider */}
        <div className="w-full px-2">
          <PollDonutSlider/>
        </div>

        {/* Leaderboard */}
        <div className="w-full px-2 mb-6 rounded-md">
          <LeaderboardList/>
        </div>

        {/* Session Controls */}
        <div className="w-full px-2 rounded-md">
          <SessionControls/>
        </div>

      </div>
    </div>
  )
}
