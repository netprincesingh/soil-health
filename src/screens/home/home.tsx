import React, { useState, useEffect } from 'react';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
  ScrollView,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BleManager } from 'react-native-ble-plx';
import { Buffer } from 'buffer';




const DEVICE_NAME = 'MyESP32';
const SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
const CHARACTERISTIC_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';

const bleManager = new BleManager();






const Home = () => {


  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [receivedMessages, setReceivedMessages] = useState([]);



  // Request permissions
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





  // Scan for devices
  const startScan = () => {

    console.log('Scanning...');
    setConnectionStatus('Scanning...');
    setReceivedMessages([]); // Clear messages on new scan
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
  }







  const connectToDevice = async (device) => {

    try {

      setConnectionStatus('Connecting...');
      await device.connect();
      setConnectionStatus('Connected');
      await device.discoverAllServicesAndCharacteristics();

      // Monitor the characteristic for notifications
      device.monitorCharacteristicForService(
        SERVICE_UUID,
        CHARACTERISTIC_UUID,
        (error, characteristic) => {
          if (error) {
            console.error(error);
            return;
          }
          // Decode the received value
          const message = Buffer.from(characteristic.value, 'base64').toString('ascii');
          console.log('Received:', message);

          //APPEND a new message to the array instead of overwriting
          setReceivedMessages(prevMessages => [...prevMessages, message]);
        },
      );
    } catch (error) {
      console.error('Connection error:', error);
      setConnectionStatus('Connection Failed');
    }

  }




  return (

    <SafeAreaView style={styles.container}>

      <View style={styles.header}>
        <Text style={styles.title}>Sensor Value</Text>
        <Text style={styles.statusText}>Status: {connectionStatus}</Text>

        <TouchableOpacity style={styles.button} onPress={startScan}>

          {connectionStatus === "Connected" ? (
            <Text style={styles.buttonText}>Connected</Text>
          ) : (
            <Text style={styles.buttonText}>Scan and Connect</Text>
          )}
        </TouchableOpacity>
      </View>




      <ScrollView
        style={styles.logContainer}
        showsVerticalScrollIndicator={false}

      >

        <ScrollView
          style={styles.logContainer}
          showsVerticalScrollIndicator={false}
        >
          {receivedMessages.map((message, index) => (
            <Text
              key={index}
              // Apply styles conditionally
              style={[
                styles.logText, // Your base style
                // If the message includes 'Temp', add an extra style object
                message.includes('Temp') && { marginBottom: 50 }
              ]}
            >
              {`${index + 1}. ${message}`}
            </Text>
          ))}
        </ScrollView>

      </ScrollView>



    </SafeAreaView>

  );
}





const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom:50,
    paddingHorizontal:20,
    backgroundColor:"white",

  },
  header: {
    paddingTop: 50,
    padding: 20,
    alignItems: 'center',

  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: 'black',
  },

  statusText: {
    fontSize: 16,
    color: '#333',
    marginVertical: 10,
  },
  button: {
    backgroundColor: 'black',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  logContainer: {
    flex: 1,
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor:"#cef6c1ff",
    borderRadius:10,
    marginBottom:80,
    paddingBottom:10,

  },
  logText: {
    paddingLeft:5,
    fontSize: 14,
    marginBottom: 5,
    borderWidth: 1,
    borderRadius:7,
    borderColor: 'black',
    paddingBottom: 5,
  },
});

export default Home;