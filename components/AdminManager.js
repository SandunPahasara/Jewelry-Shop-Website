import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";
import { db, auth } from "./firebase-config.js";

// Cloudinary Configuration
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dfnk7xdza/image/upload";
const CLOUDINARY_UPLOAD_PRESET = "Jewelry_shop";

// DOM Elements
const loginView = document.getElementById('loginView');
const dashboardView = document.getElementById('dashboardView');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const addProductForm = document.getElementById('addProductForm');
const imageInput = document.getElementById('productImage');
const imagePreview = document.getElementById('imagePreview');
const submitProductBtn = document.getElementById('submitProductBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const adminProductsList = document.getElementById('adminProductsList');
const migrateDataBtn = document.getElementById('migrateDataBtn');
const addProductSection = document.getElementById('addProductSection');
const productFormTitle = document.getElementById('productFormTitle');
const editOverlay = document.getElementById('editOverlay');

// State for editing
let editingProductId = null;
let editingProductImageUrl = null;

function openEditPopup() {
    dashboardView.classList.add('edit-mode');
    addProductSection.classList.add('edit-popup-mode');
    document.body.classList.add('edit-lock-scroll');
    productFormTitle.textContent = 'Update Product';
}

function closeEditPopup() {
    dashboardView.classList.remove('edit-mode');
    addProductSection.classList.remove('edit-popup-mode');
    document.body.classList.remove('edit-lock-scroll');
    productFormTitle.textContent = 'Add New Product';
}

function bringEditSectionIntoView() {
    addProductSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => {
        const nameInput = document.getElementById('productName');
        if (nameInput) {
            nameInput.focus();
        }
    }, 250);
}

// ----------------------------------------------------
// Authentication Logic
// ----------------------------------------------------

// Check Auth State
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in — switch to dashboard and scroll to top
        loginView.classList.remove('active');
        dashboardView.classList.add('active');
        requestAnimationFrame(() => {
            window.scrollTo(0, 0);
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
        });
        loadProducts();
    } else {
        // User is signed out — switch to login and scroll to top
        dashboardView.classList.remove('active');
        loginView.classList.add('active');
        requestAnimationFrame(() => {
            window.scrollTo(0, 0);
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
        });
    }
});

// Login Form Submit
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;
    const errorMsg = document.getElementById('loginError');
    const submitBtn = loginForm.querySelector('button[type="submit"]');

    errorMsg.textContent = '';
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';

    try {
        await signInWithEmailAndPassword(auth, email, password);
        // onAuthStateChanged will handle the UI switch & scroll
    } catch (error) {
        errorMsg.textContent = 'Invalid email or password. Please try again.';
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
        console.error("Auth error:", error);
    }
});

// Logout
logoutBtn.addEventListener('click', () => {
    signOut(auth);
});

// ----------------------------------------------------
// Product Management (Image Upload via Cloudinary, Data via Firestore)
// ----------------------------------------------------

// Image Preview
imageInput.addEventListener('change', function () {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        }
        reader.readAsDataURL(file);
    } else {
        imagePreview.innerHTML = `<span>+ Select Image</span>`;
    }
});

// Helper to reset form state
function resetFormState() {
    addProductForm.reset();
    imagePreview.innerHTML = `<span>+ Select Image</span>`;
    submitProductBtn.innerHTML = '<i class="fas fa-plus"></i> Add Product';
    cancelEditBtn.style.display = 'none';
    editingProductId = null;
    editingProductImageUrl = null;
    closeEditPopup();
}

// Cancel Edit Button
cancelEditBtn.addEventListener('click', () => {
    resetFormState();
    document.getElementById('uploadStatus').textContent = "";
});

editOverlay.addEventListener('click', () => {
    resetFormState();
    document.getElementById('uploadStatus').textContent = "";
});


