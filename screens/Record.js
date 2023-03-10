import React, { useRef, useState, useEffect } from "react";
import {
    StyleSheet, FlatList, Text, TouchableOpacity, View, Button, StatusBar,
} from "react-native";
import firebase from "firebase";
import auth from "../firebase/auth";
import 'firebase/storage'
import { Audio } from "expo-av";

export default function Record({ navigation }) {
    const [recording, setRecording] = useState(null);
    const [sound, setSound] = useState(null);
    const [recordingStatus, setRecordingStatus] = useState(null);
    const fileNumberRef = useRef(1);

    const handlCentrePage = () => {
        navigation.navigate("Centre");
    };

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
        // fetchAudioFiles();
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

    // Function to fetch audio files uploaded by current user
    // const fetchAudioFiles = async () => {

    //     const currentUser = firebase.auth().currentUser;
    //     console.log("Current User: ", currentUser);
    //     if (!currentUser) {
    //         console.error("No user is currently logged in")
    //         return;
    //     }

    //     const storageRef = firebase.storage().ref();
    //     const audioRef = storageRef.child('audio/${currentUser.uid}');

    //     try {
    //         const listResult = await audioRef.listAll();
    //         const items = listResult.items;
    //         const urls = await Promise.all(items.map(item => item.getDownloadURL()));
    //         console.log('Fethced audio files:', urls);

    //     } catch (error) {
    //         console.error('Failed to fetch audio files', error);
    //     }
    // };

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
            // Get the logged in users email
            const userID = firebase.auth().currentUser.uid;
            const blob = await response.blob();
            // generate a unique filename
            const fileName = `audio_${userID}_${fileNumberRef.current}.m4a`;
            const storageRef = firebase.storage().ref().child(`audio/${userID}/${fileName}`);
            // Increment a file number for each saved file
            fileNumberRef.current++;
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
            <TouchableOpacity onPress={handlCentrePage} style={styles.centreButton}>
                <Text style={styles.buttonText}> View Centre</Text>
            </TouchableOpacity>
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
        bottom: 100,
    },
    centreButton: {
        backgroundColor: "#0782F9",
        width: "60%",
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 40,
        position: 'absolute',
        bottom: 25,
    },
    buttonText: {
        color: "white",
        fontWeight: "700",
        fontSize: 16,
    },
});
