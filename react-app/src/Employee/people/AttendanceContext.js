import React, { createContext, useState, useEffect } from "react";

export const AttendanceContext = createContext();

export const AttendanceProvider = ({ children }) => {
  // store check-in timestamp and running state
  const [checkInTime, setCheckInTime] = useState(null); // timestamp in ms
  const [isRunning, setIsRunning] = useState(false);

  // store total elapsed seconds if user has checked out
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Update timer every second
  useEffect(() => {
    let timer;
    if (isRunning && checkInTime) {
      timer = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - checkInTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, checkInTime]);

  // Start check-in
  const startCheckIn = () => {
    const now = Date.now();
    setCheckInTime(now);
    setIsRunning(true);
  };

  // Stop check-out
  const checkOut = () => {
    setIsRunning(false);
    // final elapsed time
    if (checkInTime) {
      setElapsedSeconds(Math.floor((Date.now() - checkInTime) / 1000));
    }
    setCheckInTime(null);
  };

  return (
    <AttendanceContext.Provider value={{
      checkInTime,
      isRunning,
      elapsedSeconds,
      startCheckIn,
      checkOut
    }}>
      {children}
    </AttendanceContext.Provider>
  );
};
