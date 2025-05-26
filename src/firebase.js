import { initializeApp } from 'firebase/app'
import {
    getFirestore,
    collection,
    addDoc,
    doc,
    getDocs,
    query,
    where,
    updateDoc,
    deleteDoc,
    orderBy,
    onSnapshot,
    serverTimestamp,
    arrayUnion
} from 'firebase/firestore'
import CryptoJS from 'crypto-js'

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

function DEFAULT_AVATAR(id) {
    return `https://i.pravatar.cc/150?u=${id || Date.now()}`
}

export async function manualSignUp(email, password, displayName) {
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('email', '==', email))
    const existing = await getDocs(q)
    if (!existing.empty) throw new Error('Email уже використовується')

    const hashedPassword = CryptoJS.SHA256(password).toString()
    const userDoc = await addDoc(usersRef, {
        email,
        hashedPassword,
        displayName,
        avatarUrl: DEFAULT_AVATAR(),
        isTyping: false,
        createdAt: serverTimestamp()
    })

    return {
        id: userDoc.id,
        email,
        displayName,
        avatarUrl: DEFAULT_AVATAR(userDoc.id)
    }
}

export async function manualLogin(email, password) {
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('email', '==', email))
    const snap = await getDocs(q)
    if (snap.empty) throw new Error('Користувача не знайдено')

    const docSnap = snap.docs[0]
    const data = docSnap.data()
    const hashedInput = CryptoJS.SHA256(password).toString()
    if (hashedInput !== data.hashedPassword) throw new Error('Неправильний пароль')

    return {
        id: docSnap.id,
        email: data.email,
        displayName: data.displayName,
        avatarUrl: data.avatarUrl
    }
}

export async function updateUserAvatar(userId, avatarUrl) {
    const userRef = doc(db, 'users', userId)
    await updateDoc(userRef, { avatarUrl })
    return avatarUrl
}

export async function sendMessage({ userId, displayName, avatarUrl, text }) {
    return addDoc(collection(db, 'messages'), {
        userId,
        displayName,
        avatarUrl,
        text,
        timestamp: serverTimestamp(),
        readBy: []
    })
}

export function subscribeMessages(cb) {
    const q = query(
        collection(db, 'messages'),
        orderBy('timestamp', 'asc')
    )
    return onSnapshot(q, snap => {
        const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        cb(msgs)
    })
}

export async function markMessageRead(msgId, readerName) {
    const msgRef = doc(db, 'messages', msgId)
    await updateDoc(msgRef, { readBy: arrayUnion(readerName) })
}

export async function updateMessage(msgId, newText) {
    const msgRef = doc(db, 'messages', msgId)
    await updateDoc(msgRef, { text: newText, edited: true })
}

export async function deleteMessage(msgId) {
    const msgRef = doc(db, 'messages', msgId)
    await deleteDoc(msgRef)
}

export async function setUserTyping(userId, isTyping) {
    const userRef = doc(db, 'users', userId)
    await updateDoc(userRef, { isTyping })
}

export function subscribeTyping(callback) {
    const q = query(
        collection(db, 'users'),
        where('isTyping', '==', true)
    )
    return onSnapshot(q, snap => {
        const typingUsers = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        callback(typingUsers)
    })
}
