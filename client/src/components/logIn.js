import React from 'react';
import LoggedIn from './loggedIn.js'
import firebase from "firebase/app";
import Genres from "./genres.js"

// Add the Firebase services that you want to use
import "firebase/auth";
import "firebase/firestore";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// Enter Firebase Configuration here
const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  measurementId: ""
};


// Initialize Firebase
firebase.initializeApp(firebaseConfig);


export class LogIn extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            loggedIn: false,
            email: '',
            password: ''
        };
        this.handleEmailChange = this.handleEmailChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
        this.handleLogIn = this.handleLogIn.bind(this);
        this.handleSignUp = this.handleSignUp.bind(this);
        this.handleLogOut = this.handleLogOut.bind(this);
        this.handleGoogleLogIn = this.handleGoogleLogIn.bind(this);
      }
    
      handleEmailChange(e) {    
          this.setState({email: e.target.value});  
      }

      handlePasswordChange(e) {
          this.setState({password: e.target.value});
      }
      
      async handleLogIn(e) {

        const user = await firebase
          .auth()
          .signInWithEmailAndPassword(this.state.email, this.state.password)
            .then(({user}) => {
              user.getIdToken().then((idToken) => {
                console.log(JSON.stringify({ idToken }));
              })

              this.setState({loggedIn: true});
          })
          .catch((error) => {
            alert("Error" + error.code + "has occured");
            console.log("The following error occured while loggin in")
            console.log(error.message)
          });
      }

      async handleSignUp(e){
        e.preventDefault();

        const user = await firebase
          .auth()
          .createUserWithEmailAndPassword(this.state.email, this.state.password)
          .then((user) => {
              alert("New User Created");
              console.log(JSON.stringify(user));
          })
          .catch((error) => {
            alert("Error" + error.code + "has occured");
            console.log("The following error occured while signing up")
            console.log(error.message)
          });
      }

      async handleLogOut(e){
          e.preventDefault();

          firebase.auth()
          .signOut()
          .then(() => {
              console.log("User signed out successfully")
              this.setState({loggedIn: false});
          })
          .catch((error) => {
            alert("Error" + error.code + "has occured");
            console.log("The following error occured while loggin out")
            console.log(error.message)
          });
      }

      async handleGoogleLogIn(e){
          e.preventDefault();
          const provider = new firebase.auth.GoogleAuthProvider();
          firebase.auth()
          .signInWithPopup(provider)
          .then((result) => {
          
            /** @type {firebase.auth.OAuthCredential} */
            var credential = result.credential;
            // This gives you a Google Access Token. You can use it to access the Google API.
            var token = credential.accessToken;
            // The signed-in user info.
            var user = result.user;
            var objUser = { user };

            this.setState({loggedIn: true, email: user.email})
          })
          .catch((error) => {
            alert("Error" + error.code + "has occured");
            console.log("The following error occured while loggin in with Google account")
            console.log(error.message)
          })
      }
    
      render() {

        const homePage = (
            <form style={{marginTop: "20%"}}>
            <div className="container">
              <h1>Music App</h1>
              <div>
                <input type="text" 
                        placeholder="Enter Email" 
                        name="emailAcc"
                        value={this.state.email}
                        onChange={this.handleEmailChange}
                        />
                </div>
                <div>
                <input type="password" 
                       placeholder="Enter Password"  
                       name="psw"
                       value={this.state.password}
                       onChange={this.handlePasswordChange}
                       />
                </div>
            </div>
            <br></br>
            <button type="button" onClick={this.handleLogIn}>Log In</button>
            <button type="button" onClick={this.handleSignUp}>Sign Up</button>
            <div> 
                <button type="button" onClick={this.handleGoogleLogIn}>Log In With Google</button>
            </div>
            </form>

        );

        const loggedIn = (
            <div style={{height: "800px", width: "100%"}}>
            <div>User {this.state.email} is currently logged in.</div>
            <div>
            <button style={{marginLeft: "86%", width: "200px"}} type="button" onClick={this.handleLogOut}>Log Out</button>
            </div>
            <LoggedIn key={this.state.email} loggedInState={this.state.loggedIn} />
            </div>
        );


        if(!this.state.loggedIn){
            return (homePage);
        } else {
            return(loggedIn);
        }
      }

}

export default LogIn;


