import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import FlashMessage from 'react-native-flash-message';

// Import screens (to be created)
// import HomeScreen from './src/screens/HomeScreen';
// import PaymentScreen from './src/screens/PaymentScreen';
// import EmergencyScreen from './src/screens/EmergencyScreen';
// import ForumScreen from './src/screens/ForumScreen';
// import ProfileScreen from './src/screens/ProfileScreen';
// import LoginScreen from './src/screens/auth/LoginScreen';
// import RegisterScreen from './src/screens/auth/RegisterScreen';

// Temporary placeholder screens
const PlaceholderScreen = ({ title }) => (
  <SafeAreaView style={styles.container}>
    <View style={styles.content}>
      <Text style={styles.title}>Rwanda Safe Pay</Text>
      <Text style={styles.subtitle}>{title}</Text>
      <Text style={styles.description}>
        Digital Safety and Community Payment Platform for Kigali
      </Text>
      <Text style={styles.features}>
        🏠 Community Payments{'\n'}
        🚨 Emergency SOS{'\n'}
        💬 Safety Forum{'\n'}
        📱 USSD Support
      </Text>
    </View>
  </SafeAreaView>
);

const HomeScreen = () => <PlaceholderScreen title="Home Dashboard" />;
const PaymentScreen = () => <PlaceholderScreen title="Irondo Payments" />;
const EmergencyScreen = () => <PlaceholderScreen title="Emergency SOS" />;
const ForumScreen = () => <PlaceholderScreen title="Community Forum" />;
const ProfileScreen = () => <PlaceholderScreen title="User Profile" />;

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Main tab navigator
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#2E7D32',
        tabBarInactiveTintColor: '#757575',
        headerStyle: {
          backgroundColor: '#2E7D32',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="Payment" 
        component={PaymentScreen}
        options={{
          title: 'Payments',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>💰</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="Emergency" 
        component={EmergencyScreen}
        options={{
          title: 'SOS',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>🚨</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="Forum" 
        component={ForumScreen}
        options={{
          title: 'Forum',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>💬</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Main app component
export default function App() {
  return (
    <PaperProvider>
      <NavigationContainer>
        <StatusBar style="light" backgroundColor="#2E7D32" />
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Main" component={MainTabNavigator} />
          {/* Authentication screens will be added here */}
        </Stack.Navigator>
        <FlashMessage position="top" />
      </NavigationContainer>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1B5E20',
    marginBottom: 20,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#424242',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  features: {
    fontSize: 18,
    color: '#2E7D32',
    textAlign: 'center',
    lineHeight: 32,
    backgroundColor: '#E8F5E8',
    padding: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
});
