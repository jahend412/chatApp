import React from 'react';
import { View, Text, StyleSheet, Platform, KeyboardAvoidingView } from 'react-native';
import { GiftedChat, Bubble, InputToolbar } from 'react-native-gifted-chat';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';

const firebase = require('firebase');
require('firebase/firestore');

export default class Chat extends React.Component {

  constructor() {
    super();
    this.state = {
      messages: [],
      uid: 0,
      user: {
        _id: '',
        avatar: '',
        name: ''
      },
      loggedInText: 'Please wait, you are getting logged in',
      image: null,
      location: null,
      isConnected: false
    }

    // Firebase configuration to connect to Firestore.  This is still in the constructor of Chat
    if (!firebase.apps.length) {
      firebase.initializeApp({
        // Insert your Firestore database credentials here!
        apiKey: "AIzaSyC75WkpeAQJT66mor_dBNlU4zXWT_y0gvY",
        authDomain: "chatapp-6684f.firebaseapp.com",
        projectId: "chatapp-6684f",
        storageBucket: "chatapp-6684f.appspot.com",
        messagingSenderId: "9893667023",
        appId: "1:9893667023:web:c85fd560371ab7c4cf97ba",
        measurementId: "G-P4GH22N8PM"
      });
    }
    this.referenceChatMessages = firebase.firestore().collection('messages');
  }

  //This will get messages locally from users device
  async getMessages() {
    let messages = '';
    try {
      messages = await AsyncStorage.getItem('messages') || [];
      this.setState({
        messages: JSON.parse(messages)
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  async saveMessages() {
    try {
      await AsyncStorage.setItem('messages', JSON.stringify(this.state.messages));
    } catch (error) {
      console.log(error.message);
    }
  }

  async deleteMessages() {
    try {
      await AsyncStorage.removeItem('messages');
      this.setState({
        messages: []
      })
    } catch (error) {
      console.log(error.message);
    }
  }

  componentDidMount() {
    // Set the name property to be included in the navigation bar
    let name = this.props.route.params.name;
    this.props.navigation.setOptions({ title: name });

    // Check connection status and use Firebase
    NetInfo.fetch().then((connection) => {
      if (connection.isConnected) {
        this.setState({
          isConnected: true,
        });
      } else {
        this.setState({
          isConnected: false,
        });
      }
    });

    // create a reference to "messages" collection in firebase
    this.referenceChatMessages = firebase.firestore().collection('messages');

    this.authUnsubscribe = firebase.auth().onAuthStateChanged((user) => {
      if (!user) {
        firebase.auth().signInAnonymously();
      }
      this.setState({
        uid: user.uid,
        messages: [],
        user: {
          _id: user.uid,
          name: name,
          avatar: "https://placeimg.com/140/140/any",
        },
      });
      this.unsubscribe = this.referenceChatMessages
        .orderBy('createdAt', 'desc')
        .onSnapshot(this.onCollectionUpdate);
    });
  }

  componentWillUnmount() {
    if (this.isConnected) {
      this.unsubscribe();
      this.authUnsubscribe();
    }
  }

  addMessage = () => {
    const message = this.state.messages[0];
    this.referenceChatMessages.add({
      uid: this.state.uid,
      _id: message._id,
      text: message.text || '',
      createdAt: message.createdAt,
      user: message.user
    });
  }

  onSend(messages = []) {
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, messages),
    }),
      () => {
        this.saveMessages();
        this.addMessage();
      }
    );
  }

  // Define the message bubbles style
  renderBubble(props) {
    return (
      <Bubble
        {...props}
        // Set message bubble color
        wrapperStyle={{
          left: {
            backgroundColor: '#90EE90'
          },
          right: {
            backgroundColor: '#FFD700'
          },
        }}
        // Set text color
        textStyle={{
          right: {
            color: '#000'
          }
        }}
        // Set Timestamp text color
        timeTextStyle={{
          right: {
            color: '#000'
          }
        }}
      />
    )
  }

  onCollectionUpdate = (querySnapshot) => {
    if (!this.state.isConnected) return;
    const messages = [];
    // go through each document
    querySnapshot.forEach((doc) => {
      // get the QueryDocumentSnapshot's data
      let data = doc.data();
      messages.push({
        _id: data._id,
        text: data.text,
        createdAt: data.createdAt.toDate(),
        user: {
          _id: data.user._id,
          name: data.user.name,
          avatar: data.user.avatar
        },
      });
    });
    this.setState({ messages });
  };

  // Render InputToolbar only when online 
  renderInputToolbar(props) {
    if (this.state.isConnected) {
      return <InputToolbar {...props} />;
    }
  }

  renderCustomActions = (props) => {
    return <CustomActions {...props} />;
  };

  renderCustomView(props) {
    const { currentMessage } = props;
    if (currentMessage.location) {
      return (
        <MapView
          style={{ width: 150, height: 100, borderRadius: 13, margin: 3 }}
          region={{
            latitude: currentMessage.location.latitude,
            longitude: currentMessage.location.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        />
      );
    }
    return null;
  }

  render() {
    let color = this.props.route.params.color;

    return (
      <ActionSheetProvider>
        <View style={[styles.container, { backgroundColor: color }]}>
          <GiftedChat
            renderBubble={this.renderBubble.bind(this)}
            renderInputToolbar={this.renderInputToolbar.bind(this)}
            messages={this.state.messages}
            onSend={(messages) => this.onSend(messages)}
            user={{
              _id: this.state.uid,
              avatar: 'https://placeimg.com/140/140/any'
            }}
            // Allow accessiblity for those who require Screen Readers
            accessible={true}
            accessibilityLabel='Text message input field'
            accessibilityHint='You can type your message here and then you can send it by pressing the button located to the right.'
          />

          {
            //Keyboard fix on android
            Platform.OS === 'android' ? (
              <KeyboardAvoidingView behavior='height' />
            ) : null
          }

        </View>
      </ActionSheetProvider>
    )
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1
  }
})
