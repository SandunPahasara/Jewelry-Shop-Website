// checkout.js - Firebase-integrated checkout logic with order saving
import { db, auth } from "./components/firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";
import { doc, getDoc, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

let currentUser = null;

// ─── Read cart from localStorage ───────────────────────────────────────────
function getCart() {
    try { return JSON.parse(localStorage.getItem('jewelry_cart') || '[]'); }
    catch { return []; }
}

// ─── Populate Order Summary ─────────────────────────────────────────────────
function renderOrderSummary() {
    const cart = getCart();
    const listEl     = document.getElementById('orderItemsList');
    const subtotalEl = document.getElementById('summarySubtotal');
    const totalEl    = document.getElementById('summaryTotal');
    const emptyMsg   = document.getElementById('emptyCartMessage');
    const shippingCard = document.getElementById('shippingCard');
    const paymentCard  = document.getElementById('paymentCard');
    const placeBtn     = document.getElementById('placeOrderBtn');

    if (cart.length === 0) {
        emptyMsg.style.display = 'block';
        if (shippingCard) shippingCard.style.display = 'none';
        if (paymentCard)  paymentCard.style.display  = 'none';
        if (placeBtn)     placeBtn.style.display      = 'none';
        listEl.innerHTML = '';
        subtotalEl.textContent = '$0.00';
        totalEl.textContent    = '$0.00';
        return;
    }

    emptyMsg.style.display = 'none';
    listEl.innerHTML = '';

    let subtotal = 0;

    cart.forEach(item => {
        subtotal += item.price * item.quantity;
        const el = document.createElement('div');
        el.className = 'order-item';
        const imgHtml = item.image
            ? `<img src="${item.image}" alt="${item.name}">`
            : `<i class="fas fa-gem" style="font-size:1.6rem;color:#d4af37;"></i>`;
        el.innerHTML = `
            <div class="order-item-img">
                ${imgHtml}
                <div class="item-qty-badge">${item.quantity}</div>
            </div>
            <div>
                <div class="order-item-name">${item.name}</div>
                <div class="order-item-cat">${item.category || 'Jewelry'}</div>
            </div>
            <div class="order-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
        `;
        listEl.appendChild(el);
    });

    subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    totalEl.textContent    = `$${subtotal.toFixed(2)}`;
}

// ─── Load user profile from Firebase ───────────────────────────────────────
async function loadUserProfile(user) {
    try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        const data = snap.exists() ? snap.data() : {};

        const nameEl  = document.getElementById('shipName');
        const phoneEl = document.getElementById('shipPhone');
        const emailEl = document.getElementById('shipEmail');
        const addrEl  = document.getElementById('shipAddress');
        const noteEl  = document.getElementById('profileLoadedNote');

        if (data.name)    nameEl.value  = data.name;
        if (data.phone)   phoneEl.value = data.phone;
        if (user.email)   emailEl.value = user.email;
        if (data.address) addrEl.value  = data.address;

        if (data.name || data.phone || data.address) {
            noteEl.style.display = 'flex';
        }
    } catch (e) {
        console.warn('Could not load profile:', e);
    }
}

// ─── Save order to Firestore ────────────────────────────────────────────────
async function saveOrderToFirestore(orderData) {
    try {
        if (currentUser) {
            // Save under users/{uid}/orders
            await addDoc(collection(db, 'users', currentUser.uid, 'orders'), {
                ...orderData,
                createdAt: serverTimestamp()
            });
            console.log('Order saved to user history:', orderData.orderNumber);
        }
        // Also save to global orders collection for admin view
        await addDoc(collection(db, 'orders'), {
            ...orderData,
            userId: currentUser ? currentUser.uid : 'guest',
            createdAt: serverTimestamp()
        });
        console.log('Order saved to global orders:', orderData.orderNumber);
    } catch (e) {
        console.warn('Could not save order to Firestore:', e);
    }
}

// Expose to non-module inline script
window.saveOrderToFirestore = saveOrderToFirestore;

// ─── Auth listener ──────────────────────────────────────────────────────────
onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    if (user) {
        await loadUserProfile(user);
    }
});

// ─── Init ───────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    renderOrderSummary();
});
