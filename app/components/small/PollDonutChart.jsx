"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28EFF", "#FF6EB4"];

export default function PollDonutChart({ pollData = [] }) {
  const totalVotes = pollData.reduce((sum, entry) => sum + (entry.votes || 0), 0);

  if (totalVotes === 0) {
    return <div className="text-center text-black">No votes yet</div>;
  }

  const dataWithPercentages = pollData.map((entry) => ({
    ...entry,
    percentage: ((entry.votes / totalVotes) * 100).toFixed(1),
  }));

  return (
    <div className=" text-black w-full h-72 flex flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={dataWithPercentages}
            dataKey="votes"
            nameKey="option"
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={90}
            paddingAngle={2}
            label={({ option, percentage }) => `${option} (${percentage}%)`}
            labelLine={false}
          >
            {dataWithPercentages.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value, name) => [`${value} votes`, name]} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
