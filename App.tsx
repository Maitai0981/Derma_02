/**
 * MelaNet App
 * React Native App with ExecuTorch Integration
 *
 * @format
 */

import React from 'react';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Context
import { ThemeProvider, useTheme } from './context/ThemeContext';

// Screens
import HomeScreen from './screens/HomeScreen';
import ReportScreen from './screens/ReportScreen';
import SettingsScreen from './screens/SettingsScreen';
import ContactScreen from './screens/ContactScreen';

const Tab = createBottomTabNavigator();

function AppNavigator() {
  const { isDark } = useTheme();
  const systemColorScheme = useColorScheme();

  // Tema do contexto ou fallback para o tema do sistema
  const isDarkMode = isDark ?? (systemColorScheme === 'dark');

  return (
    <>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={isDarkMode ? '#000000' : '#ffffff'}
      />

      <NavigationContainer theme={isDarkMode ? DarkTheme : DefaultTheme}>
        <Tab.Navigator
          initialRouteName="Home"
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              // removido TypeScript: let iconName: string;
              let iconName;

              switch (route.name) {
                case 'Home':
                  iconName = focused ? 'home' : 'home-outline';
                  break;
                case 'Contact':
                  iconName = focused ? 'chatbox' : 'chatbox-outline';
                  break;
                case 'Settings':
                  iconName = focused ? 'settings' : 'settings-outline';
                  break;
                case 'Report':
                  iconName = focused ? 'document-text' : 'document-text-outline';
                  break;
                default:
                  iconName = 'ellipse-outline';
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },

            tabBarActiveTintColor: isDarkMode ? '#60a5fa' : '#3b82f6',
            tabBarInactiveTintColor: isDarkMode ? '#9ca3af' : '#6b7280',

            tabBarStyle: {
              backgroundColor: isDarkMode
                ? DarkTheme.colors.card
                : DefaultTheme.colors.card,
              borderTopColor: isDarkMode ? '#374151' : '#e5e7eb',
              borderTopWidth: 1,
              elevation: 8,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -3 },
              shadowOpacity: 0.1,
              shadowRadius: 3,
            },

            headerShown: false,

            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '600',
            },
          })}
        >
          <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Principal' }} />
          <Tab.Screen name="Contact" component={ContactScreen} options={{ title: 'Contato' }} />
          <Tab.Screen name="Report" component={ReportScreen} options={{ title: 'Laudo' }} />
          <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Configurações' }} />
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
}

function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <View style={styles.container}>
          <AppNavigator />
        </View>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
