import Dataset from "../small/dataset";
import PollDonutSlider from "../small/PollDonutSlider";
import BigScreenLeaderboard from "./BigScreenLeaderboard";
import "../../globals.css";
import ImageViewer from "./ImageViewer";
import AvatarRow from "../AvatarRow";
import SessionControls from "../small/SessionControls";


export default function BigScreenDashboard() {

  return (
    <div className="min-h-screen w-full">
      <div className="w-full p-3 overflow-x-auto hide-scrollbar">
        <AvatarRow />
      </div>

      <div className="bg-gray-100 w-full h-full flex flex-row gap-4 p-4 box-border overflow-hidden">

        {/* LEFT SIDEBAR: Leaderboard */}
        <div className="w-64 flex-shrink-0 rounded-md p-2 overflow-y-auto bg-white text-black">
          <h2 className="font-semibold text-lg mb-2 mt-4 text-center">🏆 Leaderboard</h2>
          <BigScreenLeaderboard />
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          {/* Top Section: Image + Dataset */}
          <div className="flex gap-4">
            <div className="flex-1 bg-white rounded-md p-2 overflow-hidden h-[calc(100vh-100px)]">
              <ImageViewer />
            </div>
          </div>





          {/* Bottom Green Section: Questions & Polls */}
          <div className="flex-1 rounded-md p-4 overflow-auto text-black">

            <Dataset />

          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="flex flex-col gap-4 w-64 flex-shrink-0">

          {/* Top: Poll Charts */}
          <div className="flex-1 rounded-md p-2 overflow-auto hide-scrollbar">
            <PollDonutSlider />
          </div>


          {/* Bottom: Session Settings */}
          <div className="flex-1 rounded-md p-2 overflow-auto">
            <SessionControls/>
          </div>

        </div>
      </div>
    </div>
  );
}
