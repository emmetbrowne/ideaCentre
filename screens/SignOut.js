import React from "react";
import { KeyboardAvoidingView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import firebase from "firebase";
import auth from "../firebase/auth";
import 'firebase/storage'

export default function SigOut() {

    const handleSignOut = async () => {
        await auth.signOut();
        navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
        });
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>ideaCentre</Text>
            </View>
            <View style={styles.centeredView}>
                <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
                    <Text style={styles.buttonText}>Sign out</Text>
                </TouchableOpacity>
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
        marginTop: 150,
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
    signOutButton: {
        backgroundColor: "#0782F9",
        width: "60%",
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 150,
        position: "absolute",

    },
    buttonText: {
        color: "white",
        fontWeight: "700",
        fontSize: 16,
    },
});