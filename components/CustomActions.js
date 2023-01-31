import { TouchableOpacity, StyleSheet, Text, View, Image } from 'react-native';
import React from 'react'; import PropTypes from 'prop-types';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useActionSheet } from '@expo/react-native-action-sheet';

export default function CustomActions(props) {
    const { showActionSheetWithOptions } = useActionSheet();

    //If permission is granted, the user will have acess to image library to upload images
    const pickImage = async () => {
        const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
        try {
            if (status === 'granted') {
                let result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: 'Images',
                }).catch(error => console.log('Image Library Permissions', error));

                if (!result.canceled) {
                    const imageUri = await uploadImageFetch(result.uri);
                    props.onSend({ image: imageUri });
                }
            }
        } catch (error) {
            console.log('pickImage() customActions.js', error)
        }
    };

    // Launch device's camera if permission granted to allow users to take a picture
    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();

        try {
            if (status === 'granted') {
                let result = await ImagePicker.launchCameraAsync({
                    base64: true,
                    quality: 1
                }).catch(error => console.log('Camera Permissions', error));

                if (!result.canceled) {
                    const imageUri = await uploadImage(result.assets[0].uri);
                    props.onSend({ image: imageUri });
                }
            }
        } catch (error) {
            console.log('takePhoto() customActions.js', error)
        }
    };

    // Get device's location if permission is granted, set the result to location state
    const getLocation = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        try {
            if (status === 'granted') {
                let result = await Location.getCurrentPositionAsync({})
                    .catch(error => console.log('Location Permissions', error));

                if (result) {
                    props.onSend({
                        location: {
                            latitude: result.coords.latitude,
                            longitude: result.coords.longitude,
                        }
                    });
                }
            }
        } catch (error) {
            console.error('getLocation', error);
        }
    };

    // Creates an ActionSheet that diesplays a set of defined actions. 
    // When a user selects on of these actions, a method for performing that action is called.
    onActionPress = () => {
        const options = [
            'Choose From Library',
            'Take Picture',
            'Send Location',
            'Cancel'
        ];
        const cancelButtonIndex = options.length - 1;
        this.context.actionSheet().showActionSheetWithOptions(
            {
                options,
                cancelButtonIndex,
            },
            async (buttonIndex) => {
                switch (buttonIndex) {
                    case 0:
                        console.log('user wants to pick an image');
                        return;
                    case 1:
                        console.log('user wants to take a photo');
                        return;
                    case 2:
                        console.log('user wants to get their location');
                    default:
                }
            },
        );
    };

    return (
        <TouchableOpacity
            style={[styles.container]}
            onPress={onActionPress}
            accessible={true}
            accessibilityLabel='More communication options'
            accesibilityHint='Lets you choose to send an image of your location'
        >
            <View style={[styles.wrapper, props.wrapperStyle]}>
                <Text style={[styles.iconText, props.iconTextStyle]}>+</Text>
            </View>
        </TouchableOpacity>
    )
}


const styles = StyleSheet.create({
    container: {
        width: 26,
        height: 26,
        marginLeft: 10,
        marginBottom: 10,
    },
    wrapper: {
        borderRadius: 13,
        borderColor: '#b2b2b2',
        borderWidth: 2,
        flex: 1,
    },
    iconText: {
        color: '#b2b2b2',
        fontWeight: 'bold',
        fontSize: 16,
        backgroundColor: 'transparent',
        textAlign: 'center',
    },
});

CustomActions.contextTypes = {
    actionSheet: PropTypes.func,
};