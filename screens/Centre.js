import React, { useState, useEffect } from 'react';
import {
    StyleSheet, FlatList, Text, TouchableOpacity, View, Button, StatusBar, ScrollView, RefreshControl, Alert
} from "react-native";
import { Table, Row } from 'react-native-table-component';
import firebase from "firebase";
import auth from "../firebase/auth";
import 'firebase/storage'
import { Audio } from 'expo-av';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { Platform } from 'react-native';

export default function Centre() {
    const navigation = useNavigation();
    const [audioList, setAudioList] = useState([]);
    const [refreshing, setRefreshing] = React.useState(false);
    const storage = firebase.storage();
    const [showBox, setShowBox] = useState(true);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
        }, 2000);
    }, []);


    const handleSignOut = async () => {
        await auth.signOut();
        navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
        });
    };

    const showConfirmDialog = () => {
        return Alert.alert(
            "Delete Recording",
            "Are you sure you want to permanently delete this audio?",
            [
                // The "Yes" button
                {
                    text: "Yes",
                    onPress: () => {
                        handleDelete();
                        console.log("This audio has been succesfully deleted")
                        setShowBox(false);
                    },
                },
                // The "No" button
                // Does nothing but dismiss the dialog when tapped
                {
                    text: "No",
                },
            ]
        );
    };

    const handleDelete = async (itemName) => {
        const audioRef = firebase.storage().ref(`audio/${firebase.auth().currentUser.uid}/${itemName}`);

        // Delete file from Firebase Storage
        await audioRef.delete();
        console.log("File deleted successfully from Firebase Storage.");

        // Delete corresponding data from the database
        const dbRef = firebase.database().ref(`audio/${firebase.auth().currentUser.uid}/${itemName}`);
        await dbRef.remove();
        console.log("Data deleted successfully from the database.");

        // Update audioList state to remove the deleted item
        setAudioList(prevState => prevState.filter(audio => audio.name !== itemName));

    };

    const handleDownload = async (itemName) => {
        try {
            const sanitizedItemName = itemName.replace(/[.#$[\]]/g, "-");

            // Get reference to the audio file in Firebase storage
            const audioRef = storage.ref().child(`audio/${firebase.auth().currentUser.uid}/${itemName}`);

            // Download the audio file to the local device
            const downloadUrl = await audioRef.getDownloadURL();
            const response = await fetch(downloadUrl);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${itemName}.mp3`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            // Show a success message to the user
            window.alert(`${itemName} has been downloaded to your device.`);
        } catch (error) {
            console.error(error);
            window.alert('Unable to download audio file.');
        }
    };

    const playAudio = async (url) => {
        try {
            const soundObject = new Audio.Sound();
            await soundObject.loadAsync({ uri: url });
            await soundObject.playAsync();
            console.log("Audio playing succesfully");
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        const userID = firebase.auth().currentUser.uid;
        console.log("Current User: ", userID);

        firebase.storage()
            .ref(`audio/${userID}/`)
            .listAll()
            .then((result) => {
                result.items.forEach((audioRef) => {
                    // Get download URL for each audio file
                    audioRef.getDownloadURL().then((url) => {
                        // Check if the audio file has already been added
                        const isDuplicate = audioList.some((audio) => audio.name === audioRef.name);

                        // If the audio file has not been added, add it to the list
                        if (!isDuplicate) {
                            setAudioList((prevState) => [...prevState, { name: audioRef.name, url }]);
                        }
                    });
                });
            });
    }, []);

    const renderItem = ({ item, index }) => {
        if (Platform.OS === 'ios') {
            return (
                <>
                    <View style={styles.itemContainer}>
                        <View style={{ flex: 1 }}>
                            <MaterialCommunityIcons name="folder-music-outline" size={24} color="grey" />
                            <Text style={styles.itemName}>{item.name}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <TouchableOpacity onPress={() => showConfirmDialog()}>
                                <MaterialCommunityIcons name="delete-outline" size={24} color="grey" />
                            </TouchableOpacity>
                            {/* <TouchableOpacity onPress={() => handleDelete(item.name)} style={[styles.itemButton, { marginRight: 10 }]}>
                                <MaterialCommunityIcons name="delete-outline" size={24} color="grey" />
                            </TouchableOpacity> */}

                        </View>
                    </View>
                    <View style={styles.separator} key={`separator-${index}`} />
                </>
            );
        } else if (Platform.OS === 'web') {
            return (
                <>

                    <View style={styles.websiteItemContainer}>

                        <View style={{ flex: 1 }}>
                            <TouchableOpacity style={[styles.itemButton, { marginRight: 10, marginTop: 0 }]}>
                                <MaterialCommunityIcons name="folder-music-outline" size={24} color="grey" />
                                <Text style={styles.itemName}>{item.name}</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <TouchableOpacity onPress={() => handleDelete(item.name)} style={[styles.itemButton, { marginRight: 10, marginTop: 5 }]}>
                                <MaterialCommunityIcons name="delete-outline" size={24} color="grey" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => playAudio(item.url)} style={[styles.itemButton, { marginRight: 10, marginTop: 5 }]}>
                                <MaterialCommunityIcons name="play-circle-outline" size={24} color="grey" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleDownload(item.name)} style={[styles.itemButton, { marginRight: 10, marginTop: 5 }]}>
                                <MaterialCommunityIcons name="download-circle-outline" size={24} color="grey" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.separator} key={`separator-${index}`} />

                </>
            )
        }
    };

    if (Platform.OS === 'ios') {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>ideaCentre</Text>
                </View>

                <ScrollView
                    contentContainerStyle={styles.scrollView}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }>
                    <View style={styles.listContainer}>
                        <FlatList data={audioList} renderItem={renderItem} keyExtractor={(item) => item.name} />
                    </View>
                </ScrollView>
            </View>
        );
    } else if (Platform.OS === 'web') {
        return (
            <View style={styles.websiteContainer}>
                <View style={styles.topBar}>

                    <Text style={styles.topBarText}>ideaCentre</Text>
                </View>
                <View style={styles.websiteListContainer}>
                    <FlatList data={audioList} renderItem={renderItem} keyExtractor={(item) => item.name} />
                </View>
                <TouchableOpacity onPress={handleSignOut} style={[styles.websiteSignOutButton]}>
                    <Text style={styles.buttonText}>Sign out</Text>
                </TouchableOpacity>
            </View>
        );
    }
};

const styles = StyleSheet.create({
    container: {

        flex: 1,
        backgroundColor: '#F7F7F7',
    },
    listContainer: {
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    itemContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 16,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    itemName: {
        fontSize: 18,
        fontWeight: '500',
        marginLeft: 16,
    },
    itemButtonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    itemButton: {
        marginLeft: 16,
    },
    separator: {
        height: 1,
        backgroundColor: '#E5E5E5',
    },
    websiteContainer: {
        marginTop: 0,
        flex: 1,
        alignContent: 'center'
    },
    websiteListContainer: {
        flex: 1,
        alignItems: 'stretch',
        alignContent: 'center',
        width: '100%',
        marginTop: 60,

    },
    websiteItemContainer: {
        width: '100%',
        paddingHorizontal: 5,
        alignContent: 'center',
        flexDirection: 'row',
        alignItems: 'stretch',
        paddingVertical: 10,
    },
    websiteSignOutButton: {
        backgroundColor: "#0782F9",
        width: "20%",
        padding: 15,
        borderRadius: 10,
        bottom: 60,
        alignItems: "center",
        marginLeft: 800,
    },
    topBar: {
        backgroundColor: '#0782F9',
        height: 75,
        alignItems: 'center',
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    topBarText: {
        color: "white",
        fontWeight: "700",
        fontSize: 45,
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
});

