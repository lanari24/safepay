import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Input, Button, ButtonGroup } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';
import ApiService from '../services/api';

const PaymentScreen = ({ navigation }) => {
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [contributionType, setContributionType] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState(0);
  const [description, setDescription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [user, setUser] = useState(null);

  const contributionTypes = ['Monthly', 'Quarterly', 'Annual', 'Emergency'];
  const contributionTypeValues = ['monthly', 'quarterly', 'annual', 'emergency'];
  const contributionAmounts = [2000, 6000, 24000, 0]; // Suggested amounts in RWF

  const paymentMethods = ['Mobile Money', 'Bank Card', 'USSD'];
  const paymentMethodValues = ['mobile_money', 'bank_card', 'ussd'];

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    // Auto-fill suggested amount when contribution type changes
    if (contributionAmounts[contributionType] > 0) {
      setAmount(contributionAmounts[contributionType].toString());
    }
  }, [contributionType]);

  const loadUserData = async () => {
    try {
      const response = await ApiService.getProfile();
      setUser(response.user);
      setPhoneNumber(response.user.phoneNumber || '');
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const validateForm = () => {
    const errors = [];

    if (!amount || isNaN(amount) || parseInt(amount) < 100) {
      errors.push('Amount must be at least 100 RWF');
    }

    if (!phoneNumber || !/^\+250\d{9}$/.test(phoneNumber)) {
      errors.push('Please enter a valid Rwanda phone number (+250XXXXXXXXX)');
    }

    if (errors.length > 0) {
      Alert.alert('Validation Error', errors.join('\n'));
      return false;
    }

    return true;
  };

  const processPayment = async () => {
    if (!validateForm()) return;

    const paymentData = {
      amount: parseInt(amount),
      paymentMethod: paymentMethodValues[paymentMethod],
      phoneNumber,
      contributionType: contributionTypeValues[contributionType],
      description: description || `${contributionTypes[contributionType]} Irondo contribution`
    };

    Alert.alert(
      'Confirm Payment',
      `Amount: ${parseInt(amount).toLocaleString()} RWF\nType: ${contributionTypes[contributionType]}\nMethod: ${paymentMethods[paymentMethod]}\nPhone: ${phoneNumber}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: () => submitPayment(paymentData) }
      ]
    );
  };

  const submitPayment = async (paymentData) => {
    try {
      setIsProcessing(true);

      const response = await ApiService.makePayment(paymentData);

      if (paymentData.paymentMethod === 'ussd') {
        // Show USSD instructions
        Alert.alert(
          'USSD Payment',
          `${response.paymentInstructions.message}\n\nReference: ${response.transaction.reference}`,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert(
          'Payment Initiated',
          `${response.message}\n\nReference: ${response.transaction.reference}\n\nYou will receive a confirmation SMS once payment is processed.`,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }

    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert(
        'Payment Failed',
        error.message || 'Failed to process payment. Please try again.',
        [
          { text: 'Retry', onPress: () => submitPayment(paymentData) },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPhoneNumber = (text) => {
    // Auto-format phone number
    let cleaned = text.replace(/\D/g, '');
    
    if (cleaned.startsWith('250')) {
      cleaned = '+' + cleaned;
    } else if (cleaned.startsWith('7') && cleaned.length <= 9) {
      cleaned = '+250' + cleaned;
    }
    
    return cleaned;
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'mobile_money': return 'phone-portrait';
      case 'bank_card': return 'card';
      case 'ussd': return 'keypad';
      default: return 'wallet';
    }
  };

  const getContributionDescription = (type) => {
    switch (type) {
      case 'monthly': return 'Regular monthly contribution for community security';
      case 'quarterly': return 'Quarterly payment (3 months) with discount';
      case 'annual': return 'Annual payment (12 months) with maximum discount';
      case 'emergency': return 'Special contribution for emergency security needs';
      default: return '';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Make Payment</Text>
            <Text style={styles.headerSubtitle}>
              Contribute to community safety
            </Text>
          </View>

          {/* User Info */}
          {user && (
            <Card containerStyle={styles.userCard}>
              <View style={styles.userInfo}>
                <Ionicons name="person-circle" size={40} color="#2E7D32" />
                <View style={styles.userDetails}>
                  <Text style={styles.userName}>{user.firstName} {user.lastName}</Text>
                  <Text style={styles.userLocation}>
                    {user.location?.sector}, {user.location?.district}
                  </Text>
                </View>
              </View>
            </Card>
          )}

          {/* Contribution Type */}
          <Card containerStyle={styles.card}>
            <Text style={styles.cardTitle}>Contribution Type</Text>
            <ButtonGroup
              onPress={setContributionType}
              selectedIndex={contributionType}
              buttons={contributionTypes}
              containerStyle={styles.buttonGroup}
              selectedButtonStyle={styles.selectedButton}
              textStyle={styles.buttonText}
              vertical
            />
            <Text style={styles.contributionDescription}>
              {getContributionDescription(contributionTypeValues[contributionType])}
            </Text>
          </Card>

          {/* Amount */}
          <Card containerStyle={styles.card}>
            <Text style={styles.cardTitle}>Amount (RWF)</Text>
            <Input
              placeholder="Enter amount"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              leftIcon={<Text style={styles.currencySymbol}>RWF</Text>}
              containerStyle={styles.inputContainer}
              inputStyle={styles.amountInput}
            />
            {contributionAmounts[contributionType] > 0 && (
              <Text style={styles.suggestedAmount}>
                Suggested: {contributionAmounts[contributionType].toLocaleString()} RWF
              </Text>
            )}
          </Card>

          {/* Payment Method */}
          <Card containerStyle={styles.card}>
            <Text style={styles.cardTitle}>Payment Method</Text>
            <ButtonGroup
              onPress={setPaymentMethod}
              selectedIndex={paymentMethod}
              buttons={paymentMethods}
              containerStyle={styles.buttonGroup}
              selectedButtonStyle={styles.selectedButton}
              textStyle={styles.buttonText}
            />
          </Card>

          {/* Phone Number */}
          <Card containerStyle={styles.card}>
            <Text style={styles.cardTitle}>Phone Number</Text>
            <Input
              placeholder="+250788123456"
              value={phoneNumber}
              onChangeText={(text) => setPhoneNumber(formatPhoneNumber(text))}
              keyboardType="phone-pad"
              leftIcon={<Ionicons name="call" size={20} color="#666" />}
              containerStyle={styles.inputContainer}
            />
            <Text style={styles.phoneNote}>
              {paymentMethodValues[paymentMethod] === 'mobile_money' 
                ? 'Enter your mobile money number'
                : 'Enter your contact number'
              }
            </Text>
          </Card>

          {/* Description */}
          <Card containerStyle={styles.card}>
            <Text style={styles.cardTitle}>Description (Optional)</Text>
            <Input
              placeholder="Additional notes..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={2}
              maxLength={200}
              containerStyle={styles.inputContainer}
            />
          </Card>

          {/* Payment Summary */}
          <Card containerStyle={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Payment Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Amount:</Text>
              <Text style={styles.summaryValue}>
                {amount ? `${parseInt(amount || 0).toLocaleString()} RWF` : '0 RWF'}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Type:</Text>
              <Text style={styles.summaryValue}>{contributionTypes[contributionType]}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Method:</Text>
              <Text style={styles.summaryValue}>
                <Ionicons 
                  name={getPaymentMethodIcon(paymentMethodValues[paymentMethod])} 
                  size={16} 
                  color="#666" 
                />
                {' '}{paymentMethods[paymentMethod]}
              </Text>
            </View>
          </Card>

          {/* Pay Button */}
          <View style={styles.payButtonContainer}>
            <Button
              title={isProcessing ? 'Processing...' : 'Make Payment'}
              buttonStyle={[styles.payButton, isProcessing && styles.payButtonDisabled]}
              titleStyle={styles.payButtonText}
              onPress={processPayment}
              disabled={isProcessing}
              icon={
                <Ionicons 
                  name={isProcessing ? "hourglass" : "card"} 
                  size={20} 
                  color="#fff" 
                  style={{ marginRight: 8 }} 
                />
              }
            />
          </View>

          {/* Security Note */}
          <Card containerStyle={styles.securityCard}>
            <View style={styles.securityContent}>
              <Ionicons name="shield-checkmark" size={24} color="#4CAF50" />
              <Text style={styles.securityText}>
                Your payment is secure and encrypted. You will receive a confirmation SMS once processed.
              </Text>
            </View>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#C8E6C9',
    marginTop: 4,
  },
  userCard: {
    margin: 20,
    borderRadius: 12,
    elevation: 2,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userDetails: {
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  userLocation: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  card: {
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 12,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  buttonGroup: {
    borderRadius: 8,
    marginBottom: 10,
  },
  selectedButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    fontSize: 14,
  },
  contributionDescription: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 5,
  },
  inputContainer: {
    paddingHorizontal: 0,
  },
  amountInput: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginRight: 8,
  },
  suggestedAmount: {
    fontSize: 12,
    color: '#4CAF50',
    textAlign: 'center',
    marginTop: 5,
  },
  phoneNote: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  summaryCard: {
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 12,
    backgroundColor: '#E8F5E8',
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#1B5E20',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1B5E20',
  },
  payButtonContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  payButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 15,
  },
  payButtonDisabled: {
    backgroundColor: '#C8E6C9',
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  securityCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    backgroundColor: '#F1F8E9',
    elevation: 1,
  },
  securityContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  securityText: {
    flex: 1,
    fontSize: 12,
    color: '#2E7D32',
    marginLeft: 12,
    lineHeight: 16,
  },
});

export default PaymentScreen;
