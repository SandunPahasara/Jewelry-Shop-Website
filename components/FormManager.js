// FormManager.js - Manages form submissions
class FormManager {
    constructor() {
        this.contactFormElement = null;
        this.emailjsInitialized = false;
        this.emailjsPublicKey = 'TrtI9U_9dFF7-Npax';
        this.emailjsServiceId = 'service_d8w9z0v';
        this.emailjsTemplateId = 'template_contact_form';
    }

    init(contactFormEl) {
        this.contactFormElement = contactFormEl;
        this.setupFormListeners();
        this.initEmailJS();
    }

    initEmailJS() {
        if (typeof emailjs === 'undefined') return;

        if (!this.emailjsInitialized) {
            emailjs.init(this.emailjsPublicKey);
            this.emailjsInitialized = true;
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
                await emailjs.send(this.emailjsServiceId, this.emailjsTemplateId, {
                    from_name: data.name,
                    from_email: data.email,
                    phone: data.phone || 'Not provided',
                    message: data.message,
                    submitted_at: new Date().toLocaleString()
                });

                alert(`Thank you for your inquiry, ${data.name}!\n\nYour message has been sent successfully via EmailJS. We'll get back to you within 24 hours at ${data.email}.`);
            } else {
                alert('Email service is not available right now. Please refresh and try again.');
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
