import React, { useState, useEffect } from 'react';
import {
    StyleSheet, FlatList, Text, TouchableOpacity, View, Button, StatusBar,
} from "react-native";
import { Table, Row } from 'react-native-table-component';
import firebase from "firebase";
import auth from "../firebase/auth";
import 'firebase/storage'

export default function AudioTable({ navigation }) {
    const [audioList, setAudioList] = useState([]);
    const [tableData, setTableData] = useState([]);

    const handleSignOut = () => {
        auth
            .signOut()
            .then(() => {
                navigation.navigate("Login");
            })
            .catch((error) => alert(error.message));
    };

    useEffect(() => {
        // Fetch audio files for the logged-in user
        const userId = firebase.auth().currentUser.userID;
        console.log("Current User: ", userId);
        const storageRef = firebase.storage().ref().child(`audio/${userId}/audio`);
        storageRef.listAll().then(res => {
            const promises = res.items.map(item => item.getDownloadURL());
            Promise.all(promises).then(urls => {
                setAudioList(urls);
                console.log("Audio List: ", audioList);
            });
        }).catch(error => {
            console.log(error);
        });
    }, []);

    useEffect(() => {
        // Generate table data
        const data = audioList.map((audioUrl, index) => {
            return [index + 1, audioUrl];
        });
        setTableData(data);
    }, [audioList]);

    const tableHeader = ['No.', 'Audio URL'];

    return (
        <View style={styles.container}>
            <Table borderStyle={{ borderWidth: 1 }}>
                <Row data={tableHeader} style={styles.header} textStyle={styles.headerText} />
                {
                    tableData.map((rowData, index) => (
                        <Row
                            key={index}
                            data={rowData}
                            style={[styles.row, index % 2 && { backgroundColor: '#F7F6E7' }]}
                            textStyle={styles.rowText}
                        />
                    ))
                }
            </Table>
            <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
                <Text style={styles.buttonText}>Sign out</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        paddingTop: 30,
    },
    rowText: {
        textAlign: 'center'
    },
    row: {
        height: 30
    },
    headerText: {
        textAlign: 'center',
        fontWeight: 'bold'
    },
    header: {
        height: 40,
        backgroundColor: '#f1f8ff'
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
