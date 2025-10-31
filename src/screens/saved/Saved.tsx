import React from 'react';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
  FlatList,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import {
  deleteSavedMessage,
  selectSavedMessages,
} from '../../redux/slices/messagesSlice';
import { setPredictionData } from '../../redux/slices/predictionSlice';
import Icon from '@react-native-vector-icons/material-icons';
import LinearGradient from 'react-native-linear-gradient';

type PredictionData = {
  npk: string;
  ph: string;
  tempHumidity: string;
};

type SavedMessage = {
  id: string;
  text: string;
  timestamp: number;
};

const parseMessageForPrediction = (messageText: string): PredictionData=> {


  let data = { npk: '', ph: '', tempHumidity: '' };

  // Case 1: NPK format like "12.0N 4.0P 6.0K NPK"
  const npkMatch = messageText.match(/(\d+\.?\d*)N\s*(\d+\.?\d*)P\s*(\d+\.?\d*)K/);
  if (npkMatch) {
    // npkMatch will be an array: [full_match, N_value, P_value, K_value]
    data.npk = `${npkMatch[1]}, ${npkMatch[2]}, ${npkMatch[3]}`;
    return data;
  }

  // Case 2: Hum&Temp format like "189H 21.8T Hum&Temp"
  const tempHumMatch = messageText.match(/(\d+\.?\d*)H\s*(\d+\.?\d*)T/);
  if (tempHumMatch) {
    // tempHumMatch will be: [full_match, Humidity_value, Temp_value]
    data.tempHumidity = `${tempHumMatch[2]}C, ${tempHumMatch[1]}%`;
    return data;
  }

  // Case 3: pH format — now supports both "8.10 ph" and "ph 8.10"
  const phMatch = messageText.match(/(?:ph\s*(\d+\.?\d*)|(\d+\.?\d*)\s*ph)/i);
  if (phMatch) {
    data.ph = phMatch[1] || phMatch[2];
    return data;
  }

  return data;
};




const Saved: React.FC = () => {


  const dispatch = useDispatch();
  const savedMessages = useSelector(selectSavedMessages);


  const handleSendToPredict = (item:SavedMessage) => {
    const parsedData = parseMessageForPrediction(item.text);

    // Check if any data was actually parsed
    if (!parsedData.npk && !parsedData.ph && !parsedData.tempHumidity) {
      Alert.alert('Parsing Error', 'Could not recognize the data format to send for prediction.');
      return;
    }

    dispatch(setPredictionData(parsedData));

    Alert.alert(
      'Data Sent',
      'The sensor values have been sent to the Predict screen.',

    );
  };


  const renderSavedMessage = ({ item } :{ item: SavedMessage }) => (

    <View style={styles.messageItemContainer}>

      <View>
        <Text style={styles.messageText}>{item.text}</Text>
        <Text style={styles.savedItemTimestamp}>
          {new Date(item.timestamp).toLocaleString()}
        </Text>
      </View>

      <View style ={styles.iconContainer}>
      <TouchableOpacity  onPress={() => handleSendToPredict(item)}>
        <Icon name="analytics" size={24} color="#007AFF" />
      </TouchableOpacity>

      <TouchableOpacity style={{marginLeft:20,}} onPress={() => dispatch(deleteSavedMessage(item.id))}>
        <Icon name="delete" size={24} color="#e74c3c" />
      </TouchableOpacity>
      </View>

    </View>

  );

  return (

    <LinearGradient
      colors={['#C3C8FF', '#FBE8FF', '#FFF5E3', '#FFFFFF']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>


        <View style={styles.header}>
          <Text style={styles.title}>Saved Values</Text>
        </View>


        {savedMessages.length > 0 ? (
          <FlatList
            data={savedMessages}
            renderItem={renderSavedMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No saved messages yet.</Text>
            <Text style={styles.emptySubText}>Go to the Home screen and tap the bookmark icon to save a message</Text>
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>


  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingBottom: 80,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: 'black',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  messageItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.5)',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  messageText: {
    fontSize: 16,
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#555',
  },
  emptySubText: {
    fontSize: 14,
    color: 'gray',
    textAlign: 'center',
    marginTop: 10,
  },
  savedItemTimestamp: {
    fontSize: 13,
    color: "grey",
    paddingTop: 5,

  },
  iconContainer:{
    flexDirection:"row",

  }
});

export default Saved;