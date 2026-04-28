// FormManager.js - Manages form submissions
class FormManager {
    constructor() {
        this.contactFormElement = null;
        this.emailjsInitialized = false;
        this.emailjsPublicKey = 'TrtI9U_9dFF7-Npax';
        this.emailjsServiceId = 'service_04krrk4';
        this.emailjsTemplateId = 'template_contact_form';
    }

    sanitizeEmail(value) {
        return String(value || '')
            .trim()
            .toLowerCase()
            .replace(/[<>"'\s]/g, '')
            .replace(/[;,].*$/, '');
    }

    isValidEmail(value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
    }

    stringifyEmailJsError(err) {
        if (!err) return 'Unknown EmailJS error';
        if (typeof err === 'string') return err;

        const parts = [];
        if (err.status) parts.push(`status=${err.status}`);
        if (err.text) parts.push(`text=${err.text}`);
        if (err.message) parts.push(`message=${err.message}`);

        try {
            const raw = JSON.stringify(err);
            if (raw && raw !== '{}' && raw !== '[]') parts.push(`raw=${raw}`);
        } catch {
            // Ignore stringify failures.
        }

        return parts.length ? parts.join(' | ') : String(err);
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
        const cleanEmail = this.sanitizeEmail(data.email);

        if (!this.isValidEmail(cleanEmail)) {
            alert('Please enter a valid email address.');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';

        try {
            if (this.emailjsInitialized) {
                const templateParams = {
                    // Sender details from contact form
                    from_name: data.name,
                    from_email: cleanEmail,
                    phone: data.phone || 'Not provided',
                    message: data.message,
                    submitted_at: new Date().toLocaleString(),

                    // Extra aliases for flexible EmailJS template mapping
                    customer_name: data.name,
                    customer_email: cleanEmail,
                    customer_phone: data.phone || 'Not provided',
                    inquiry_message: data.message,
                    reply_to: cleanEmail,
                    to_email: 'concierge@luxe-jewelry.com'
                };

                console.log('📧 Contact EmailJS payload:', {
                    serviceId: this.emailjsServiceId,
                    templateId: this.emailjsTemplateId,
                    params: templateParams
                });

                await emailjs.send(this.emailjsServiceId, this.emailjsTemplateId, templateParams);

                alert(`Thank you for your inquiry, ${data.name}!\n\nYour message has been sent successfully via EmailJS. We'll get back to you within 24 hours at ${data.email}.`);
            } else {
                alert('Email service is not available right now. Please refresh and try again.');
            }
            
            // Reset form
            this.contactFormElement.reset();
        } catch (error) {
            const reason = this.stringifyEmailJsError(error);
            console.error('Form submission error:', { reason, error });
            alert(`Sorry, there was an error sending your message. Reason: ${reason}`);
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
