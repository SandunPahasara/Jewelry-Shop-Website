import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";
import { auth, db } from "./firebase-config.js";

function getLocalProfileKey(uid) {
    return `luxe_profile_${uid}`;
}

window.AuthManager = class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        // Listen for auth state changes
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                // User is signed in
                this.currentUser = user;

                // Fetch additional user data from Firestore if needed
                try {
                    const userDoc = await getDoc(doc(db, "users", user.uid));
                    if (userDoc.exists()) {
                        this.currentUserData = userDoc.data();
                    } else {
                        this.currentUserData = {};
                    }

                    const localProfile = localStorage.getItem(getLocalProfileKey(user.uid));
                    if (localProfile) {
                        this.currentUserData = { ...this.currentUserData, ...JSON.parse(localProfile) };
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                    this.currentUserData = this.currentUserData || {};

                    const localProfile = localStorage.getItem(getLocalProfileKey(user.uid));
                    if (localProfile) {
                        try {
                            this.currentUserData = { ...this.currentUserData, ...JSON.parse(localProfile) };
                        } catch {
                            // Ignore malformed local data
                        }
                    }
                }

                app.ui.updateAuthUI(true, this.currentUser.email);
            } else {
                // User is signed out
                this.currentUser = null;
                this.currentUserData = null;
                app.ui.updateAuthUI(false);
            }
        });
    }

    async updateUserProfile(profileData) {
        if (!this.currentUser) return { success: false, error: "Not logged in" };
        
        try {
            await setDoc(doc(db, "users", this.currentUser.uid), profileData, { merge: true });
            
            // Update local cache
            if (!this.currentUserData) this.currentUserData = {};
            this.currentUserData = { ...this.currentUserData, ...profileData };
            localStorage.setItem(getLocalProfileKey(this.currentUser.uid), JSON.stringify(this.currentUserData));
            
            return { success: true };
        } catch (error) {
            console.error("Error updating profile:", error);
            // Fallback so the profile still works locally even if Firestore rules block the write
            if (error.code === 'permission-denied' || String(error.message).includes('Missing or insufficient permissions')) {
                if (!this.currentUserData) this.currentUserData = {};
                this.currentUserData = { ...this.currentUserData, ...profileData };
                localStorage.setItem(getLocalProfileKey(this.currentUser.uid), JSON.stringify(this.currentUserData));
                return {
                    success: true,
                    fallback: true,
                    message: 'Profile saved locally because Firestore rules are blocking writes.'
                };
            }
            return { success: false, error: error.message };
        }
    }

    async register(name, email, password) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Store extra user metadata in Firestore
            await setDoc(doc(db, "users", user.uid), {
                name: name,
                email: email,
                createdAt: new Date().toISOString()
            });

            localStorage.setItem(getLocalProfileKey(user.uid), JSON.stringify({
                name,
                email
            }));

            return { success: true, user };
        } catch (error) {
            console.error("Registration error:", error);
            return { success: false, error: error.message };
        }
    }

    async login(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            return { success: true, user: userCredential.user };
        } catch (error) {
            console.error("Login error:", error);
            return { success: false, error: error.message };
        }
    }

    async logout() {
        try {
            await signOut(auth);
            return { success: true };
        } catch (error) {
            console.error("Logout error:", error);
            return { success: false, error: error.message };
        }
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }
}
