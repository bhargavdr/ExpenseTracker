import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import { useExpenses } from '../context/ExpensesContext';
import SmsAndroid from 'react-native-get-sms-android';

const HomeScreen = ({ navigation }) => {
  const { expenses, setExpenses } = useExpenses();

  const handleDelete = (index) => {
    const updatedExpenses = expenses.filter((_, idx) => idx !== index);
    setExpenses(updatedExpenses);
  };

  const formatAmount = (amount) => {
    return Math.abs(parseFloat(amount))
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const getTotalCredit = () => {
    return expenses
      .filter((expense) => expense.isCredit)
      .reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
  };

  const getTotalDebit = () => {
    return expenses
      .filter((expense) => !expense.isCredit)
      .reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
  };

  const getTotalBalance = () => {
    return getTotalCredit() + getTotalDebit();
  };

  const requestSMSPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_SMS,
          {
            title: 'SMS Permission',
            message:
              'This app needs access to your SMS to parse transaction data.',
            buttonPositive: 'Allow',
            buttonNegative: 'Deny',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return false;
  };

  const parseTransactionFromSMS = (body) => {
    const amountRegex = /(?:INR|Rs\.?)\s*(\d+(:?\,\d+)*(:?\.\d{2})?)/i;
    const debitRegex = /(?:debited|spent|paid|withdrawn)/i;
    const creditRegex = /(?:credited|received|refund)/i;

    const amountMatch = body.match(amountRegex);
    if (!amountMatch) return null;

    const amount = amountMatch[1].replace(/,/g, '');
    const isCredit = creditRegex.test(body);
    const isDebit = debitRegex.test(body);

    if (!isCredit && !isDebit) return null;

    return {
      amount: isCredit ? parseFloat(amount) : -parseFloat(amount),
      description: 'SMS Transaction',
      date: new Date().toLocaleDateString(),
      isCredit: isCredit,
    };
  };

  const handleSMSImport = async () => {
    const hasPermission = await requestSMSPermission();

    if (!hasPermission) {
      console.warn('SMS permission denied');
      return;
    }

    const filter = {
      box: 'inbox',
      bodyRegex: '(?:credited|debited|spent|received|refund|withdrawn)',
      read: 0,
      indexFrom: 0,
      maxCount: 10,
    };

    SmsAndroid.list(
      JSON.stringify(filter),
      (fail) => {
        console.warn('Failed to get SMS: ', fail);
      },
      (count, smsList) => {
        const parsedSms = JSON.parse(smsList);
        const newTransactions = parsedSms
          .map((sms) => parseTransactionFromSMS(sms.body))
          .filter((transaction) => transaction !== null);

        if (newTransactions.length > 0) {
          setExpenses([...expenses, ...newTransactions]);
        }
      }
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.balanceContainer}>
        <View style={[styles.balanceCard, styles.creditCard]}>
          <Text style={styles.balanceLabel}>Total Credit</Text>
          <Text style={[styles.balanceAmount, styles.creditAmount]}>
            ₹{formatAmount(getTotalCredit())}
          </Text>
        </View>
        <View style={[styles.balanceCard, styles.debitCard]}>
          <Text style={styles.balanceLabel}>Total Debit</Text>
          <Text style={[styles.balanceAmount, styles.debitAmount]}>
            ₹{formatAmount(getTotalDebit())}
          </Text>
        </View>
      </View>

      <View style={styles.netBalanceContainer}>
        <Text style={styles.netBalanceLabel}>Net Balance</Text>
        <Text
          style={[
            styles.netBalanceAmount,
            getTotalBalance() >= 0
              ? styles.positiveBalance
              : styles.negativeBalance,
          ]}
        >
          ₹{formatAmount(getTotalBalance())}
        </Text>
      </View>

      <View style={styles.transactionsContainer}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        <FlatList
          data={expenses}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.expenseItem}>
              <View style={styles.expenseLeft}>
                <View
                  style={[
                    styles.typeIndicator,
                    { backgroundColor: item.isCredit ? '#34D399' : '#F87171' },
                  ]}
                />
                <View>
                  <Text style={styles.description}>{item.description}</Text>
                  <Text style={styles.date}>{item.date}</Text>
                </View>
              </View>
              <View style={styles.expenseRight}>
                <Text
                  style={[
                    styles.amount,
                    { color: item.isCredit ? '#059669' : '#DC2626' },
                  ]}
                >
                  ₹{formatAmount(item.amount)}
                </Text>
                <TouchableOpacity
                  onPress={() => handleDelete(index)}
                  style={styles.deleteButton}
                >
                  <Text style={styles.deleteText}>×</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No transactions yet</Text>
            </View>
          }
        />
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddExpense')}
      >
        <Text style={styles.addButtonText}>+ Add Transaction</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.addButton, styles.smsButton]}
        onPress={handleSMSImport}
      >
        <Text style={styles.addButtonText}>Import from SMS</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  balanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  balanceCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  creditCard: {
    backgroundColor: '#059669',
  },
  debitCard: {
    backgroundColor: '#DC2626',
  },
  balanceLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 8,
    opacity: 0.9,
  },
  balanceAmount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  creditAmount: {
    color: '#FFFFFF',
  },
  debitAmount: {
    color: '#FFFFFF',
  },
  netBalanceContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#1F2937',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
  },
  netBalanceLabel: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 4,
  },
  netBalanceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  positiveBalance: {
    color: '#34D399',
  },
  negativeBalance: {
    color: '#F87171',
  },
  transactionsContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1F2937',
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  expenseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  typeIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 12,
  },
  expenseRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  description: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 12,
  },
  date: {
    fontSize: 14,
    color: '#6B7280',
  },
  deleteButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteText: {
    fontSize: 20,
    color: '#DC2626',
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#2563EB',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  smsButton: {
    backgroundColor: '#4B5563',
    marginTop: 0, 
    marginBottom: 24, 
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 16,
  },
});

export default HomeScreen;
