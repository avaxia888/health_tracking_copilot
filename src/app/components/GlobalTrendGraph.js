'use client';

import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { useCopilotReadable, useCopilotAction } from "@copilotkit/react-core";

Chart.register(LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend);

const GlobalTrendGraph = ({ startDate, endDate }) => {
  const [trendData, setTrendData] = useState([]);

  useEffect(() => {
    const getTrendData = () => {
      const data = [];
      const current = new Date(startDate);
      while (current <= endDate) {
        const dateKey = current.toDateString();
        const entry = JSON.parse(localStorage.getItem(dateKey)) || {};
        const totalScore = entry.overallScore || 0;
        data.push({
          date: dateKey,
          overallScore: totalScore,
          sleepScore: entry.sleepScore || 0,
          waterScore: entry.waterScore || 0,
          calorieScore: entry.calorieScore || 0,
        });
        current.setDate(current.getDate() + 1);
      }
      setTrendData(data);
    };

    if (startDate && endDate) {
      getTrendData();
    }
  }, [startDate, endDate]);

  useCopilotReadable({
    description: "Current trend data of our overall fitness status over a date range",
    value: trendData,
  })

  const labels = trendData.map((d) => d.date);
  const scores = trendData.map((d) => d.overallScore);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Overall Progress',
        data: scores,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderWidth: 2,
        fill: true,
      },
    ],
  };

  const options = {
    plugins: {
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            const index = tooltipItem.dataIndex;
            const entry = trendData[index];
            return [
              `Overall Score: ${entry.overallScore}%`,
              `Sleep Score: ${entry.sleepScore}%`,
              `Water Score: ${entry.waterScore}%`,
              `Calorie Score: ${entry.calorieScore}%`,
            ];
          },
        },
      },
    },
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg text-white">
      <h2 className="text-xl font-bold mb-4">Global Trend</h2>
      {trendData.length > 0 ? (
        <Line data={chartData} options={options} />
      ) : (
        <p>No data for selected range</p>
      )}
    </div>
  );
};

export default GlobalTrendGraph;
