import { createStackNavigator } from "react-navigation-stack";
import { createAppContainer } from "react-navigation";
import Home from "../screens/HomeScreen";
import Login from "../screens/LoginScreen";
import Record from "../screens/Record";

const screens = {
  Login: {
    screen: Login,
  },
  Home: {
    screen: Home,
  },
  Record: {
    screen: Record,
  },
};

const HomeStack = createStackNavigator(screens);

export default createAppContainer(HomeStack);
