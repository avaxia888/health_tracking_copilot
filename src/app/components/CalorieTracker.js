'use client';

import React, { useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import toast from 'react-hot-toast';
import { useCopilotReadable, useCopilotAction } from "@copilotkit/react-core";

Chart.register(ArcElement, Tooltip, Legend);

const CalorieTracker = ({ selectedDate, updateOverallScore }) => {
  const [protein, setProtein] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [fats, setFats] = useState(0);
  const [calorieGoal, setCalorieGoal] = useState(0); // Default calorie goal
  const [goalSet, setGoalSet] = useState(false); // Track if goal is set

  const totalCalories = parseInt(protein) * 4 + parseInt(carbs) * 4 + parseInt(fats) * 9;

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem(selectedDate.toDateString())) || {};
    setProtein(parseInt(storedData.protein) || 0);
    setCarbs(parseInt(storedData.carbs) || 0);
    setFats(parseInt(storedData.fats) || 0);
    setCalorieGoal(parseInt(storedData.calorieGoal) || 0);
    setGoalSet(!!storedData.calorieGoal); // If goal is set in storage, enable inputs
  }, [selectedDate]);


  useEffect(() => {
    if (protein > 0 || carbs > 0 || fats > 0) {
      // Problematic Condition, if the users give same number, need to modify logic later, okay to demo
      const storedData = JSON.parse(localStorage.getItem(selectedDate.toDateString())) || {};
      if (parseInt(storedData.protein) != protein || parseInt(storedData.carbs) != carbs || parseInt(storedData.fats) != fats) {
        handleLogCalories();
      }
    }
  }, [protein, carbs, fats])

  useEffect(() => {
    if (calorieGoal > 0) {
      const storedLogs = JSON.parse(localStorage.getItem(selectedDate.toDateString())) || {};
      if (storedLogs.calorieGoal != calorieGoal) {
        handleSetGoal();
      }
      
    }
  }, [calorieGoal])

  useCopilotReadable({
    description: "This is our current protein intake",
    value: protein
  })
  useCopilotReadable({
    description: "This is our current carbs intake",
    value: carbs
  })
  useCopilotReadable({
    description: "This is our current fats intake",
    value: fats
  })
  useCopilotReadable({
    description: "This is our current calorie goal",
    value: calorieGoal
  })

  useCopilotAction({
    name: "setProtein",
    description: "updates the our current protein intake",
    parameters: [
    {
        name: "newProteinIntake",
        type: "number",
        description: "The current protein intake for the given date",
        required: true,
    }
    ],
    handler: async ({ newProteinIntake }) => {
      setProtein(newProteinIntake);
    }
  })

  useCopilotAction({
    name: "setCarbs",
    description: "Updates our current carbs intake",
    parameters: [
    {
        name: "newCarbsIntake",
        type: "number",
        description: "The current carbs intake for the given date",
        required: true,
    }
    ],
    handler: async ({ newCarbsIntake }) => {
      setCarbs(newCarbsIntake);
    }
  })

  useCopilotAction({
    name: "setFats",
    description: "Updates our current fats intake",
    parameters: [
    {
        name: "newFatsIntake",
        type: "number",
        description: "The current fats intake for the given date",
        required: true,
    }
    ],
    handler: async ({ newFatsIntake }) => {
      setFats(newFatsIntake);
    }
  })

  useCopilotAction({
    name: "setCalorieGoal",
    description: "Updates our current calorie goal",
    parameters: [
    {
        name: "newCalorieGoal",
        type: "number",
        description: "The current calorie goal for the given date",
        required: true,
    }
    ],
    handler: async ({ newCalorieGoal }) => {
      setCalorieGoal(newCalorieGoal);
    }
  })

  const handleLogCalories = () => {
    const calorieScore = (totalCalories / parseInt(calorieGoal)) * 100;
    const newData = { 
      protein: parseInt(protein), 
      carbs: parseInt(carbs), 
      fats: parseInt(fats), 
      calorieGoal: parseInt(calorieGoal), 
      calorieScore: Math.min(Math.round(calorieScore), 100) 
    };

    const storedData = JSON.parse(localStorage.getItem(selectedDate.toDateString())) || {};
    localStorage.setItem(selectedDate.toDateString(), JSON.stringify({ ...storedData, ...newData }));

    updateOverallScore({ calorieScore: newData.calorieScore });
    toast.success("Calorie intake entry has been recorded!");
  };

  const handleSetGoal = () => {
    const storedData = JSON.parse(localStorage.getItem(selectedDate.toDateString())) || {};
    localStorage.setItem(selectedDate.toDateString(), JSON.stringify({ ...storedData, calorieGoal: parseInt(calorieGoal) }));

    setGoalSet(true); // Enable inputs after setting the goal
    toast.success("Calorie goal has been set!"); // Show success toast
  };

  const data = {
    labels: ['Protein', 'Carbs', 'Fats'],
    datasets: [
      {
        data: [parseInt(protein) * 4, parseInt(carbs) * 4, parseInt(fats) * 9],
        backgroundColor: ['#ff6384', '#36a2eb', '#ffce56'],
        hoverBackgroundColor: ['#ff4f61', '#2c90d9', '#ffba45'],
      },
    ],
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg text-white">
      <h2 className="text-xl font-bold mb-4">Calorie Tracker</h2>
      <div className="grid grid-cols-3 gap-4 mb-2">
        <input
          type="number"
          value={protein}
          onChange={(e) => setProtein(e.target.value)}
          className="text-gray-900 border p-2"
          placeholder="Protein"
          disabled={!goalSet} // Disable input if goal is not set
        />
        <input
          type="number"
          value={carbs}
          onChange={(e) => setCarbs(e.target.value)}
          className="text-gray-900 border p-2"
          placeholder="Carbs"
          disabled={!goalSet} // Disable input if goal is not set
        />
        <input
          type="number"
          value={fats}
          onChange={(e) => setFats(e.target.value)}
          className="text-gray-900 border p-2"
          placeholder="Fats"
          disabled={!goalSet} // Disable input if goal is not set
        />
      </div>
      <button
        onClick={handleLogCalories}
        className="bg-blue-500 text-white p-2 rounded-lg w-full mb-4"
        disabled={!goalSet} // Disable button if goal is not set
      >
        Log Calories
      </button>
      <input
        type="number"
        value={calorieGoal}
        onChange={(e) => setCalorieGoal(e.target.value)}
        className="text-gray-900 border p-2 w-full mb-2"
        placeholder="Set calorie goal"
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

export default CalorieTracker;
