'use client';

import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, BarElement, LinearScale, Title, Tooltip, Legend } from 'chart.js';
import toast from 'react-hot-toast';
import { useCopilotReadable, useCopilotAction } from "@copilotkit/react-core";


Chart.register(CategoryScale, BarElement, LinearScale, Title, Tooltip, Legend);

const SleepTracker = ({ selectedDate, updateOverallScore }) => {
  const [sleepHours, setSleepHours] = useState(0);
  const [sleepGoal, setSleepGoal] = useState(0); // Default sleep goal
  const [cummSleep, setCummSleep] = useState(0);
  const [sleepLogs, setSleepLogs] = useState([]);
  const [goalSet, setGoalSet] = useState(false); // Track if goal is set

  useEffect(() => {
    const storedLogs = JSON.parse(localStorage.getItem(selectedDate.toDateString())) || {};
    setSleepHours(parseInt(storedLogs.sleepHours) || 0);
    setSleepGoal(parseInt(storedLogs.sleepGoal) || 0);
    setSleepLogs(storedLogs.sleepLogs || []);
    setGoalSet(!!storedLogs.sleepGoal); // If goal is set in storage, enable inputs
  }, [selectedDate]);

  useEffect(() => {
    console.log("I am here handling log sleep with sleep hours == ", sleepHours);
    if (sleepHours > 0) {
      const storedLogs = JSON.parse(localStorage.getItem(selectedDate.toDateString())) || {};
      if (storedLogs.sleepHours != sleepHours) {
        handleLogSleep();
      }
    }
  }, [sleepHours])

  useEffect(() => {
    if (sleepGoal > 0) {
      const storedLogs = JSON.parse(localStorage.getItem(selectedDate.toDateString())) || {};
      if (storedLogs.sleepGoal != sleepGoal) {
        handleSetGoal();
      }
      
    }
  }, [sleepGoal])

  useCopilotReadable({
    description: "This is our sleep score for the date",
    value: sleepHours
  })
  useCopilotReadable({
    description: "This is our sleep goal for the date",
    value: sleepGoal
  })

  useCopilotAction({
    name: "setSleepHours",
    description: "updates the current sleep hours",
    parameters: [
        {
            name: "newSleepHours",
            type: "number",
            description: "The current hours of sleep for the given date",
            required: true,
        }
    ],
    handler: async ({ newSleepHours }) => {
        setSleepHours(newSleepHours);
    }
  })

  useCopilotAction({
    name: "setSleepGoal",
    description: "Updates the current sleep goal",
    parameters: [
        {
            name: "newSleepGoal",
            type: "number",
            description: "The current sleep goal for the given date",
            required: true,
        }
    ],
    handler: async ({ newSleepGoal }) => {
      setSleepGoal(newSleepGoal);
    }
  })

  const handleLogSleep = () => {
    const sleepHoursInt = parseInt(sleepHours);
    const sleepGoalInt = parseInt(sleepGoal);

    const newLogs = [...sleepLogs, sleepHoursInt];
    const cummSleep = newLogs.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    const sleepScore = (cummSleep / sleepGoalInt) * 100;
    
    const newData = { 
      sleepHours: sleepHoursInt, 
      sleepGoal: sleepGoalInt, 
      sleepLogs: newLogs, 
      sleepScore: Math.min(Math.round(sleepScore), 100) 
    };

    const storedData = JSON.parse(localStorage.getItem(selectedDate.toDateString())) || {};
    localStorage.setItem(selectedDate.toDateString(), JSON.stringify({ ...storedData, ...newData }));

    setSleepLogs(newLogs);
    updateOverallScore({ sleepScore: newData.sleepScore });
    toast.success("Sleep entry has been recorded!");
  };

  const handleSetGoal = () => {
    const sleepGoalInt = parseInt(sleepGoal);
    const storedData = JSON.parse(localStorage.getItem(selectedDate.toDateString())) || {};
    localStorage.setItem(selectedDate.toDateString(), JSON.stringify({ ...storedData, sleepGoal: sleepGoalInt }));

    setGoalSet(true); // Enable inputs after setting the goal
    toast.success("Sleep goal has been set!"); // Show success toast
  };

  const data = {
    labels: Array.from({ length: sleepLogs.length }, (_, i) => `Entry ${i + 1}`),
    datasets: [
      {
        label: 'Sleep Hours',
        data: sleepLogs,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg text-white">
      <h2 className="text-xl font-bold mb-4">Sleep Tracker</h2>
      <input
        type="number"
        value={sleepHours}
        onChange={(e) => setSleepHours(e.target.value)}
        className="text-gray-900 border p-2 w-full mb-2"
        placeholder="Enter sleep hours"
        disabled={!goalSet} // Disable input if goal is not set
      />
      <button
        onClick={handleLogSleep}
        className="bg-blue-500 text-white p-2 rounded-lg w-full mb-4"
        disabled={!goalSet} // Disable button if goal is not set
      >
        Log Sleep
      </button>
      <input
        type="number"
        value={sleepGoal}
        onChange={(e) => setSleepGoal(e.target.value)}
        className="text-gray-900 border p-2 w-full mb-2"
        placeholder="Set sleep goal"
      />
      <button
        onClick={handleSetGoal}
        className="bg-green-500 text-white p-2 rounded-lg w-full"
      >
        Set Goal
      </button>
      <div className="mt-4">
        <Bar data={data} />
      </div>
    </div>
  );
};

export default SleepTracker;
