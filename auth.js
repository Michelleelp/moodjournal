// Firebase Authentication and user-profile helpers shared across all pages.
import { auth, db } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";
import {
  doc,
  serverTimestamp,
  setDoc
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";

// Keep guest mode as the initial state until Firebase restores the signed-in user.
window.isLoggedIn = false;
window.currentUser = null;

// Mirror Firebase auth state globally and notify page features such as the navbar and journal.
onAuthStateChanged(auth, (user) => {
  window.currentUser = user;
  window.isLoggedIn = Boolean(user);
  document.dispatchEvent(new CustomEvent("moodjournal:auth-change", {
    detail: { user }
  }));
}, (error) => {
  console.error("[MoodJournal] Authentication state listener failed.", error);
});

// Create the account and its profile document; credentials are never written to Firestore.
export async function signUp(email, password) {
  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const user = credential.user;

    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp()
    });

    return user;
  } catch (error) {
    console.error("[MoodJournal] Account sign-up failed.", error);
    throw error;
  }
}

// Authenticate an existing account and merge its latest login time into the profile.
export async function logIn(email, password) {
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const user = credential.user;

    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      lastLogin: serverTimestamp()
    }, { merge: true });

    return user;
  } catch (error) {
    console.error("[MoodJournal] Account login failed.", error);
    throw error;
  }
}

// Sign out without changing UI state optimistically; the auth-state listener owns that state.
export async function logOut() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("[MoodJournal] Account logout failed.", error);
    throw error;
  }
}
