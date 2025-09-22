import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import BottomTabNavigator from "./navigation/bottomTabNavigator";
import { NavigationContainer } from "@react-navigation/native";
import { Provider } from "react-redux";
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from "./redux/store";


const App = () => {
    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <SafeAreaProvider>
                    <NavigationContainer>
                        <BottomTabNavigator />
                    </NavigationContainer>
                </SafeAreaProvider>
            </PersistGate>
        </Provider>
    );
}

export default App;