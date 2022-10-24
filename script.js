import { initializeApp } from "https://www.gstatic.com/firebasejs/9.9.4/firebase-app.js";
import * as rtdb from "https://www.gstatic.com/firebasejs/9.9.4/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAUOF74xC2NL36Zo3ZLprBg9aTPmNh9p6Q",
  authDomain: "twitter-7904b.firebaseapp.com",
  databaseURL: "https://twitter-7904b-default-rtdb.firebaseio.com",
  projectId: "twitter-7904b",
  storageBucket: "twitter-7904b.appspot.com",
  messagingSenderId: "210589624152",
  appId: "1:210589624152:web:611ae47132a49010a9672d",
  measurementId: "G-ZDXWM6N62X"
};
// Initialize Firebase

const app = initializeApp(firebaseConfig);
firebase.initializeApp(firebaseConfig);

//Checking database
let db = rtdb.getDatabase(app);

//sending a tweet
$("#stweet").on("click", ()=>{
  var userinfo=firebase.auth().currentUser;
  var tweetmessage = $("#newtweet").val();
  var posts = {
    author: {
      handle: userinfo.displayName,
      pic: userinfo.photoURL
    },
    content: tweetmessage,
    likes: 0,
    retweets: 0,
    timestamp: new Date().getTime()
  }
  let postsRef = tweetRef.push();
  postsRef.set(posts);


  const message = document.getElementById('newtweet');
  message.value='';
});

let renderedTweetLikeLookup = {};
//rendering tweet
let renderTweet = (tObj,uuid)=>{
  $("#posts").prepend(`
<div class="card mb-3 tweet" style="max-width: 540px;">
  <div class="row g-0">
    <div class="col-md-4 mt-5">
      <img src="${tObj.author.pic}" class="img-fluid rounded-start" alt="...">
    </div>
    <div class="col-md-8">
      <div class="card-body">
        <h8 class="card-title">${tObj.author.handle}</h8>
        <p class="card-text">${tObj.content}</p>
        <p class="card-text"><small class="text-muted">Posted at: ${new Date(tObj.timestamp).toLocaleString()}</small></p>
        <p href="#" class="btn btn-success likebutton" data-tweetid="${uuid}">${tObj.likes} Likes</p>
      </div>
    </div>
  </div>
</div>
  `);
  renderedTweetLikeLookup[uuid] = tObj.likes;
  firebase.database().ref("/posts").child(uuid).child("likes").on("value", ss=>{
    renderedTweetLikeLookup[uuid]= ss.val();
    $(`.likebutton[data-tweetid=${uuid}]`).html(`${renderedTweetLikeLookup[uuid]} Likes`);
    console.log(renderedTweetLikeLookup[uuid]);
  })
}
let tweetRef = firebase.database().ref("/posts");

let toggleLike = (tweetRef, uid)=> {
  tweetRef.transaction((tObj) => {
    console.log(tObj);
    if (tObj) {
      if(tObj.likes && tObj.liked_by_user && tObj.liked_by_user.hasOwnProperty(uid)){
        tObj.likes--;
        tObj.liked_by_user[uid] = null;
      } else {
        tObj.likes++;
        if (!tObj.liked_by_user) {
          tObj.liked_by_user = {};
        }
        tObj.liked_by_user[uid] = true;
      }
    }
    return tObj;
  });
}
// Firebase Authentication 
firebase.auth().onAuthStateChanged(user => {
  console.log(user);
  if(!user){
    renderLogin();
  }
  else{
    renderPage(user);
  }
});
// Render Login
let renderLogin = ()=>{
  $("#clogin").on("click", ()=>{
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithRedirect(provider);
  });
}
// Render TwitterPage/Tweets
let renderPage = (loggedIn)=>{
  $("#userinfo").html(`
    <h id="handle">Handle: ${loggedIn.displayName}</h>
    <h id="uid">UID: ${loggedIn.uid}</h>
    <img id="userImage" src="$(loggedIn.photoURL)"></img>
  `);
  $(".button-login").hide();
  $(".button-logout").show();
  $(".button-tweet").show();
  $(".button-support").show();
  $("#posts").show();
  $("#clogout").on("click", ()=>{
    firebase.auth().signOut();
    history.go(0); //refreshes the page after you signout
  });
  tweetRef.on("child_added", (ss)=>{    
    const user = firebase.auth().currentUser; 
    let tObj = ss.val();
    let uuid = ss.key;      
    renderTweet(tObj,uuid);
    $(".likebutton").off("click");
    $(".likebutton").on("click", (evt)=>{
      let clickedTweet = $(evt.currentTarget).attr("data-tweetid");
      let tweetRef = firebase.database().ref("/posts").child(clickedTweet);
      toggleLike(tweetRef, user.uid);
    });
  });
};


//button setup
$(".message").hide();
$(".button-logout").hide();
$(".button-tweet").hide();
$(".button-support").hide();
$("#posts").hide();

$("#ctweet").on('click', ()=>{
  $(".button-tweet").hide();
  $(".message").show();
});
//Login screen
$("#clogin").on('click', ()=>{
  $(".button-login").hide();
  $(".button-tweet").hide();
  $(".login").show();
});