// Add or Update Product
addProductForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const statusMsg = document.getElementById('uploadStatus');
    const file = imageInput.files[0];

    // If adding a new product, image is required
    if (!editingProductId && !file) {
        statusMsg.style.color = 'red';
        statusMsg.textContent = "Please select an image for new products.";
        return;
    }

    // Disable button, show loading
    submitProductBtn.disabled = true;
    submitProductBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    statusMsg.style.color = '#ff9800';

    try {
        let imageUrl = editingProductImageUrl; // Default to existing image if editing

        // Only upload to Cloudinary if a NEW file is selected
        if (file) {
            statusMsg.textContent = "Uploading image...";
            
            // Try Cloudinary upload with fallback
            try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

            const cloudinaryRes = await fetch(CLOUDINARY_URL, {
                method: "POST",
                body: formData
            });

            const cloudinaryData = await cloudinaryRes.json();

                if (cloudinaryRes.ok && cloudinaryData.secure_url) {
                    imageUrl = cloudinaryData.secure_url;
                } else {
                    // If Cloudinary fails, use local file as data URL (fallback for local testing)
                    console.warn("Cloudinary upload failed, using local data URL");
                    const reader = new FileReader();
                    imageUrl = await new Promise((resolve) => {
                        reader.onload = (e) => resolve(e.target.result);
                        reader.readAsDataURL(file);
                    });
            }
            } catch (cloudinaryError) {
                console.warn("Cloudinary error, using local data URL:", cloudinaryError);
                const reader = new FileReader();
                imageUrl = await new Promise((resolve) => {
                    reader.onload = (e) => resolve(e.target.result);
                    reader.readAsDataURL(file);
                });
            }
        }

        statusMsg.textContent = "Saving to database...";

        // Provide data for Firestore
        const productData = {
            name: document.getElementById('productName').value,
            price: parseFloat(document.getElementById('productPrice').value),
            category: document.getElementById('productCategory').value,
            description: document.getElementById('productDescription').value,
            image: imageUrl,
            updatedAt: serverTimestamp() // track when it was last updated
        };

        if (editingProductId) {
            // Update existing product
            await updateDoc(doc(db, "products", editingProductId), productData);
            statusMsg.style.color = '#28a745';
            statusMsg.textContent = "Product updated successfully!";
        } else {
            // Add new product
            productData.createdAt = serverTimestamp();
            await addDoc(collection(db, "products"), productData);
            statusMsg.style.color = '#28a745';
            statusMsg.textContent = "Product added successfully!";
        }

        resetFormState();
        loadProducts();

    } catch (error) {
        console.error("Save error:", error);
        statusMsg.style.color = 'red';
        if (error.code === 'permission-denied' || String(error.message).includes('Missing or insufficient permissions')) {
            statusMsg.textContent = "Error: Firestore write blocked by rules. Open Firebase Console > Firestore Database > Rules and allow authenticated update/create/delete for products.";
        } else {
            statusMsg.textContent = "Error: " + error.message;
        }
    } finally {
        submitProductBtn.disabled = false;
        if (!editingProductId) {
            submitProductBtn.innerHTML = '<i class="fas fa-plus"></i> Add Product';
        } else {
            submitProductBtn.innerHTML = '<i class="fas fa-save"></i> Update Product';
        }

        setTimeout(() => {
            statusMsg.textContent = "";
        }, 3000);
    }
});

// Read Products (Populate Table)
async function loadProducts() {
    adminProductsList.innerHTML = '<tr><td colspan="5" style="text-align: center;">Loading...</td></tr>';

    try {
        const querySnapshot = await getDocs(collection(db, "products"));
        adminProductsList.innerHTML = '';

        if (querySnapshot.empty) {
            adminProductsList.innerHTML = '<tr><td colspan="5" style="text-align: center;">No products found. Add some above!</td></tr>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const product = doc.data();
            const tr = document.createElement('tr');

            // Format price
            const formatter = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
            });
            const priceFormatted = formatter.format(product.price);

            // Handle image source (could be local path for migrated, or http url for new)
            let imgSrc = product.image;
            if (!imgSrc.startsWith('http') && !imgSrc.includes('images/')) {
                imgSrc = 'images/' + imgSrc;
            }

            tr.innerHTML = `
                <td><img src="${imgSrc}" alt="${product.name}" onerror="this.src='images/Rings.jpg'"></td>
                <td><strong>${product.name}</strong></td>
                <td><span style="background: var(--bg-light); padding: 4px 8px; border-radius: 4px; font-size: 0.8rem;">${product.category}</span></td>
                <td>${priceFormatted}</td>
                <td>
                    <div style="display: flex; gap: 0.5rem;">
                        <button class="admin-btn primary edit-product-btn" 
                                data-id="${doc.id}" 
                                style="padding: 0.5rem 1rem; font-size: 0.8rem; width: auto; background-color: #28a745;">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="admin-btn danger delete-product-btn" 
                                data-id="${doc.id}">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </td>
            `;
            adminProductsList.appendChild(tr);
        });

        // Add event listeners to delete buttons
        document.querySelectorAll('.delete-product-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                if (confirm('Are you sure you want to delete this product?')) {
                    const id = e.currentTarget.getAttribute('data-id');
                    await deleteProduct(id);
                }
            });
        });

        // Add event listeners to edit buttons
        document.querySelectorAll('.edit-product-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                // Find product data from the array we just loaded (simplest way without refetching)
                // For a more robust app, you'd fetch it, but here we can just scrape from the current context or maintain an array locally.
                // Let's refetch from the doc just to be safe and clean
                editProduct(id);
            });
        });

    } catch (error) {
        console.error("Error loading products:", error);
        adminProductsList.innerHTML = `<tr><td colspan="5" style="text-align: center; color: red;">Error gathering data: ${error.message}</td></tr>`;
    }
}

