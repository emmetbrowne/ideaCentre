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
import { Header } from 'react-navigation';

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
        // Set the recording options
        const recordingOptions = {
            android: {
                extension: ".mp3",
                outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_DEFAULT,
                audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_DEFAULT,
                sampleRate: 44100,
                numberOfChannels: 2,
                bitRate: 128000,
                linearPCMBitDepth: 16,
                linearPCMIsBigEndian: false,
                linearPCMIsFloat: false
            },
            ios: {
                extension: ".wav",
                audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
                sampleRate: 44100,
                numberOfChannels: 1,
                bitRate: 128000,
                linearPCMBitDepth: 16,
                linearPCMIsBigEndian: false,
                linearPCMIsFloat: false
            }
        };
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
            await recording.prepareToRecordAsync(recordingOptions);
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
            const fileName = `recording_${fileNumberRef.current}.wav`;
            const storageRef = firebase.storage().ref().child(`audio/${userID}/${fileName}`);

            // Increment a file number for each saved file
            fileNumberRef.current++;
            const response = await fetch(uri);
            const blob = await response.blob();
            const snapshot = await storageRef.put(blob);
            const audioUrl = await storageRef.getDownloadURL();
            setSound({ uri });
            setRecording(null);
            console.log('Recording succesfully uploaded');

        } catch (err) {
            console.error('Failed to stop recording', err);
        }
    };


    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>ideaCentre</Text>
            </View>
            <View style={styles.centeredView}>
                <View style={styles.buttonsContainer}>
                    <Button style={styles.recordButton} title="Start Recording" onPress={startRecording} disabled={recordingStatus === 'recording'} />
                    <Button style={styles.recordButton} title="Stop Recording" onPress={stopRecording} disabled={!recording} />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centeredView: {
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginTop: 250,
    },
    header: {
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        height: 110,
        paddingTop: 30,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    title: {
        fontSize: 40,
        fontWeight: 'bold',
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
    buttonsContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});