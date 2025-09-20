import * as React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icons from '@react-native-vector-icons/material-icons';

import Home from "../screens/home/Home";
import Predict from "../screens/predict/Predict";

const Tab = createBottomTabNavigator();


export default function BottomTabNavigator(){
    return(
        
        <Tab.Navigator
            screenOptions={({route}) =>({
                tabBarIcon:({focused,color,size}) =>{
                    let iconName;

                    if(route.name === 'Home')
                    {
                        iconName = focused ? 'home' : 'home';
                    }
                    else if(route.name == 'Predict')
                    {
                        iconName = focused? 'device-hub' : 'device-hub';
                    }
                    
                    return <Icons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor:'black',
                tabBarInactiveTintColor:'grey',

                tabBarStyle: {
                position: 'absolute',
                height: 70,
                paddingBottom: 10,
                paddingTop: 10,
                backgroundColor: 'white',
                borderTopWidth: 0,
                elevation: 10,
                shadowOpacity: 0.1,
                shadowRadius: 10,
              },
              headerShown: false,


            })}
        >
            <Tab.Screen name="Home" component={Home} />
            <Tab.Screen name="Predict" component={Predict} />
            
        
        </Tab.Navigator>

        
        
    )
}