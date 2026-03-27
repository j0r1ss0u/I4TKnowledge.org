// =================================================================================
// 1. IMPORTS
// =================================================================================
import React from "react";
import { useAuth } from '../../AuthContext';
import ui from '../../../translations/ui';

// =================================================================================
// 2. COMPONENT DEFINITION
// =================================================================================
const Piechart = ({ myBalance, totalSupply }) => {
  const { language } = useAuth();
  const commonT = (ui[language] || ui.en).common;
  // -----------------------------------------------------------------------------
  // 2.1 Data Processing
  // -----------------------------------------------------------------------------
  const validMyBalance = Number(myBalance) || 0;
  const validTotalSupply = Number(totalSupply) || 1;
  const percentage = (validMyBalance / validTotalSupply) * 100;

  // -----------------------------------------------------------------------------
  // 2.2 SVG Calculations
  // -----------------------------------------------------------------------------
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const dashArray = (percentage * circumference) / 100;
  const dashOffset = circumference - dashArray;

  // =================================================================================
  // 3. RENDER
  // =================================================================================
  return (
    <div className="relative h-48 w-48 mx-auto">
      {/* SVG Circle */}
      <svg className="w-full h-full transform -rotate-90">
        {/* Background circle */}
        <circle
          cx="96"
          cy="96"
          r={radius}
          stroke="#e5e7eb"
          strokeWidth="12"
          fill="transparent"
        />
        {/* Progress circle */}
        <circle
          cx="96"
          cy="96"
          r={radius}
          stroke="#3b82f6"
          strokeWidth="12"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
        />
      </svg>

      {/* Percentage Display */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <span className="text-2xl font-bold">
            {percentage.toFixed(1)}%
          </span>
          <p className="text-sm text-gray-500">{commonT.networkShare}</p>
        </div>
      </div>
    </div>
  );
};

export default Piechart;