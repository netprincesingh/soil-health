import React, {useState, useEffect} from 'react';
import {
  
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import {BleManager} from 'react-native-ble-plx';
import {Buffer} from 'buffer'; // Needed to decode base64 data
import { SafeAreaView } from 'react-native-safe-area-context';







// --- IMPORTANT: REPLACE WITH YOUR ESP32's VALUES ---
const DEVICE_NAME = 'MyESP32'; // e.g., "ESP32_Sensor"
const SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b'; // e.g., "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
const CHARACTERISTIC_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a8'; // e.g., "beb5483e-36e1-4688-b7f5-ea07361b26a8"
// ----------------------------------------------------

// Create a new BleManager instance
const bleManager = new BleManager();

const Home = () => {
  const [device, setDevice] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [receivedMessage, setReceivedMessage] = useState('');

  // Request Android permissions
  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);
      if (
        granted['android.permission.BLUETOOTH_CONNECT'] !== 'granted' ||
        granted['android.permission.BLUETOOTH_SCAN'] !== 'granted' ||
        granted['android.permission.ACCESS_FINE_LOCATION'] !== 'granted'
      ) {
        console.log('Bluetooth permissions not granted');
      }
    }
  };

  useEffect(() => {
    requestPermissions();
  }, []);

  // Function to start scanning for devices
  const startScan = () => {
    console.log('Scanning...');
    setConnectionStatus('Scanning...');
    bleManager.startDeviceScan(null, null, (error, scannedDevice) => {
      if (error) {
        console.error(error);
        setConnectionStatus('Error scanning');
        return;
      }

      // Check if the scanned device is our ESP32
      if (scannedDevice && scannedDevice.name === DEVICE_NAME) {
        bleManager.stopDeviceScan();
        console.log(`Found device: ${scannedDevice.name}`);
        setConnectionStatus(`Found ${scannedDevice.name}`);
        connectToDevice(scannedDevice);
      }
    });
  };

  // Function to connect to the device and subscribe to notifications
  const connectToDevice = async discoveredDevice => {
    try {
      setConnectionStatus('Connecting...');
      const connectedDevice = await discoveredDevice.connect();
      setDevice(connectedDevice);
      setConnectionStatus('Connected!');
      console.log('Connected to', connectedDevice.name);

      await connectedDevice.discoverAllServicesAndCharacteristics();
      console.log('Services and characteristics discovered.');

      // Subscribe to the characteristic to receive messages
      connectedDevice.monitorCharacteristicForService(
        SERVICE_UUID,
        CHARACTERISTIC_UUID,
        (error, characteristic) => {
          if (error) {
            console.error('Error monitoring characteristic:', error);
            setReceivedMessage(`Error: ${error.reason}`);
            return;
          }

          // Decode the received value (it's Base64 encoded)
          const message = Buffer.from(characteristic.value, 'base64').toString(
            'ascii',
          );
          console.log('Received message:', message);
          setReceivedMessage(message);
        },
      );
    } catch (error) {
      console.error('Connection error:', error);
      setConnectionStatus('Connection failed');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.statusContainer}>
        <Text style={styles.title}>ESP32 BLE Reader 📡</Text>
        <Text style={styles.statusText}>Status: {connectionStatus}</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={startScan}>
        <Text style={styles.buttonText}>Scan and Connect</Text>
      </TouchableOpacity>

      <View style={styles.messageContainer}>
        <Text style={styles.messageTitle}>Received Message:</Text>
        <Text style={styles.messageText}>{receivedMessage || '---'}</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
  },
  statusContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#005a9c',
    marginBottom: 10,
  },
  statusText: {
    fontSize: 18,
    color: '#333',
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  messageContainer: {
    marginTop: 40,
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  messageTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#005a9c',
  },
  messageText: {
    fontSize: 22,
    marginTop: 10,
    color: '#000',
    fontWeight: 'bold',
  },
});

export default Home;