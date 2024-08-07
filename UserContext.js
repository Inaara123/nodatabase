import React, { createContext, useState, useEffect } from 'react';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();
const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [userData, setData] = useState({});

  useEffect(() => {
    // Load initial data from MMKV
    const loadData = () => {
      const dataString = storage.getString('user');
      if (dataString) {
        setData(JSON.parse(dataString));
      }
    };

    loadData();
  }, []);

  const updateUser = (newData) => {
    setData(newData);
    storage.set('user', JSON.stringify(newData));
  };

  return (
    <UserContext.Provider value={{ userData, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};

export {UserProvider, UserContext };