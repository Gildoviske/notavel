import { initializeApp, deleteApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

// Valores do painel do Firebase (Configurações do projeto > Seus apps).
// Não são segredo: protegem com as regras do Firestore, não com sigilo desta config.
export const firebaseConfig = {
  apiKey: "AIzaSyDax3eQM9rROzP9Sw5OTtxd2TtpwDH4whM",
  authDomain: "notavel-a4c05.firebaseapp.com",
  projectId: "notavel-a4c05",
  storageBucket: "notavel-a4c05.firebasestorage.app",
  messagingSenderId: "674419117086",
  appId: "1:674419117086:web:4efff354e1addfeda5320f",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Firebase Auth exige um e-mail; login é por CPF, então mapeamos para um e-mail sintético.
export function cpfToEmail(cpf) {
  const digits = String(cpf || "").replace(/\D/g, "");
  return `cpf${digits}@notavel.app`;
}

export function maskCpf(cpf) {
  const digits = String(cpf || "").replace(/\D/g, "");
  if (digits.length < 4) return "•".repeat(digits.length);
  return "•".repeat(digits.length - 2) + digits.slice(-2);
}

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
}

export async function listUsers() {
  const q = query(collection(db, "users"), orderBy("createdAt", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
}

// Cria um novo usuário sem derrubar a sessão de quem está logado (admin),
// usando uma segunda instância isolada do app do Firebase.
export async function createUserAsAdmin({ cpf, displayName, password }) {
  const secondaryApp = initializeApp(firebaseConfig, "secondary-" + Date.now());
  const secondaryAuth = getAuth(secondaryApp);
  try {
    const email = cpfToEmail(cpf);
    const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    await setDoc(doc(db, "users", cred.user.uid), {
      cpf: String(cpf).replace(/\D/g, ""),
      displayName: displayName || "",
      role: "user",
      createdAt: serverTimestamp(),
    });
    await signOut(secondaryAuth);
  } finally {
    await deleteApp(secondaryApp);
  }
}

export {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  serverTimestamp,
};
