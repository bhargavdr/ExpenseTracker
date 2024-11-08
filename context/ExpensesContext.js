import React, { createContext, useState, useContext, useEffect } from 'react';
import { getData, storeData } from '../utils/storage';

const ExpensesContext = createContext();

export const ExpensesProvider = ({ children }) => {
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    const loadExpenses = async () => {
      const savedExpenses = await getData('expenses');
      if (savedExpenses) setExpenses(savedExpenses);
    };
    loadExpenses();
  }, []);

  useEffect(() => {
    storeData('expenses', expenses);
  }, [expenses]);

  return (
    <ExpensesContext.Provider value={{ expenses, setExpenses }}>
      {children}
    </ExpensesContext.Provider>
  );
};

export const useExpenses = () => useContext(ExpensesContext);
