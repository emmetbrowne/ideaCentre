import React, { useState, useEffect } from "react";
import {
    StyleSheet, FlatList, Text, TouchableOpacity, View, Button, StatusBar,
} from "react-native";
import firebase from "firebase";
import auth from "../firebase/auth";
import 'firebase/storage'
import { Audio } from "expo-av";



/* TODO: 

    Write code to allow for download and display of audio recorded, in a different sections
    possibly using tab navigation

*/


/* TODO:
    
    Create 'if loading' loading

*/

export default function Record({ navigation }) {
    const [recording, setRecording] = useState(null);
    const [sound, setSound] = useState(null);
    const [recordingStatus, setRecordingStatus] = useState(null);
    const [db, setDb] = useState(null);

    const handleSignOut = () => {
        auth
            .signOut()
            .then(() => {
                navigation.navigate("Login");
            })
            .catch((error) => alert(error.message));
    };

    useEffect(() => {
        // request permission to use the microphone
        (async () => {
            const { status } = await Audio.requestPermissionsAsync();
            console.log('Permission granted for microphone use');
            if (status !== 'granted') {
                alert('Sorry, we need microphone permissions to make this work!');
                console.log('Permission  NOT granted for microphone use');
                return;
            }
        })();
    }, []);

    const startRecording = async () => {
        // create a new recording instance
        const recording = new Audio.Recording();
        console.log('Created new recording instance');
        await Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            playsInSilentModeIOS: true,
        })
            .catch(error => console.error('Failed to set audio mode', error));

        try {
            // prepare the recording
            await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
            console.log('Recording preperation succesfull');
            // start recording
            await recording.startAsync();
            console.log('Started recording');
        } catch (err) {
            console.error('Failed to start recording', err);
        }

        setRecording(recording);
        setRecordingStatus('recording');
    };

    const stopRecording = async () => {
        setRecordingStatus('stopped');
        console.log('Stopped recording');
        try {
            // stop recording
            await recording.stopAndUnloadAsync();
        } catch (err) {
            console.error('Failed to stop recording', err);
        }

        // get the URI of the recorded audio file
        const uri = recording.getURI();
        console.log('Succesfully got the recorded audio file');

        try {
            // upload the recorded audio file to Firebase Storage
            const response = await fetch(uri);
            const blob = await response.blob();
            const fileName = `audio_${Date.now()}.mp3`; // generate a unique filename
            const storageRef = firebase.storage().ref().child(`audio/${fileName}`);
            const snapshot = await storageRef.put(blob);
            const audioUrl = await storageRef.getDownloadURL();
            setSound({ uri: recording.getURI() });
            setRecording(null);
        } catch (err) {
            console.error("Failed to upload audio to firebase storage", err);
        }
    };


    return (
        <View style={styles.container}>
            <Text style={styles.title}>Record Audio</Text>
            <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
                <Text style={styles.buttonText}>Sign out</Text>
            </TouchableOpacity>
            <Button title="Start Recording" onPress={startRecording} disabled={recordingStatus === 'recording'} />
            <Button title="Stop Recording" onPress={stopRecording} disabled={!recording} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    status: {
        marginTop: 20,
    },
    signOutButton: {
        backgroundColor: "#0782F9",
        width: "60%",
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 40,
        position: 'absolute',
        bottom: 100
    },
    buttonText: {
        color: "white",
        fontWeight: "700",
        fontSize: 16,
    },
});
