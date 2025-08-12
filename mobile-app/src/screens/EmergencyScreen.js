import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Vibration,
  Animated,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button, Input, ButtonGroup } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';
import ApiService from '../services/api';
import LocationService from '../services/locationService';

const { width, height } = Dimensions.get('window');

const EmergencyScreen = ({ navigation }) => {
  const [emergencyType, setEmergencyType] = useState(0);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(null);
  const [isTriggering, setIsTriggering] = useState(false);
  const [pulseAnim] = useState(new Animated.Value(1));
  const [alerts, setAlerts] = useState([]);

  const emergencyTypes = ['Security', 'Medical', 'Fire', 'General'];
  const emergencyTypeValues = ['security', 'medical', 'fire', 'general'];

  useEffect(() => {
    getCurrentLocation();
    loadEmergencyAlerts();
    startPulseAnimation();
  }, []);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const getCurrentLocation = async () => {
    try {
      const currentLocation = await LocationService.getEmergencyLocation();
      setLocation(currentLocation);
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert(
        'Location Error',
        'Unable to get your current location. Emergency services may not be able to locate you accurately.',
        [
          { text: 'Try Again', onPress: getCurrentLocation },
          { text: 'Continue Anyway', style: 'cancel' }
        ]
      );
    }
  };

  const loadEmergencyAlerts = async () => {
    try {
      const response = await ApiService.getEmergencyAlerts();
      setAlerts(response.alerts || []);
    } catch (error) {
      console.error('Error loading emergency alerts:', error);
    }
  };

  const triggerSOS = async () => {
    if (!location) {
      Alert.alert('Location Required', 'Please enable location services to trigger SOS');
      return;
    }

    Alert.alert(
      '🚨 EMERGENCY SOS',
      `Are you sure you want to trigger a ${emergencyTypes[emergencyType].toLowerCase()} emergency alert?\n\nThis will:\n• Notify nearby security agents\n• Alert your emergency contacts\n• Send your location to authorities`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'TRIGGER SOS',
          style: 'destructive',
          onPress: confirmTriggerSOS
        }
      ]
    );
  };

  const confirmTriggerSOS = async () => {
    try {
      setIsTriggering(true);
      
      // Vibrate to indicate SOS triggered
      Vibration.vibrate([0, 500, 200, 500]);

      const emergencyData = {
        latitude: location.latitude,
        longitude: location.longitude,
        emergencyType: emergencyTypeValues[emergencyType],
        description: description.trim()
      };

      const response = await ApiService.triggerSOS(emergencyData);

      Alert.alert(
        '✅ SOS Alert Sent',
        `Emergency alert has been sent successfully!\n\nAlert ID: ${response.alertId}\nNearby agents notified: ${response.nearbyAgents}\nEstimated response time: ${response.estimatedResponseTime}`,
        [
          {
            text: 'OK',
            onPress: () => {
              setDescription('');
              loadEmergencyAlerts();
            }
          }
        ]
      );

    } catch (error) {
      console.error('Error triggering SOS:', error);
      Alert.alert(
        'SOS Failed',
        error.message || 'Failed to send emergency alert. Please try again or call emergency services directly.',
        [
          { text: 'Retry', onPress: confirmTriggerSOS },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } finally {
      setIsTriggering(false);
    }
  };

  const callEmergencyServices = () => {
    Alert.alert(
      'Emergency Services',
      'Choose emergency service to call:',
      [
        { text: 'Police (112)', onPress: () => callNumber('112') },
        { text: 'Medical (114)', onPress: () => callNumber('114') },
        { text: 'Fire (113)', onPress: () => callNumber('113') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const callNumber = (number) => {
    // In a real app, you would use Linking.openURL(`tel:${number}`)
    Alert.alert('Calling', `Calling ${number}...`);
  };

  const getAlertStatusColor = (status) => {
    switch (status) {
      case 'active': return '#F44336';
      case 'acknowledged': return '#FF9800';
      case 'en_route': return '#2196F3';
      case 'resolved': return '#4CAF50';
      default: return '#757575';
    }
  };

  const getAlertStatusText = (status) => {
    switch (status) {
      case 'active': return 'Active';
      case 'acknowledged': return 'Acknowledged';
      case 'en_route': return 'Help En Route';
      case 'resolved': return 'Resolved';
      default: return status;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Emergency SOS</Text>
          <Text style={styles.headerSubtitle}>
            Get immediate help from security agents
          </Text>
        </View>

        {/* Location Status */}
        <Card containerStyle={styles.locationCard}>
          <View style={styles.locationContent}>
            <Ionicons 
              name={location ? "location" : "location-outline"} 
              size={24} 
              color={location ? "#4CAF50" : "#F44336"} 
            />
            <View style={styles.locationText}>
              <Text style={styles.locationTitle}>
                {location ? "Location Ready" : "Location Not Available"}
              </Text>
              <Text style={styles.locationSubtitle}>
                {location 
                  ? `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`
                  : "Enable location services for accurate emergency response"
                }
              </Text>
            </View>
            {!location && (
              <TouchableOpacity onPress={getCurrentLocation}>
                <Ionicons name="refresh" size={24} color="#2E7D32" />
              </TouchableOpacity>
            )}
          </View>
        </Card>

        {/* Emergency Type Selection */}
        <Card containerStyle={styles.card}>
          <Text style={styles.cardTitle}>Emergency Type</Text>
          <ButtonGroup
            onPress={setEmergencyType}
            selectedIndex={emergencyType}
            buttons={emergencyTypes}
            containerStyle={styles.buttonGroup}
            selectedButtonStyle={styles.selectedButton}
            textStyle={styles.buttonText}
          />
        </Card>

        {/* Description */}
        <Card containerStyle={styles.card}>
          <Text style={styles.cardTitle}>Description (Optional)</Text>
          <Input
            placeholder="Briefly describe the emergency..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            maxLength={500}
            containerStyle={styles.inputContainer}
          />
        </Card>

        {/* SOS Button */}
        <Card containerStyle={styles.sosCard}>
          <Animated.View style={[styles.sosButtonContainer, { transform: [{ scale: pulseAnim }] }]}>
            <TouchableOpacity
              style={[styles.sosButton, isTriggering && styles.sosButtonDisabled]}
              onPress={triggerSOS}
              disabled={isTriggering}
            >
              <Ionicons name="warning" size={60} color="#fff" />
              <Text style={styles.sosButtonText}>
                {isTriggering ? 'SENDING...' : 'TRIGGER SOS'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
          <Text style={styles.sosWarning}>
            Only use in real emergencies. False alarms may result in penalties.
          </Text>
        </Card>

        {/* Quick Call */}
        <Card containerStyle={styles.card}>
          <Text style={styles.cardTitle}>Direct Emergency Call</Text>
          <Button
            title="Call Emergency Services"
            icon={<Ionicons name="call" size={20} color="#fff" style={{ marginRight: 8 }} />}
            buttonStyle={styles.callButton}
            onPress={callEmergencyServices}
          />
        </Card>

        {/* Recent Alerts */}
        {alerts.length > 0 && (
          <Card containerStyle={styles.card}>
            <Text style={styles.cardTitle}>Your Recent Alerts</Text>
            {alerts.slice(0, 3).map((alert, index) => (
              <View key={index} style={styles.alertItem}>
                <View style={styles.alertHeader}>
                  <View style={[styles.alertStatus, { backgroundColor: getAlertStatusColor(alert.status) }]}>
                    <Text style={styles.alertStatusText}>
                      {getAlertStatusText(alert.status)}
                    </Text>
                  </View>
                  <Text style={styles.alertDate}>
                    {new Date(alert.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={styles.alertType}>
                  {alert.emergencyType.toUpperCase()} Emergency
                </Text>
                {alert.responseTime && (
                  <Text style={styles.alertResponse}>
                    Response time: {alert.responseTime}
                  </Text>
                )}
              </View>
            ))}
          </Card>
        )}

        {/* Safety Tips */}
        <Card containerStyle={styles.tipsCard}>
          <Text style={styles.tipsTitle}>🛡️ Emergency Tips</Text>
          <Text style={styles.tipsText}>
            • Stay calm and move to a safe location if possible{'\n'}
            • Keep your phone charged and location services enabled{'\n'}
            • Update your emergency contacts regularly{'\n'}
            • Know your exact location or nearby landmarks{'\n'}
            • Follow instructions from security agents
          </Text>
        </Card>
      </ScrollView>
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
    backgroundColor: '#F44336',
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
    color: '#FFCDD2',
    marginTop: 4,
  },
  locationCard: {
    margin: 20,
    borderRadius: 12,
    elevation: 3,
  },
  locationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    flex: 1,
    marginLeft: 12,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  locationSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
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
    height: 40,
  },
  selectedButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    fontSize: 14,
  },
  inputContainer: {
    paddingHorizontal: 0,
  },
  sosCard: {
    margin: 20,
    borderRadius: 15,
    backgroundColor: '#F44336',
    elevation: 8,
    alignItems: 'center',
  },
  sosButtonContainer: {
    alignItems: 'center',
  },
  sosButton: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#D32F2F',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
  },
  sosButtonDisabled: {
    backgroundColor: '#FFCDD2',
  },
  sosButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
  },
  sosWarning: {
    fontSize: 12,
    color: '#FFCDD2',
    textAlign: 'center',
    marginTop: 15,
    fontStyle: 'italic',
  },
  callButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 8,
  },
  alertItem: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  alertStatusText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  alertDate: {
    fontSize: 12,
    color: '#666',
  },
  alertType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  alertResponse: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 4,
  },
  tipsCard: {
    margin: 20,
    borderRadius: 12,
    backgroundColor: '#E3F2FD',
    elevation: 2,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 14,
    color: '#0D47A1',
    lineHeight: 20,
  },
});

export default EmergencyScreen;
