import React, { createContext, useState, useEffect } from 'react';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();
const DataContext = createContext();

const DataProvider = ({ children }) => {
  const [data, setData] = useState({});

  useEffect(() => {
    // Load initial data from MMKV
    const loadData = () => {
      const dataString = storage.getString('master');
      if (dataString) {
        setData(JSON.parse(dataString));
      }
    };

    loadData();
  }, []);

  const updateData = (newData) => {
    setData(newData);
    storage.set('master', JSON.stringify(newData));
  };

  return (
    <DataContext.Provider value={{ data, updateData }}>
      {children}
    </DataContext.Provider>
  );
};

export { DataProvider, DataContext };
