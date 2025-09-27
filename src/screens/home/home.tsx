import React, { useState, useEffect } from 'react';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
  PermissionsAndroid,
  Platform,
  FlatList,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BleManager } from 'react-native-ble-plx';
import { Buffer } from 'buffer';
import { useDispatch, useSelector } from 'react-redux';
import { toggleSaveMessage, selectSavedMessages } from "../../redux/slices/messagesSlice";
import Icon from '@react-native-vector-icons/material-icons';
import LinearGradient from "react-native-linear-gradient";



const DEVICE_NAME = 'MyESP32';
const SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
const CHARACTERISTIC_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';

const bleManager = new BleManager();

const Home = () => {


  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [receivedMessages, setReceivedMessages] = useState([]);

  const dispatch = useDispatch();
  const savedMessages = useSelector(selectSavedMessages);

  // This function checks if a message is in the Redux store
  const isMessageSaved = (messageId) => {
    return savedMessages.some((msg) => msg.id === messageId);
  };



  // Request permissions (no changes needed here)
  useEffect(() => {
    const requestPermissions = async () => {
      if (Platform.OS === 'android') {
        await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);
      }
    };
    requestPermissions();
  }, []);





  const startScan = () => {
    console.log('Scanning...');
    setConnectionStatus('Scanning...');
    setReceivedMessages([]);
    bleManager.startDeviceScan(null, null, (error, scannedDevice) => {
      if (error) {
        console.error(error);
        return;
      }
      if (scannedDevice && scannedDevice.name === DEVICE_NAME) {
        bleManager.stopDeviceScan();
        connectToDevice(scannedDevice);
      }
    });
  };





  const connectToDevice = async (device) => {

    try {
      setConnectionStatus('Connecting...');
      await device.connect();
      setConnectionStatus('Connected');
      await device.discoverAllServicesAndCharacteristics();
      device.monitorCharacteristicForService(
        SERVICE_UUID,
        CHARACTERISTIC_UUID,
        (error, characteristic) => {
          if (error) {
            console.error(error);
            return;
          }
          const text = Buffer.from(characteristic.value, 'base64').toString('ascii');
          console.log('Received:', text);

          // Create a new message object with a unique ID
          const newMessage = {
            id: `${Date.now()}-${text}`, // Simple unique ID
            text: text,
            timestamp: new Date().toISOString(),
          };

          // Add the new message object to the top of the list
          setReceivedMessages(prevMessages => [newMessage, ...prevMessages]);
        },
      );
    } catch (error) {
      console.error('Connection error:', error);
      setConnectionStatus('Connection Failed');
    }
  };






  const renderMessage = ({ item }) => {

    const isSaved = isMessageSaved(item.id);
    return (
      <View style={[styles.logItemContainer, item.text.includes('Temp') && { marginBottom: 30 }]}>
        <Text style={styles.logText}>
          {item.text}
        </Text>

        <TouchableOpacity style={styles.saveIcon} onPress={() => dispatch(toggleSaveMessage(item))}>
          <Icon
            name={isSaved ? 'bookmark' : 'bookmark-outline'}
            size={20}
            color={isSaved ? 'black' : 'black'}
          />
        </TouchableOpacity>


      </View>



    );
  };



  return (
    <LinearGradient
      colors={['#C3C8FF', '#FBE8FF', '#FFF5E3', '#FFFFFF']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar translucent={true} backgroundColor={'transparent'} barStyle="dark-content" />

        <View style={styles.header}>
          <Text style={styles.title}>Sensor Value</Text>
          <Text style={styles.statusText}>Status: {connectionStatus}</Text>
          <TouchableOpacity style={styles.button} onPress={startScan}>
            <Text style={styles.buttonText}>
              {connectionStatus === "Connected" ? "Connected" : "Scan and Connect"}
            </Text>
          </TouchableOpacity>

        </View>


        <FlatList

          style={styles.logContainer}
          data={receivedMessages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}

        />




      </SafeAreaView>
    </LinearGradient>
  );
}


const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 20,
  },
  logContainer: {
    height: 200,
    backgroundColor: "rgba(255,255,255,0.6)",
    marginBottom: 100,
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  header: {
    paddingBottom: 25,
  },
  title: {
    fontSize: 24,
    textAlign: "center",
    fontWeight: "500",
  },
  statusText: {
    fontSize: 14,
    textAlign: "center",
    fontWeight: "300",
  },
  button: {
    height: 50,
    backgroundColor: "black",
    borderRadius: 10,
    justifyContent: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#ffffff",
    textAlign: "center",
    fontWeight: "500",
    fontSize: 18,



  },
  logItemContainer: {
    //flex:1,
    borderWidth: 1,
    borderColor: "grey",
    flexDirection: "row",
    justifyContent: "space-between",

    borderRadius: 10,
    marginVertical: 5,
    paddingHorizontal: 10,
    alignItems: "center",
    height:40,

  },
  logText: {

  },
  saveIcon:{
    backgroundColor:"#C3C8FF",
    height:28,
    width:28,
    borderRadius:10,
    alignItems:"center",
    justifyContent:"center",
  }
});

export default Home;