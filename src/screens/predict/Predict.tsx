import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView, } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";

const API_URL = "https://netprincesingh.pythonanywhere.com/api/predict/";







const Predict = () => {

    const [nitrogen, setNitrogen] = useState("");
    const [phosphorus, setPhosphorus] = useState('');
    const [potassium, setPotassium] = useState('');
    const [ph, setPh] = useState('');
    const [temperature, setTemperature] = useState('');
    const [humidity, setHumidity] = useState('');


    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handlePredict = async () => {
        if (!nitrogen || !phosphorus || !potassium || !ph || !temperature || !humidity) {
            Alert.alert("Validation Error", 'Please fill all fields');
            return;
        }

        setIsLoading(true);
        setResult('');

        const requestBody = {
            N: parseFloat(nitrogen),
            P: parseFloat(phosphorus),
            K: parseFloat(potassium),
            PH: parseFloat(ph),
            TEMPERATURE: parseFloat(temperature),
            MOISTURIZER: parseFloat(humidity), // due to typo error in django server
        };
    }

    return (
        <LinearGradient
            colors={['#C3C8FF', '#FBE8FF', '#FFF5E3', '#FFFFFF']}
            style={styles.gradient}
        >
            <SafeAreaView>

            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
    },
    safe: {
        flex: 1,
    }
})
export default Predict;