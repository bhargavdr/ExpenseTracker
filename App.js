import React from 'react';
import { ExpensesProvider } from './context/ExpensesContext';
import AppNavigator from './navigation/AppNavigator';

export default function App() {
  return (
    <ExpensesProvider>
        <AppNavigator />
    </ExpensesProvider>
  );
}
