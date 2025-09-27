import { View, Text, StyleSheet, TextInput, ActivityIndicator, Alert, ScrollView, Pressable, } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";
import { selectPredictionData } from '../../redux/slices/predictionSlice';
import { useSelector } from 'react-redux';

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

    const predictionData = useSelector(selectPredictionData);


    const handlePullData = () => {
        // Handle NPK string: "50, 30, 20"
        if (predictionData.npk) {
            const npkValues = predictionData.npk.split(',').map(v => v.trim());
            if (npkValues.length === 3) {
                setNitrogen(npkValues[0]);
                setPhosphorus(npkValues[1]);
                setPotassium(npkValues[2]);
            }
        }

        // Handle Temp/Humidity string: "25C, 60%"
        if (predictionData.tempHumidity) {
            const tempHumValues = predictionData.tempHumidity.split(',').map(v => v.trim());
            if (tempHumValues.length === 2) {
                // Extracts just the numbers
                setTemperature(tempHumValues[0].match(/\d+/)?.[0] || '');
                setHumidity(tempHumValues[1].match(/\d+/)?.[0] || '');
            }
        }

        // Handle pH
        if (predictionData.ph) {
            setPh(predictionData.ph);
        }

        Alert.alert('Success', 'Data has been pulled from saved values.');
    };




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

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),

            });

            if (!response.ok) {
                throw new Error("Something went wrong with API request");
            }

            const data = await response.json();
            setResult(data.suitable_crop);
        }
        catch (error) {
            console.error(error);
            setResult(`Error: ${error.message}`);
            Alert.alert('API Error', 'Failed to get a prediction. Please try again.');

        }
        finally {
            setIsLoading(false);
        }
    }

    return (
        <LinearGradient
            colors={['#C3C8FF', '#FBE8FF', '#FFF5E3', '#FFFFFF']}
            style={styles.gradient}
        >
            <SafeAreaView style={styles.safe}>
                <Text style={styles.title}>Find your best suitable crop</Text>
                <View style={styles.container}>
                    <TextInput
                        style={styles.input}
                        placeholder="Nitrogen Value"
                        onChangeText={setNitrogen}
                        value={nitrogen}
                        keyboardType={"numeric"}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Phosphorus Value"
                        onChangeText={setPhosphorus}
                        value={phosphorus}
                        keyboardType={"numeric"}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Potassium Value"
                        onChangeText={setPotassium}
                        value={potassium}
                        keyboardType={"numeric"}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="PH Value"
                        onChangeText={setPh}
                        value={ph}
                        keyboardType={"numeric"}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Temperature Value"
                        onChangeText={setTemperature}
                        value={temperature}
                        keyboardType={"numeric"}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Humidity Value"
                        onChangeText={setHumidity}
                        value={humidity}
                        keyboardType={"numeric"}
                    />

                    <Pressable style={styles.button} onPress={handlePredict}>
                        <Text style={styles.buttonText}>{isLoading ? 'Predicting...' : 'Predict'}</Text>
                    </Pressable>

                    <Pressable style={styles.button} onPress={handlePullData}>
                        <Text style={styles.buttonText}>Pull Sensor Data</Text>
                    </Pressable>
                </View>

                {isLoading && <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 20 }} />}
                <Text style = {styles.resultText}>{result}</Text>

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
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    title: {
        marginBottom: 20,
        textAlign: "center",
        fontSize: 24,
        fontWeight: "400",
        marginTop: 20,

    },
    container: {
        backgroundColor: "rgba(255,255,255,0.6)",
        height: 570,
        paddingHorizontal: 10,
        paddingTop: 20,
        borderRadius: 20,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        paddingHorizontal: 10,
        borderRadius: 10,
        marginBottom: 20,
    },
    button: {
        height: 50,
        backgroundColor: "black",
        borderRadius: 10,
        marginTop: 30,
        justifyContent: "center",
    },
    buttonText: {
        color: "white",
        textAlign: "center",
        fontSize: 18,
        fontWeight: "500",
    },
    resultText:{
        fontSize:30,
        textAlign:"center",
        marginTop:20,
       // borderWidth:2,
        //width:100,
    }
})
export default Predict;