import React from 'react';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import {
  deleteSavedMessage,
  selectSavedMessages,
} from '../../redux/slices/messagesSlice';
import Icon from '@react-native-vector-icons/material-icons';
import LinearGradient from 'react-native-linear-gradient';



const Saved = () => {


  const dispatch = useDispatch();
  const savedMessages = useSelector(selectSavedMessages);

  const renderSavedMessage = ({ item }) => (

    <View style={styles.messageItemContainer}>
      <Text style={styles.messageText}>{item.text}</Text>
      <TouchableOpacity onPress={() => dispatch(deleteSavedMessage(item.id))}>
        <Icon name="delete" size={24} color="#e74c3c" />
      </TouchableOpacity>
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
  gradient:{
    flex:1,
  },
  container: {
    flex: 1,
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
});

export default Saved;