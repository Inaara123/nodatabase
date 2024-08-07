import React, { createContext, useState, useEffect } from 'react';
import { MMKV } from 'react-native-mmkv';

const storageReal = new MMKV();
const RealTimeContext = createContext();

const RealDataProvider = ({ children }) => {
  const [realData, setRealData] = useState({});

  useEffect(() => {
    // Load initial data from MMKV
    const loadData = () => {
      const dataString = storageReal.getString('real');
      if (dataString) {
        setRealData(JSON.parse(dataString));
      }
    };

    loadData();
  }, []);

  const updateRealData = (newData) => {
    setRealData(newData);
    storageReal.set('real', JSON.stringify(newData));
  };

  return (
    <RealTimeContext.Provider value={{ realData, updateRealData }}>
      {children}
    </RealTimeContext.Provider>
  );
};

export { RealDataProvider, RealTimeContext };
