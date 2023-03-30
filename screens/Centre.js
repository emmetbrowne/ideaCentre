import React, { useState, useEffect } from 'react';
import {
    StyleSheet, FlatList, Text, TouchableOpacity, View, Button, StatusBar, ScrollView, RefreshControl
} from "react-native";
import { Table, Row } from 'react-native-table-component';
import firebase from "firebase";
import auth from "../firebase/auth";
import 'firebase/storage'
import { Audio } from 'expo-av';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';


export default function Centre() {
    const navigation = useNavigation();
    const [audioList, setAudioList] = useState([]);
    const [refreshing, setRefreshing] = React.useState(false);

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

    const handleDelete = () => {
        const userID = firebase.auth().currentUser.uid;
        const audioRef = firebase.storage().ref('audio/${userID}/${fileName}');

        audioRef.delete().then(() => {
            setAudioList((prevState) => prevState.filter((audio) => audio.name !== fileName));
        }).catch((error) => {
            console.error(error);
        });
    };

    const handleDownload = () => {

    }

    const playAudio = async (url) => {
        try {
            const soundObject = new Audio.Sound();
            await soundObject.loadAsync({ uri: url });
            await soundObject.playAsync();
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


    const renderItem = ({ item }) => {
        return (
            <View>
                <View style={styles.itemContainer}>
                    <View style={styles.itemInfo}>
                        <MaterialCommunityIcons name="folder-music-outline" size={24} color="grey" />
                        <Text style={styles.itemName}>{item.name}</Text>
                    </View>
                    <View style={styles.itemButtons}>
                        <TouchableOpacity onPress={() => handleDelete(item.name)} style={[styles.itemButton, { marginRight: 10 }]}>
                            <MaterialCommunityIcons name="delete-outline" size={24} color="grey" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => playAudio(item.url)} style={[styles.itemButton, { marginRight: 10 }]}>
                            <MaterialCommunityIcons name="play-circle-outline" size={24} color="grey" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDownload(item.name)} style={styles.itemButton}>
                            <MaterialCommunityIcons name="download-circle-outline" size={24} color="grey" />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.separator} />
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollView}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }>
                <View style={styles.listContainer}>
                    <FlatList data={audioList} renderItem={renderItem} keyExtractor={(item) => item.name} />
                </View>
            </ScrollView>
            <TouchableOpacity onPress={handleSignOut} style={[styles.signOutButton]}>
                <Text style={styles.buttonText}>Sign out</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    listContainer: {
        flex: 1,
        width: '100%',
        marginTop: 60,
    },
    itemContainer: {
        width: '85%',
        paddingHorizontal: 5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
    },
    itemInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    itemName: {
        marginLeft: 10,
        fontSize: 16,
    },
    itemButtons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    itemButton: {
        marginLeft: 15,
        marginRight: 10,
    },
    separator: {
        borderBottomWidth: 1,
        borderBottomColor: 'grey',
        width: '100%',
        marginTop: 10,
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
    buttonText: {
        color: "white",
        fontWeight: "700",
        fontSize: 16,
    },
    scrollView: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
