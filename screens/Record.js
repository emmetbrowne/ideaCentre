import React, { useRef, useState, useEffect } from "react";
import {
    StyleSheet, FlatList, Text, TouchableOpacity, View, Button, StatusBar,
} from "react-native";
import firebase from "firebase";
import auth from "../firebase/auth";
import 'firebase/storage'
import { Audio } from "expo-av";
import * as FileSystem from 'expo-file-system';
import { useNavigation } from '@react-navigation/native';

export default function Record() {
    const navigation = useNavigation();
    const [recording, setRecording] = useState(null);
    const [sound, setSound] = useState(null);
    const [recordingStatus, setRecordingStatus] = useState(null);
    const fileNumberRef = useRef(1);

    const handleSignOut = async () => {
        await auth.signOut();
        navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
        });
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
            const uri = recording.getURI();

            // Get the logged in users email
            const userID = firebase.auth().currentUser.uid;

            // generate a unique filename
            const fileName = `recording_${fileNumberRef.current}.mp3`;
            const storageRef = firebase.storage().ref().child(`audio/${userID}/${fileName}`);

            // Increment a file number for each saved file
            fileNumberRef.current++;

            // Convert the audio file to mp3
            const fileInfo = await FileSystem.getInfoAsync(uri);
            const audioFile = {
                uri: uri,
                type: fileInfo.mimeType,
                name: fileName,
            };
            const mp3File = await Audio.Sound.createAsync(audioFile, {
                encoding: Audio.Sound.ENCODING_MP3,
                bitrate: 256000,
                channels: 2,
                sampleRate: 44100,
            });
            const mp3Uri = mp3File.uri;

            let response, blob, snapshot, audioUrl;
            try {
                response = await fetch(mp3Uri);
                blob = await response.blob();
                snapshot = await storageRef.put(blob);
                audioUrl = await storageRef.getDownloadURL();
            } catch (err) {
                console.error('Failed to upload recording', err);
                throw err;
            }

            setSound({ uri });
            setRecording(null);
        } catch (err) {
            console.error('Failed to stop recording', err);
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
