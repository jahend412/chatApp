import React from 'react';
import { View, Text, Button, TextInput, StyleSheet, Platform, KeyboardAvoidingView } from 'react-native';
import { GiftedChat, Bubble, } from 'react-native-gifted-chat';

// add firebase to the project
const firebase = require('firebase');
require('firebase/firestore');

export default class Chat extends React.Component {
  constructor() {
    super();
    this.state = {
      messages: [],
    }

    // Firebase configuration to connect to Firestore.  This is still in the constructor of Chat
    if (!firebase.apps.length) {
      firebase.initializeApp({
        apiKey: "AIzaSyC75WkpeAQJT66mor_dBNlU4zXWT_y0gvY",
        authDomain: "chatapp-6684f.firebaseapp.com",
        projectId: "chatapp-6684f",
        storageBucket: "chatapp-6684f.appspot.com",
        messagingSenderId: "9893667023",
        appId: "1:9893667023:web:c85fd560371ab7c4cf97ba",
        measurementId: "G-P4GH22N8PM"
      });
    }

    // Create a reference to 'messages' collection in firebase
    this.referenceChatMessages = firebase.firestore().collection('messages');
  }


  componentDidMount() {
    let name = this.props.route.params.name;
    this.props.navigation.setOptions({ title: name });

    // set messages state with a message to see UI elements
    this.setState({
      messages: [
        {
          _id: 1,
          text: 'Hello developer',
          // Create a timestamp
          createAt: new Date(),
          user: {
            _id: 2,
            name: 'React Native',
            avatar: 'https://placeimg.com/140/140/any',
          },
        },
        {
          _id: 2,
          text: 'This is a system message',
          createdAt: new Date(),
          system: true,
        },
      ],
    })
  }

  onSend(messages = []) {
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, messages),
    }))
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

  render() {
    let color = this.props.route.params.color;
    return (
      <View style={[styles.container, { backgroundColor: color }]}>
        <GiftedChat
          renderBubble={this.renderBubble.bind(this)}
          messages={this.state.messages}
          onSend={(messages) => this.onSend(messages)}
          user={{
            _id: 1,
          }}
          // Allow accessiblity for those who require Screen Readers
          accessible={true}
          accessibilityLabel='Text message input field'
          accessibilityHint='You can type your message here and then you can send it by pressing the button located to the right.'
        />
        <Button
          title="Go to Start"
          onPress={() => this.props.navigation.navigate("Start")}
        />

        {
          //Keyboard fix on android
          Platform.OS === 'android' ? (
            <KeyboardAvoidingView behavior='height' />
          ) : null
        }
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
})
