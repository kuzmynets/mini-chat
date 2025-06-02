import { initializeApp } from 'firebase/app'
import {
    getFirestore,
    collection,
    addDoc,
    doc,
    getDoc,
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

// ===== Helper =====
function DEFAULT_AVATAR(id) {
    return `https://i.pravatar.cc/150?u=${id || Date.now()}`
}

// ===== Auth =====
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

// ===== Conversations & Participants =====
/** Створити нову бесіду */
export async function createConversation(name, type = 'direct') {
    const convRef = collection(db, 'conversations')
    const convDoc = await addDoc(convRef, {
        name,
        type,
        createdAt: serverTimestamp()
    })
    return { id: convDoc.id, name, type }
}

/** Додати учасника в бесіду */
export async function addParticipant(conversationId, userId) {
    const partRef = collection(db, 'participants')
    const partDoc = await addDoc(partRef, {
        conversationId,
        userId
    })
    return { id: partDoc.id, conversationId, userId }
}

/** Отримати всі бесіди користувача */
export async function getUserConversations(userId) {
    const partRef = collection(db, 'participants')
    const q = query(partRef, where('userId', '==', userId))
    const snap = await getDocs(q)
    const convIds = snap.docs.map(d => d.data().conversationId)
    const convs = []
    for (const id of convIds) {
        const ds = await getDoc(doc(db, 'conversations', id))
        if (ds.exists()) convs.push({ id, ...ds.data() })
    }
    return convs
}

// ===== Messages =====
/** Відправити повідомлення в глобальний чат */
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

/** Підписка на всі повідомлення глобально */
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

/** Відправити повідомлення в конкретну бесіду */
export async function sendMessageToConversation(conversationId, { userId, displayName, avatarUrl, text }) {
    return addDoc(collection(db, 'messages'), {
        conversationId,
        userId,
        displayName,
        avatarUrl,
        text,
        timestamp: serverTimestamp(),
        readBy: []
    })
}

/** Підписка на повідомлення конкретної бесіди */
export function subscribeConversationMessages(conversationId, cb) {
    const q = query(
        collection(db, 'messages'),
        where('conversationId', '==', conversationId),
        orderBy('timestamp', 'asc')
    )
    return onSnapshot(q, snap => {
        const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        cb(msgs)
    })
}

// ===== Message Utilities =====
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

// ===== Typing Indicator =====
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

export async function getUserByEmail(email) {
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('email', '==', email))
    const snap = await getDocs(q)
    if (snap.empty) throw new Error('Користувача з таким email не знайдено')
    const d = snap.docs[0]
    return { id: d.id, displayName: d.data().displayName }
}

export async function updateUserAvatar(userId, avatarUrl) {
    const userRef = doc(db, 'users', userId)
    await updateDoc(userRef, { avatarUrl })
    return avatarUrl
}

export async function getConversationParticipants(conversationId) {
    const q = query(collection(db,'participants'), where('conversationId','==',conversationId))
    const snap = await getDocs(q)
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}
export async function getUserById(userId) {
    const d = await getDoc(doc(db,'users',userId))
    return { id: d.id, ...d.data() }
}