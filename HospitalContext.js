import React, { createContext, useState, useEffect } from 'react';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();
const HospitalContext = createContext();

const HospitalProvider = ({ children }) => {
  const [hospitalData, setHospitalData] = useState({});

  useEffect(() => {
    // Load initial data from MMKV
    const loadData = () => {
      const dataString = storage.getString('hospital');
      if (dataString) {
        setHospitalData(JSON.parse(dataString));
      }
    };

    loadData();
  }, []);

  const updateHospitalData = (newData) => {
    setHospitalData(newData);
    storage.set('hospital', JSON.stringify(newData));
  };

  return (
    <HospitalContext.Provider value={{ hospitalData, updateHospitalData }}>
      {children}
    </HospitalContext.Provider>
  );
};

export { HospitalProvider, HospitalContext };
