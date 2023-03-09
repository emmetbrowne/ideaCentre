import React, { useState, useEffect } from "react";
import {
    StyleSheet, FlatList, Text, TouchableOpacity, View, Button, StatusBar,
} from "react-native";
import firebase from "firebase";
import auth from "../firebase/auth";
import 'firebase/storage'
import { Audio } from "expo-av";
import { getFirestore, collection, addDoc } from "firebase/firestore";


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
    const [audioFiles, setAudioFiles] = useState([]);
    const [db, setDb] = useState(null);

    // // create a reference to the Firebase Storage bucket
    const storageRef = firebase.storage().ref();
    console.log('Succesfully created reference to firebase storage bucket');

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

    // useEffect(() => {
    //     // used to load audio
    //     async function loadAudioFiles() {
    //const storageRef = firebase.storage().ref().child('audio');
    //const audioFilesList = await storageRef.listAll();

    //         const audioFilesUrls = await Promise.all(
    //             audioFilesList.items.map(async (audioFileRef) => {
    //                 const url = await audioFileRef.getDownloadURL();
    //                 return { url, name: audioFileRef.name };
    //             })
    //         );

    //         setAudioFiles(audioFilesUrls);
    //     }

    //     loadAudioFiles();
    // }, []);

    useEffect(() => {
        // used to load audio
        async function loadAudioFiles() {

            try {
                const db = getFirestore();
                console.log("Succesfully attached firestore databse");
                const audioFilesList = await collection(db, 'audio').get();

                const audioFilesUrls = audioFilesList.docs.map((doc) => {
                    return { url: doc.data().url, name: doc.id };
                });

            } catch (error) {
                console.error('Failed to load audio files', error)
            }

            setAudioFiles(audioFilesUrls);
        }

        loadAudioFiles();
        console.log("Succesfully loaded audio files")
    }, []);

    // useEffect(() => {
    //     // initialize Firestore database
    //     const db = firebase.firestore();
    //     setDb(db);
    //     console.log("Succesfully initialized Firestore database");
    // }, []);

    const handleSignOut = () => {
        auth
            .signOut()
            .then(() => {
                navigation.navigate("Login");
            })
            .catch((error) => alert(error.message));
    };

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
            //
            const audioRef = storageRef.child('audio/${fileName}');
            const snapshot = await audioRef.put(blob);


            // const audioRef = storageRef.child(`audio/${fileName}`);


            // const snapshot = await audioRef.put(blob);

            // create a reference to the uploaded audio file in Firebase Realtime Database
            //const db = firebase.firestore.database();
            const db = getFirestore(firebase);

            const audioUrl = await audioRef.getDownloadURL().catch(error => console.error('Failed to get audio URL', error));
            await db.collection('audio').add({
                url: audioUrl,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            // const audioId = audioRef.key;
            // const audioUrl = await audioRef.getDownloadURL().catch(error => console.error('Failed to get audio URL', error));
            // await db.ref(`audio/${audioId}`).set({
            //     url: audioUrl,
            //     createdAt: firebase.firestore.database.ServerValue.TIMESTAMP
            // });

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
            {/* <TouchableOpacity>
                <Button title="Play" onPress={playAudio} />
            </TouchableOpacity> */}

            {/* <FlatList
                data={audioFiles}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => navigation.navigate('AudioPlayer', { url: item.url, name: item.name })}>
                        <Text style={styles.item}>{item.name}</Text>
                    </TouchableOpacity>
                )}
            /> */}
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

// i tried to add firestore and now when i open the record file, nothng is pressable.