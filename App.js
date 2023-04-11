import { React, useState, useEffect } from "react";
import { StyleSheet, Text, View, Alert, TouchableOpacity } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import Login from "./screens/Login";
import Record from "./screens/Record";
import Centre from "./screens/Centre";
import SignOut from "./screens/SignOut";
import firebase from "firebase";
import { Ionicons } from 'react-native-vector-icons';
import { Platform } from 'react-native';



const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      setLoggedIn(!!user);
    });
    return unsubscribe;
  }, []);

  function AuthStack() {
    return (
      <Stack.Navigator>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Record" component={Record} />
      </Stack.Navigator>
    );
  }

  if (!loggedIn) {
    return (
      <NavigationContainer>
        <AuthStack />
      </NavigationContainer>
    );
  }

  if (Platform.OS === 'ios' || 'android') {
    return (
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;
              if (route.name === 'Record') {
                iconName = focused
                  ? 'mic-outline'
                  : 'mic';
              } else if (route.name === 'Centre') {
                iconName = focused ? 'cloud' : 'cloud-outline';
              } else if (route.name === 'Sign Out') {
                iconName = focused ? 'exit' : 'exit-outline';
              }
              // You can return any component that you like here!
              return <Ionicons name={iconName} size={size} color={color} />;
            },
          })}>
          <Tab.Screen name="Record" component={Record} />
          <Tab.Screen name="Centre" component={Centre} />
          <Tab.Screen name="Sign Out" component={SignOut} />
        </Tab.Navigator>
      </NavigationContainer>
    );

  } else {
    return (
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;
              if (route.name === 'Centre') {
                iconName = focused ? 'cloud' : 'cloud-outline';
              }
              // You can return any component that you like here!
              return <Ionicons name={iconName} size={size} color={color} />;
            },
          })}>
          <Tab.Screen name="Centre" component={Centre} />
        </Tab.Navigator>
      </NavigationContainer>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
