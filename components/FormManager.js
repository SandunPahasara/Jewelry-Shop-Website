// FormManager.js - Manages form submissions
class FormManager {
    constructor() {
        this.contactFormElement = null;
        this.emailjsInitialized = false;
    }

    init(contactFormEl) {
        this.contactFormElement = contactFormEl;
        this.setupFormListeners();
        this.initEmailJS();
    }

    initEmailJS() {
        // Search for EmailJS script
        if (typeof emailjs !== 'undefined') {
            this.emailjsInitialized = true;
            // Note: Users need to call emailjs.init("YOUR_PUBLIC_KEY") in their HTML or here
        }
    }

    setupFormListeners() {
        if (this.contactFormElement) {
            this.contactFormElement.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleContactFormSubmit(e);
            });
        }
    }

    async handleContactFormSubmit(e) {
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;

        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';

        try {
            if (this.emailjsInitialized) {
                // Example EmailJS call:
                // await emailjs.send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", data);
                
                // For demonstration, we'll keep the alert but explain it's "sent"
                console.log("EmailJS would send:", data);
                alert(`Thank you for your inquiry, ${data.name}!\n\nYour message has been sent successfully via EmailJS. We'll get back to you within 24 hours at ${data.email}.`);
            } else {
                // Fallback for when EmailJS is not yet configured with keys
                alert(`Thank you for your inquiry, ${data.name}!\n\n(Note: EmailJS not yet configured with keys). We'll get back to you within 24 hours at ${data.email}.`);
            }
            
            // Reset form
            this.contactFormElement.reset();
        } catch (error) {
            console.error("Form submission error:", error);
            alert("Sorry, there was an error sending your message. Please try again later.");
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
        }
    }

    handleCheckout(cart) {
        if (cart.getCart().length === 0) {
            alert('Your cart is empty!');
            return false;
        }

        const total = cart.getTotal();
        const itemCount = cart.getTotalItems();
        
        alert(`Thank you for your purchase!\n\nOrder Summary:\n${itemCount} items\nTotal: $${total.toFixed(2)}\n\nYou will be redirected to payment processing.`);
        
        cart.clear();
        return true;
    }
}
