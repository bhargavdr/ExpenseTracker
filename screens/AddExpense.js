import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useExpenses } from '../context/ExpensesContext';

const AddExpense = ({ navigation }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isCredit, setIsCredit] = useState(false);
  const { expenses, setExpenses } = useExpenses();

  const handleAddExpense = () => {
    if (!amount || !description) {
      Alert.alert('Invalid Input', 'Please fill in all fields');
      return;
    }

    const newExpense = {
      amount: isCredit ? parseFloat(amount) : -parseFloat(amount),
      description,
      date,
      isCredit,
    };

    setExpenses([...expenses, newExpense]);
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Text style={styles.title}>Add New Transaction</Text>

      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            isCredit ? styles.activeCredit : styles.inactive,
          ]}
          onPress={() => setIsCredit(true)}
        >
          <Text
            style={[
              styles.toggleText,
              isCredit ? styles.activeText : styles.inactiveText,
            ]}
          >
            Credit
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            !isCredit ? styles.activeDebit : styles.inactive,
          ]}
          onPress={() => setIsCredit(false)}
        >
          <Text
            style={[
              styles.toggleText,
              !isCredit ? styles.activeText : styles.inactiveText,
            ]}
          >
            Debit
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Amount</Text>
        <TextInput
          style={styles.input}
          placeholder="0.00"
          keyboardType="numeric"
          onChangeText={setAmount}
          value={amount}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={styles.input}
          placeholder="What's this for?"
          onChangeText={setDescription}
          value={description}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Date</Text>
        <TextInput
          style={styles.input}
          placeholder="DD/MM/YYYY"
          onChangeText={setDate}
          value={date}
        />
      </View>

      <TouchableOpacity
        style={[
          styles.addButton,
          (!amount || !description) && styles.disabledButton,
        ]}
        onPress={handleAddExpense}
      >
        <Text style={styles.addButtonText}>Add Transaction</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#1F2937',
    textAlign: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeCredit: {
    backgroundColor: '#34D399',
  },
  activeDebit: {
    backgroundColor: '#F87171',
  },
  inactive: {
    backgroundColor: 'transparent',
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '500',
  },
  activeText: {
    color: '#FFFFFF',
  },
  inactiveText: {
    color: '#6B7280',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
  addButton: {
    backgroundColor: '#2563EB',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  disabledButton: {
    backgroundColor: '#93C5FD',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddExpense;