// Delete Product
async function deleteProduct(id) {
    try {
        await deleteDoc(doc(db, "products", id));
        loadProducts(); // Refresh list
    } catch (error) {
        console.error("Error deleting document: ", error);
        alert("Failed to delete product. " + error.message);
    }
}

// Prepare Edit State
async function editProduct(id) {
    try {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const product = docSnap.data();

            // Set state
            editingProductId = id;
            editingProductImageUrl = product.image;

            // Populate form
            document.getElementById('productName').value = product.name;
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productCategory').value = product.category;
            document.getElementById('productDescription').value = product.description;

            // Handle image source
            let imgSrc = product.image;
            if (!imgSrc.startsWith('http') && !imgSrc.includes('images/')) {
                imgSrc = 'images/' + imgSrc;
            }
            imagePreview.innerHTML = `<img src="${imgSrc}" alt="${product.name}" onerror="this.src='images/Rings.jpg'">`;

            // Update buttons
            submitProductBtn.innerHTML = '<i class="fas fa-save"></i> Update Product';
            cancelEditBtn.style.display = 'block';
            openEditPopup();
            bringEditSectionIntoView();

        } else {
            alert("No such product found!");
        }
    } catch (error) {
        console.error("Error editing product: ", error);
        alert("Failed to load product for editing. " + error.message);
    }
}

// ----------------------------------------------------
// Migration Tool (One-time use)
// ----------------------------------------------------
migrateDataBtn.addEventListener('click', async () => {
    const statusDiv = document.getElementById('migrateStatus');
    const confirmMigrate = confirm("This will copy your hardcoded products from ProductManager.js into Firebase Firestore. Only do this once!");

    if (confirmMigrate) {
        migrateDataBtn.disabled = true;
        statusDiv.textContent = "Migrating...";
        statusDiv.style.color = "orange";

        try {
            const oldProducts = [
                {
                    name: "The Royal Diamond Solitaire",
                    price: 4500.00,
                    category: "Rings",
                    description: "A breathtaking 2-carat diamond set in 18k white gold. Part of our Heritage Collection.",
                    image: "images/diamond-ring.jpg"
                },
                {
                    name: "Ocean Blue Sapphire Pendant",
                    price: 2800.00,
                    category: "Necklaces",
                    description: "Vibrant Sri Lankan blue sapphire surrounded by a halo of brilliant-cut diamonds.",
                    image: "images/sapphire-pendant.jpg"
                },
                {
                    name: "Celestial Pearl Earrings",
                    price: 1200.00,
                    category: "Earrings",
                    description: "Lustrous South Sea pearls hanging from delicate diamond-encrusted gold studs.",
                    image: "images/pearl-necklace.jpg"
                },
                {
                    name: "Eternal Gold Bangle",
                    price: 3200.00,
                    category: "Bracelets",
                    description: "Hand-engraved 22k yellow gold bangle featuring traditional Sri Lankan motifs.",
                    image: "images/tennis-bracelet.jpg"
                },
                {
                    name: "Imperial Emerald Ring",
                    price: 5500.00,
                    category: "Rings",
                    description: "A rare Colombian emerald masterfully set with tapered baguette diamonds.",
                    image: "images/ruby-wedding-band.jpg"
                },
                {
                    name: "Glistening Choker",
                    price: 3900.00,
                    category: "Necklaces",
                    description: "Elegant diamond choker that captures the essence of evening glamour.",
                    image: "images/diamond-stud-earrings.jpg"
                },
                {
                    name: "Charm Bracelet",
                    category: "Bracelets",
                    price: 149.99,
                    description: "Sterling silver charm bracelet with heart and star charms",
                    image: "images/charm-bracelet.jpg"
                }
            ];

            let count = 0;

            for (const prodData of oldProducts) {
                prodData.createdAt = serverTimestamp();
                await addDoc(collection(db, "products"), prodData);
                count++;
            }

            statusDiv.textContent = `Success! Migrated ${count} products to Firebase.`;
            statusDiv.style.color = "green";
            loadProducts();

        } catch (error) {
            console.error(error);
            statusDiv.textContent = "Error: " + error.message;
            statusDiv.style.color = "red";
            migrateDataBtn.disabled = false;
        }
    }
});
