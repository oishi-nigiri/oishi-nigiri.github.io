import { ref, computed } from "vue";
import { getDb, getFirebaseAuth } from "./useFirebase";
import { doc, getDoc, addDoc, collection } from "firebase/firestore";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from "firebase/auth";
import { ADMIN_IDS } from "./useFirebase";

const user = ref(null);
const isAdmin = ref(false);
const isSuperAdmin = ref(false);
const permissions = ref({});
const auth = getFirebaseAuth();

export function useAuth() {
  const logLoginEvent = async (
    userIdentifier,
    type,
    method,
    success = true
  ) => {
    try {
      const db = getDb();
      await addDoc(collection(db, "login_events"), {
        user: userIdentifier,
        type: type,
        method: method,
        success: success,
        timestamp: new Date().toISOString(),
        ip: null, // Could be added later with a service
        userAgent: navigator.userAgent,
      });
    } catch (error) {
      console.error(
        "Erreur lors de l'enregistrement de l'événement de connexion:",
        error
      );
    }
  };

  const loginWithEmail = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      // Log successful login
      await logLoginEvent(
        userCredential.user.email,
        "Connexion réussie",
        "email"
      );
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error("Erreur de connexion email:", error);
      // Log failed login attempt
      await logLoginEvent(email, "Échec de connexion", "email", false);
      return { success: false, error: error.message };
    }
  };

  const registerWithEmail = async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error("Erreur d'inscription:", error);
      return { success: false, error: error.message };
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      // Log successful login
      await logLoginEvent(result.user.email, "Connexion réussie", "google");
      return { success: true, user: result.user };
    } catch (error) {
      console.error("Erreur de connexion Google:", error);
      // Log failed login attempt
      await logLoginEvent(
        "unknown",
        "Échec de connexion Google",
        "google",
        false
      );
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      localStorage.removeItem("isAdmin");
      localStorage.removeItem("adminPermissions");
      localStorage.removeItem("isSuperAdmin");
      user.value = null;
      isAdmin.value = false;
      isSuperAdmin.value = false;
      permissions.value = {};
      window.location.reload();
    } catch (error) {
      console.error("Erreur de déconnexion:", error);
    }
  };

  const checkAuth = () => {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        unsubscribe();
        if (firebaseUser) {
          user.value = firebaseUser;
          const adminStatus = await checkAdminStatus(firebaseUser.uid);
          resolve(adminStatus);
        } else {
          user.value = null;
          isAdmin.value = false;
          isSuperAdmin.value = false;
          permissions.value = {};
          resolve(false);
        }
      });
    });
  };

  const isSuperAdminCheck = (userId) => {
    const userIdString = String(userId);
    return ADMIN_IDS.includes(userIdString);
  };

  const checkAdminStatus = async (userId) => {
    if (!userId || !user.value) return false;

    try {
      const userIdString = String(userId);
      const userEmail = user.value.email;

      if (isSuperAdminCheck(userIdString)) {
        permissions.value = {
          menu: true,
          team: true,
          sales: true,
          employees: true,
          ranks: true,
          admins: true,
        };
        localStorage.setItem(
          "adminPermissions",
          JSON.stringify(permissions.value)
        );
        localStorage.setItem("isSuperAdmin", "true");
        isSuperAdmin.value = true;
        isAdmin.value = true;
        return true;
      }

      const db = getDb();

      // First try to find admin by email (new Firebase system)
      if (userEmail) {
        const adminDocByEmail = await getDoc(doc(db, "admins", userEmail));
        if (adminDocByEmail.exists()) {
          const adminData = adminDocByEmail.data();
          if (adminData.isAdmin === true) {
            permissions.value = adminData.permissions || {};
            localStorage.setItem(
              "adminPermissions",
              JSON.stringify(permissions.value)
            );
            localStorage.setItem("isSuperAdmin", "false");
            isSuperAdmin.value = false;
            isAdmin.value = true;
            return true;
          }
        }
      }

      // Fallback: try to find admin by userId (legacy Discord system)
      const adminDocById = await getDoc(doc(db, "admins", userIdString));
      if (adminDocById.exists()) {
        const adminData = adminDocById.data();
        if (adminData.isAdmin === true) {
          permissions.value = adminData.permissions || {};
          localStorage.setItem(
            "adminPermissions",
            JSON.stringify(permissions.value)
          );
          localStorage.setItem("isSuperAdmin", "false");
          isSuperAdmin.value = false;
          isAdmin.value = true;
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error("Erreur lors de la vérification du statut admin:", error);
      return false;
    }
  };

  const hasPermission = (section) => {
    if (isSuperAdmin.value) return true;

    const permissionsStr = localStorage.getItem("adminPermissions");
    if (!permissionsStr) return false;

    try {
      const perms = JSON.parse(permissionsStr);
      return perms[section] === true;
    } catch (error) {
      return false;
    }
  };

  const getAvatarUrl = (user) => {
    if (!user || !user.photoURL) {
      return "https://cdn.discordapp.com/embed/avatars/0.png"; // Default avatar
    }
    return user.photoURL;
  };

  const getUsername = (user) => {
    if (!user) return "";
    return user.displayName || user.email || "Utilisateur";
  };

  return {
    user: computed(() => user.value),
    isAdmin: computed(() => isAdmin.value),
    isSuperAdmin: computed(() => isSuperAdmin.value),
    permissions: computed(() => permissions.value),
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    logout,
    checkAuth,
    hasPermission,
    getAvatarUrl,
    getUsername,
  };
}
