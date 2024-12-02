'use client';

import React, { useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import toast from 'react-hot-toast';
import { useCopilotReadable, useCopilotAction } from "@copilotkit/react-core";


Chart.register(ArcElement, Tooltip, Legend);

const WaterTracker = ({ selectedDate, updateOverallScore }) => {
  const [waterIntake, setWaterIntake] = useState(0);
  const [waterGoal, setWaterGoal] = useState(0); // Default goal: 1 gallon = 128 oz
  const [goalSet, setGoalSet] = useState(false); // Track if goal is set

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem(selectedDate.toDateString())) || {};
    setWaterIntake(parseInt(storedData.waterIntake) || 0);
    setWaterGoal(parseInt(storedData.waterGoal) || 0);
    setGoalSet(!!storedData.waterGoal); // If goal is set in storage, enable inputs
  }, [selectedDate]);

  useEffect(() => {
    if (waterIntake > 0) {
      const storedLogs = JSON.parse(localStorage.getItem(selectedDate.toDateString())) || {};
      if (storedLogs.waterIntake != waterIntake) {
        handleLogWater();
      }
    }
  }, [waterIntake])

  useEffect(() => {
    if (waterGoal > 0) {
      const storedLogs = JSON.parse(localStorage.getItem(selectedDate.toDateString())) || {};
      if (storedLogs.waterGoal != waterGoal) {
        handleSetGoal();
      }
      
    }
  }, [waterGoal])

  useCopilotReadable({
    description: "This is our water current intake for the date",
    value: waterIntake
  })
  useCopilotReadable({
    description: "This is our water goal for the date",
    value: waterGoal
  })

  useCopilotAction({
    name: "setWaterIntake",
    description: "updates the current water intake",
    parameters: [
      {
          name: "newWaterIntake",
          type: "number",
          description: "The current water intake for the given date",
          required: true,
      }
    ],
    handler: async ({ newWaterIntake }) => {
      setWaterIntake(newWaterIntake);
    }
  })

  useCopilotAction({
    name: "setWaterIntakeGoal",
    description: "Updates the current water intake goal",
    parameters: [
        {
            name: "newWaterIntakeGoal",
            type: "number",
            description: "The current water intake goal for the given date",
            required: true,
        }
    ],
    handler: async ({ newWaterIntakeGoal }) => {
      setWaterGoal(newWaterIntakeGoal);
    }
  })

  const handleLogWater = () => {
    const waterIntakeInt = parseInt(waterIntake);
    const waterGoalInt = parseInt(waterGoal);

    const waterScore = (waterIntakeInt / waterGoalInt) * 100;

    const newData = { 
      waterIntake: waterIntakeInt, 
      waterGoal: waterGoalInt, 
      waterScore: Math.min(Math.round(waterScore), 100) 
    };

    const storedData = JSON.parse(localStorage.getItem(selectedDate.toDateString())) || {};
    localStorage.setItem(selectedDate.toDateString(), JSON.stringify({ ...storedData, ...newData }));

    updateOverallScore({ waterScore: newData.waterScore });
    toast.success("Water intake entry has been recorded!");
  };

  const handleSetGoal = () => {
    const storedData = JSON.parse(localStorage.getItem(selectedDate.toDateString())) || {};
    localStorage.setItem(selectedDate.toDateString(), JSON.stringify({ ...storedData, waterGoal: parseInt(waterGoal) }));

    setGoalSet(true); // Enable inputs after setting the goal
    toast.success("Water goal has been set!"); // Show success toast
  };

  const data = {
    labels: ['Water Consumed', 'Remaining'],
    datasets: [
      {
        data: [waterIntake, Math.max( waterGoal - waterIntake, 0)],
        backgroundColor: ['#3b82f6', '#e5e7eb'],
        hoverBackgroundColor: ['#1e40af', '#d1d5db'],
      },
    ],
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg text-white">
      <h2 className="text-xl font-bold mb-4">Water Intake Tracker</h2>
      <input
        type="number"
        value={waterIntake}
        onChange={(e) => setWaterIntake(e.target.value)}
        className="text-gray-900 border p-2 w-full mb-2"
        placeholder="Enter water intake (oz)"
        disabled={!goalSet} // Disable input if goal is not set
      />
      <button
        onClick={handleLogWater}
        className="bg-blue-500 text-white p-2 rounded-lg w-full mb-4"
        disabled={!goalSet} // Disable button if goal is not set
      >
        Log Water Intake
      </button>
      <input
        type="number"
        value={waterGoal}
        onChange={(e) => setWaterGoal(e.target.value)}
        className="text-gray-900 border p-2 w-full mb-2"
        placeholder="Set water goal (oz)"
      />
      <button
        onClick={handleSetGoal}
        className="bg-green-500 text-white p-2 rounded-lg w-full"
      >
        Set Goal
      </button>
      <div className="mt-4">
        <Doughnut data={data} />
      </div>
    </div>
  );
};

export default WaterTracker;
