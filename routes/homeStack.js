import { createStackNavigator } from "react-navigation-stack";
import { createAppContainer } from "react-navigation";
import Home from "../screens/HomeScreen";
import Login from "../screens/LoginScreen";
import Record from "../screens/Record";
import Centre from "../screens/Centre";


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
  Centre: {
    screen: Centre,
  }
};

const HomeStack = createStackNavigator(screens);

export default createAppContainer(HomeStack);
