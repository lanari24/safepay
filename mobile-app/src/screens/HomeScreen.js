import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button, Avatar, Badge } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';
import ApiService from '../services/api';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      
      // Load user profile
      const userResponse = await ApiService.getProfile();
      setUser(userResponse.user);

      // Load payment stats
      const statsResponse = await ApiService.getPaymentStats();
      setStats(statsResponse);

      // Load recent notifications
      const notificationsResponse = await ApiService.getNotifications(1, 5, true);
      setNotifications(notificationsResponse.notifications);

    } catch (error) {
      console.error('Error loading home data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHomeData();
    setRefreshing(false);
  };

  const handleQuickSOS = () => {
    Alert.alert(
      'Emergency SOS',
      'Are you sure you want to trigger an emergency alert? This will notify nearby security agents and your emergency contacts.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'TRIGGER SOS', 
          style: 'destructive',
          onPress: () => navigation.navigate('Emergency')
        }
      ]
    );
  };

  const QuickActionCard = ({ title, icon, color, onPress, badge }) => (
    <TouchableOpacity style={[styles.quickAction, { borderColor: color }]} onPress={onPress}>
      <View style={styles.quickActionContent}>
        <Ionicons name={icon} size={32} color={color} />
        {badge && (
          <Badge
            value={badge}
            status="error"
            containerStyle={styles.badgeContainer}
          />
        )}
        <Text style={[styles.quickActionText, { color }]}>{title}</Text>
      </View>
    </TouchableOpacity>
  );

  const StatsCard = ({ title, value, subtitle, icon, color }) => (
    <View style={[styles.statsCard, { borderLeftColor: color }]}>
      <View style={styles.statsContent}>
        <View style={styles.statsText}>
          <Text style={styles.statsValue}>{value}</Text>
          <Text style={styles.statsTitle}>{title}</Text>
          {subtitle && <Text style={styles.statsSubtitle}>{subtitle}</Text>}
        </View>
        <Ionicons name={icon} size={24} color={color} />
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>
                Muraho, {user?.firstName || 'User'}!
              </Text>
              <Text style={styles.subGreeting}>
                {user?.location?.district} District, {user?.location?.sector}
              </Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
              <Avatar
                rounded
                size="medium"
                title={user?.firstName?.charAt(0) || 'U'}
                backgroundColor="#2E7D32"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Emergency SOS Button */}
        <Card containerStyle={styles.emergencyCard}>
          <TouchableOpacity style={styles.sosButton} onPress={handleQuickSOS}>
            <Ionicons name="warning" size={40} color="#fff" />
            <Text style={styles.sosText}>EMERGENCY SOS</Text>
            <Text style={styles.sosSubtext}>Tap for immediate help</Text>
          </TouchableOpacity>
        </Card>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <QuickActionCard
              title="Make Payment"
              icon="card"
              color="#4CAF50"
              onPress={() => navigation.navigate('Payment')}
            />
            <QuickActionCard
              title="Community Forum"
              icon="chatbubbles"
              color="#2196F3"
              onPress={() => navigation.navigate('Forum')}
              badge={notifications.filter(n => n.type === 'forum_post').length || null}
            />
            <QuickActionCard
              title="Emergency Alerts"
              icon="alert-circle"
              color="#FF9800"
              onPress={() => navigation.navigate('Emergency')}
            />
            <QuickActionCard
              title="Payment History"
              icon="receipt"
              color="#9C27B0"
              onPress={() => navigation.navigate('PaymentHistory')}
            />
          </View>
        </View>

        {/* Payment Stats */}
        {stats && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Contributions</Text>
            <View style={styles.statsGrid}>
              <StatsCard
                title="This Month"
                value={`${stats.contributionsThisMonth?.toLocaleString() || 0} RWF`}
                icon="calendar"
                color="#4CAF50"
              />
              <StatsCard
                title="This Year"
                value={`${stats.contributionsThisYear?.toLocaleString() || 0} RWF`}
                icon="trending-up"
                color="#2196F3"
              />
              <StatsCard
                title="Total Contributed"
                value={`${stats.totalContributed?.toLocaleString() || 0} RWF`}
                subtitle="Since joining"
                icon="wallet"
                color="#FF9800"
              />
              {stats.upcomingDue && (
                <StatsCard
                  title="Next Payment"
                  value={`${stats.upcomingDue.amount?.toLocaleString() || 0} RWF`}
                  subtitle={`Due ${new Date(stats.upcomingDue.dueDate).toLocaleDateString()}`}
                  icon="time"
                  color="#F44336"
                />
              )}
            </View>
          </View>
        )}

        {/* Recent Notifications */}
        {notifications.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Updates</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            {notifications.slice(0, 3).map((notification, index) => (
              <Card key={index} containerStyle={styles.notificationCard}>
                <View style={styles.notificationContent}>
                  <Ionicons 
                    name={notification.type === 'emergency_alert' ? 'warning' : 'information-circle'} 
                    size={20} 
                    color="#2E7D32" 
                  />
                  <View style={styles.notificationText}>
                    <Text style={styles.notificationTitle}>{notification.title}</Text>
                    <Text style={styles.notificationMessage} numberOfLines={2}>
                      {notification.message}
                    </Text>
                    <Text style={styles.notificationTime}>
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* Safety Tips */}
        <Card containerStyle={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Safety Tip</Text>
          <Text style={styles.tipsText}>
            Always keep your emergency contacts updated and ensure your location services are enabled for faster emergency response.
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subGreeting: {
    fontSize: 14,
    color: '#E8F5E8',
    marginTop: 4,
  },
  emergencyCard: {
    margin: 20,
    borderRadius: 15,
    backgroundColor: '#F44336',
    elevation: 8,
  },
  sosButton: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  sosText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
  },
  sosSubtext: {
    fontSize: 14,
    color: '#FFCDD2',
    marginTop: 4,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  seeAllText: {
    color: '#2E7D32',
    fontWeight: '600',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAction: {
    width: (width - 60) / 2,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderWidth: 2,
    elevation: 3,
  },
  quickActionContent: {
    alignItems: 'center',
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  badgeContainer: {
    position: 'absolute',
    top: -5,
    right: -5,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statsCard: {
    width: (width - 60) / 2,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
    elevation: 2,
  },
  statsContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsText: {
    flex: 1,
  },
  statsValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statsTitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  statsSubtitle: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  notificationCard: {
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationText: {
    flex: 1,
    marginLeft: 12,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  notificationMessage: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  notificationTime: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
  },
  tipsCard: {
    margin: 20,
    borderRadius: 12,
    backgroundColor: '#E8F5E8',
    elevation: 2,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 14,
    color: '#1B5E20',
    lineHeight: 20,
  },
});

export default HomeScreen;
