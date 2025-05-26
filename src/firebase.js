// src/firebase.js
import { initializeApp } from 'firebase/app'
import {
    getFirestore,
    collection,
    addDoc,
    query,
    where,
    getDocs,
    orderBy,
    onSnapshot,
    serverTimestamp
} from 'firebase/firestore'
import CryptoJS from 'crypto-js'

// ==== твоя конфігурація ====
const firebaseConfig = {
    apiKey:       import.meta.env.VITE_API_KEY_FIREBASE,
    authDomain:   import.meta.env.VITE_AUTH_DOMAIN,
    projectId:    import.meta.env.VITE_PROJECT_ID,
    storageBucket:import.meta.env.VITE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
    appId:        import.meta.env.VITE_APP_ID,
    measurementId: import.meta.env.VITE_MEASUREMENT_ID
}

const app = initializeApp(firebaseConfig)
const db  = getFirestore(app)

// Функція для генерації дефолтної аватарки
function DEFAULT_AVATAR(id) {
    return `https://i.pravatar.cc/150?u=${id || Date.now()}`
}

// 1) Ручна реєстрація, без Firebase Storage
export async function manualSignUp(email, password, displayName) {
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('email', '==', email))
    const existing = await getDocs(q)
    if (!existing.empty) {
        throw new Error('Користувач із таким email вже існує')
    }

    const hashedPassword = CryptoJS.SHA256(password).toString()
    const userDocRef = await addDoc(usersRef, {
        email,
        hashedPassword,
        displayName,
        avatarUrl: DEFAULT_AVATAR(),
        createdAt: serverTimestamp()
    })

    return {
        id: userDocRef.id,
        email,
        displayName,
        avatarUrl: DEFAULT_AVATAR(userDocRef.id)
    }
}

// 2) Ручний логін
export async function manualLogin(email, password) {
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('email', '==', email))
    const snap = await getDocs(q)
    if (snap.empty) {
        throw new Error('Користувача не знайдено')
    }

    const docSnap = snap.docs[0]
    const data = docSnap.data()
    const hashedInput = CryptoJS.SHA256(password).toString()
    if (hashedInput !== data.hashedPassword) {
        throw new Error('Неправильний пароль')
    }

    return {
        id: docSnap.id,
        email: data.email,
        displayName: data.displayName,
        avatarUrl: data.avatarUrl
    }
}

// 3) Відправка повідомлення
export async function sendMessage({ userId, displayName, avatarUrl, text }) {
    return addDoc(collection(db, 'messages'), {
        userId,
        displayName,
        avatarUrl,
        text,
        timestamp: serverTimestamp()
    })
}

// 4) Підписка на повідомлення
export function subscribeMessages(callback) {
    const q = query(
        collection(db, 'messages'),
        orderBy('timestamp', 'asc')
    )
    return onSnapshot(q, snap => {
        const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        callback(msgs)
    })
}