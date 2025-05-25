class Feedback {
    constructor(id, userName, userEmail, type, rating, comment, submittedAt, status = 'New', userId = null) {
        this.id = id;
        this.userId = userId;
        this.userName = userName || 'Anonymous';
        this.userEmail = userEmail || null;
        this.type = type;
        this.rating = rating ? parseInt(rating) : null;
        this.comment = comment;
        this.submittedAt = submittedAt || new Date().toISOString();
        this.status = status;
    }
}

class FeedbackManager {
    constructor(formId) {
        this.form = document.getElementById(formId);
        if (!this.form) {
            console.error(`Feedback form with ID "${formId}" not found.`);
            return;
        }

        this.nameInput = this.form.querySelector('#feedback-name');
        this.emailInput = this.form.querySelector('#feedback-email');
        this.typeInput = this.form.querySelector('#feedback-type');
        this.ratingInput = this.form.querySelector('#feedback-rating');
        this.commentInput = this.form.querySelector('#feedback-comment');

        this.feedbackItems = this._loadFeedbackFromStorage();
        this._bindEvents();
    }

    _bindEvents() {
        this.form.addEventListener('submit', this._handleFormSubmit.bind(this));
    }

    _handleFormSubmit(event) {
        event.preventDefault();

        const name = this.nameInput ? this.nameInput.value.trim() : '';
        const email = this.emailInput ? this.emailInput.value.trim() : '';
        const type = this.typeInput.value;
        const rating = this.ratingInput.value;
        const comment = this.commentInput.value.trim();

        const validation = this._validateInput(type, comment);
        if (!validation.isValid) {
            alert(validation.message);
            return;
        }

        const feedbackId = 'fb_' + Date.now();
        const newFeedbackEntry = new Feedback(feedbackId, name, email, type, rating, comment, new Date().toISOString());

        this.addFeedback(newFeedbackEntry);
        alert("Thank you for your feedback!");
        this.form.reset();
    }

    _validateInput(type, comment) {
        if (!type) {
            return { isValid: false, message: "Please select a feedback type." };
        }
        if (!comment) {
            return { isValid: false, message: "Feedback comment cannot be empty." };
        }
        if (comment.length < 10) {
            return { isValid: false, message: "Feedback comment should be at least 10 characters long." };
        }
        return { isValid: true, message: "" };
    }

    addFeedback(feedbackEntry) {
        this.feedbackItems.push(feedbackEntry);
        this._saveFeedbackToStorage();
    }

    _saveFeedbackToStorage() {
        localStorage.setItem('feedbackItems', JSON.stringify(this.feedbackItems));
    }

    _loadFeedbackFromStorage() {
        const storedFeedback = localStorage.getItem('feedbackItems');
        if (storedFeedback) {
            return JSON.parse(storedFeedback).map(item =>
                new Feedback(item.id, item.userName, item.userEmail, item.type, item.rating, item.comment, item.submittedAt, item.status, item.userId)
            );
        }
        return [];
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const feedbackManager = new FeedbackManager('feedbackForm');
});