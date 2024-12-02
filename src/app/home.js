'use client';

import React, { useState, useEffect } from 'react';
import SleepTracker from './components/SleepTracker';
import WaterTracker from './components/WaterTracker';
import CalorieTracker from './components/CalorieTracker';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import GlobalTrendGraph from './components/GlobalTrendGraph';
import toast, { Toaster } from 'react-hot-toast'; // For toast notifications
import { useCopilotReadable, useCopilotAction } from "@copilotkit/react-core";
import { useCopilotChatSuggestions } from "@copilotkit/react-ui";

const HomePage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [scores, setScores] = useState({
    sleepScore: 0,
    waterScore: 0,
    calorieScore: 0,
    overallScore: 0,
  });
  const [startDate, setStartDate] = useState(new Date())
  const [endDate, setEndDate] = useState(new Date())

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem(selectedDate.toDateString())) || {};
    setScores({
      sleepScore: storedData.sleepScore || 0,
      waterScore: storedData.waterScore || 0,
      calorieScore: storedData.calorieScore || 0,
      overallScore: storedData.overallScore || 0,
    });
  }, [selectedDate]);


  const dateReadable = useCopilotReadable({
    description: "This is the current date for which the user is tracking their fitness stats",
    value: selectedDate.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })
  })
  useCopilotReadable({
    description: "Current scores for each of our trackers: sleep, water, calories, and overall score",
    value: scores,
    parentId: dateReadable
  })

  useCopilotReadable({
    description: "The start date for overall global trend tracker",
    value: startDate ? startDate.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }) : 'Not set',
  })

  useCopilotReadable({
    description: "The end date for overall global trend tracker",
    value: endDate ? endDate.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }) : 'Not set',
  })

  useCopilotAction({
    name: "selectedDate",
    description: "updates the current date to the user specified date in PST time zone",
    parameters: [
        {
            name: "date",
            type: "string",
            description: "The current tracking date, in PST time zone",
            required: true,
        }
    ],
    handler: ({ date }) => {
        setSelectedDate(new Date(date));
        return "Date updated successfully"
    }
  })

  useCopilotAction({
    name: "updateStartEndGlobalDate",
    description: "updates the start and end date to the user specified date range in PST time zone",
    parameters: [
        {
            name: "startDate",
            type: "string",
            description: "The global trend start date in PST time zone (or 'clear' to reset)",
            required: true,
        },
        {
            name: "endDate",
            type: "string",
            description: "The global trend end date in PST time zone (or 'clear' to reset)",
            required: true,
        }
    ],
    handler: ({ startDate, endDate }) => {
        if (startDate.toLowerCase() === 'clear' || endDate.toLowerCase() === 'clear') {
            setStartDate(null);
            setEndDate(null);
            return "Global trend date range cleared"
        } else {
            setStartDate(new Date(startDate));
            setEndDate(new Date(endDate));
            return "Global trend date range updated successfully"
        }
    }
  })
 
  useCopilotChatSuggestions({
    instructions: `Suggest the top 3 most relevant actions user can take and ask the user if they want to proceed.`,
    minSuggestions: 3, 
  });

  // Ensure we always get valid scores (parseInt) and prevent any overwriting of scores
  const calculateOverallScore = (sleepScore, waterScore, calorieScore) => {
    const validSleepScore = parseInt(sleepScore) || 0;
    const validWaterScore = parseInt(waterScore) || 0;
    const validCalorieScore = parseInt(calorieScore) || 0;

    console.log(validSleepScore, validWaterScore, validCalorieScore); // Debugging
    const overall = Math.round((validSleepScore + validWaterScore + validCalorieScore) / 3);
    return overall;
  };

  const updateOverallScore = (newScores) => {
    const updatedScores = {
      sleepScore: newScores.sleepScore !== undefined ? newScores.sleepScore : scores.sleepScore,
      waterScore: newScores.waterScore !== undefined ? newScores.waterScore : scores.waterScore,
      calorieScore: newScores.calorieScore !== undefined ? newScores.calorieScore : scores.calorieScore,
    };

    const overallScore = calculateOverallScore(
      updatedScores.sleepScore,
      updatedScores.waterScore,
      updatedScores.calorieScore
    );

    const finalScores = { ...updatedScores, overallScore };
    setScores(finalScores);

    // Save scores to LocalStorage
    const storedData = JSON.parse(localStorage.getItem(selectedDate.toDateString())) || {};
    localStorage.setItem(selectedDate.toDateString(), JSON.stringify({ ...storedData, ...finalScores }));
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6 text-white">
      <h1 className="text-4xl font-bold mb-6 text-center">Health Copilot</h1>

      <div className="mb-4 text-center">
        <h2 className="text-xl font-semibold mb-2">Select Date to Log Activities</h2>
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          className="text-gray-900 p-2 rounded"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SleepTracker selectedDate={selectedDate} updateOverallScore={updateOverallScore} />
        <WaterTracker selectedDate={selectedDate} updateOverallScore={updateOverallScore} />
        <CalorieTracker selectedDate={selectedDate} updateOverallScore={updateOverallScore} />
      </div>

      <div className="text-center mt-6">
        <h2 className="text-2xl font-bold">Overall Score</h2>
        <p className="text-lg">{scores.overallScore}%</p>
      </div>

      <div className="text-center mt-6">
        <h2 className="text-xl font-semibold mb-2">Select Date Range for Trend</h2>
        <DatePicker
          selectsRange={true}
          startDate={startDate}
          endDate={endDate}
          onChange={(update) => {
            const [newStartDate, newEndDate] = update;
            setStartDate(newStartDate);
            setEndDate(newEndDate);
          }}
          isClearable={true}
          className="text-gray-900 p-2 rounded mb-4"
        />
        <GlobalTrendGraph startDate={startDate} endDate={endDate} />
      </div>

      <Toaster /> {/* Add Toaster for notifications */}
    </div>
  );
}

export default HomePage;