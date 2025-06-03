/**
 * User Class - Represents a system user (customer)
 * Handles user registration, authentication, and profile management
 */
class User {
    constructor(userID, userName, email, password, phoneNumber, address, dateRegistered) {
        this.userID = userID;
        this.userName = userName;
        this.email = email;
        this.password = password; // In real system, this should be hashed
        this.phoneNumber = phoneNumber;
        this.address = address;
        this.dateRegistered = dateRegistered || new Date();
        this.isActive = true;
        this.loyaltyPoints = 0;
    }

    /**
     * Validates user login credentials
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {boolean} - True if credentials are valid
     */
    validateCredentials(email, password) {
        return this.email === email && this.password === password && this.isActive;
    }

    /**
     * Updates user profile information
     * @param {Object} updatedInfo - Object containing updated user information
     * @returns {boolean} - True if update successful
     */
    updateProfile(updatedInfo) {
        try {
            if (updatedInfo.userName) this.userName = updatedInfo.userName;
            if (updatedInfo.email) this.email = updatedInfo.email;
            if (updatedInfo.phoneNumber) this.phoneNumber = updatedInfo.phoneNumber;
            if (updatedInfo.address) this.address = updatedInfo.address;
            return true;
        } catch (error) {
            console.error('Error updating profile:', error);
            return false;
        }
    }

    /**
     * Adds loyalty points to user account
     * @param {number} points - Points to add
     */
    addLoyaltyPoints(points) {
        if (points > 0) {
            this.loyaltyPoints += points;
        }
    }

    /**
     * Deducts loyalty points from user account
     * @param {number} points - Points to deduct
     * @returns {boolean} - True if deduction successful
     */
    deductLoyaltyPoints(points) {
        if (points > 0 && this.loyaltyPoints >= points) {
            this.loyaltyPoints -= points;
            return true;
        }
        return false;
    }

    /**
     * Converts user object to JSON for storage
     * @returns {Object} - User data as plain object
     */
    toJSON() {
        return {
            userID: this.userID,
            userName: this.userName,
            email: this.email,
            password: this.password,
            phoneNumber: this.phoneNumber,
            address: this.address,
            dateRegistered: this.dateRegistered,
            isActive: this.isActive,
            loyaltyPoints: this.loyaltyPoints
        };
    }

    /**
     * Creates User instance from JSON data
     * @param {Object} data - User data from storage
     * @returns {User} - New User instance
     */
    static fromJSON(data) {
        return new User(
            data.userID,
            data.userName,
            data.email,
            data.password,
            data.phoneNumber,
            data.address,
            new Date(data.dateRegistered)
        );
    }
}

export default User;
