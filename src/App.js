import React, { useRef, useState } from 'react';
import './App.css';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/analytics';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  apiKey: "AIzaSyAmKyXdukf8F12kTrsKxV2hir392bOSm9Y",
  authDomain: "firechat-ff1ae.firebaseapp.com",
  projectId: "firechat-ff1ae",
  storageBucket: "firechat-ff1ae.appspot.com",
  messagingSenderId: "964382723129",
  appId: "1:964382723129:web:371789ca142bc106b751e8",
  measurementId: "G-1VE3ESFK4X"
});

const auth = firebase.auth();
const firestore = firebase.firestore();


function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>FIRECHAT</h1>
        <SignOut />
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>

    </div>
  );
}

// SIGN IN 
function SignIn() {
  const SignInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }
  return (
    <button onClick={SignInWithGoogle}>Sign in via Google</button>
  )
}

function SignOut() {
  return auth.currentUser && (
    <button onClick={() => auth.signOut()}>Sign out</button>
  )
}

// CHATROOM 
function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);

  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('');


  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }
  return (
    <>
      <main>

        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

        <span ref={dummy}></span>

      </main>

      <form onSubmit={sendMessage}>

        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="say something nice" />

        <button type="submit" disabled={!formValue}>🕊️</button>

      </form>

    </>
  )
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (<>
    <div className={`message ${messageClass}`}>
      <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} />
      <p>{text}</p>
    </div>
  </>)
}



export default App;
