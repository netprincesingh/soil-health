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



// --- Fill in your ESP32's details here! ---
const DEVICE_NAME = 'MyESP32'; // The name you set in your ESP32 code
const SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
const CHARACTERISTIC_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';
// ---------------------------------------------

const bleManager = new BleManager();

const App = () => {
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');

  // ✅ STATE IS NOW AN ARRAY to store all messages
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
  };

  // Connect and monitor for data
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

          // ✅ APPEND a new message to the array instead of overwriting
          setReceivedMessages(prevMessages => [...prevMessages, message]);
        },
      );
    } catch (error) {
      console.error('Connection error:', error);
      setConnectionStatus('Connection Failed');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>BLE Message Log</Text>
        <Text style={styles.statusText}>Status: {connectionStatus}</Text>
        <TouchableOpacity style={styles.button} onPress={startScan}>
          <Text style={styles.buttonText}>Scan and Connect</Text>
        </TouchableOpacity>
      </View>

      {/* ✅ SCROLLVIEW to display the list of messages */}
      <ScrollView style={styles.logContainer}>
        {receivedMessages.map((message, index) => (
          <Text key={index} style={styles.logText}>
            {`[${index + 1}]: ${message}`}
          </Text>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f8ff',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#005a9c',
  },
  statusText: {
    fontSize: 16,
    color: '#333',
    marginVertical: 10,
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logContainer: {
    flex: 1,
    padding: 10,
  },
  logText: {
    fontSize: 14,
    color: '#000',
    marginBottom: 5,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingBottom: 5,
  },
});

export default App;