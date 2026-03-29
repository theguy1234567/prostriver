import { createContext, useContext, useState } from "react";

const AnalyticsContext = createContext();

export  const AnalyticsProvider = ({ children }) => {
  const [analytics, setAnalytics] = useState(null);

  return (
    <AnalyticsContext.Provider value={{ analytics, setAnalytics }}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => useContext(AnalyticsContext);
