import Dataset from "./dataset";
import "../../globals.css";
import PollDonutSlider from "./PollDonutSlider";
import LeaderboardList from "./LeaderboardList";
import SessionControls from "./SessionControls";
import AvatarRow from "../AvatarRow";
import ImageViewer from "../large/ImageViewer";
import BigScreenLeaderboard from "../large/BigScreenLeaderboard";

export default function MobileAdminDashboard() {



  return (
    <div className="min-h-screen w-full text-black bg-white flex justify-center items-start p-2 overflow-auto">
      <div className="bg-white flex flex-col items-center gap-6 w-full max-w-md rounded-b-md">

        {/* Top Avatars Row */}
        <div className="w-full px-2 overflow-x-auto hide-scrollbar">
          <AvatarRow/>
        </div>

        {/* Manual Image Slider */}
        <div className="w-full px-2">
          <ImageViewer />
        </div>

        {/* Dataset Component */}
        <div className="w-full px-2">
          <Dataset />
        </div>

        {/* Poll Donut Slider */}
        <div className="w-full px-2">
          <PollDonutSlider/>
        </div>

        {/* Session Controls */}
        <div className="w-full px-2 rounded-md">
          <SessionControls/>
        </div>
        {/* Leaderboard */}
        <div className="w-full px-2 mb-6 rounded-md">
          <h2 className="font-semibold text-lg mb-2 mt-4 text-center">🏆 Leaderboard</h2>
          <BigScreenLeaderboard/>
        </div>


      </div>
    </div>
  )
}
