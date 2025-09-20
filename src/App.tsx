import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import BottomTabNavigator from  "./navigation/bottomTabNavigator";
import { NavigationContainer } from "@react-navigation/native";


const App = () =>{
    return(
        <SafeAreaProvider>
            <NavigationContainer>
            <BottomTabNavigator/>
            </NavigationContainer>
        </SafeAreaProvider>
    );
}

 export default App;