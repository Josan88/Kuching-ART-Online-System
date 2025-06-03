/**
 * UserService Class - Handles user-related business logic
 * Manages user registration, authentication, and profile operations
 */
import User from '../models/User.js';
import Admin from '../models/Admin.js';
import DataService from './DataService.js';

class UserService {
    constructor() {
        this.dataService = new DataService();
        this.currentUser = null;
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
    }

    /**
     * Registers a new user
     * @param {Object} userData - User registration data
     * @returns {Promise<Object>} - Registration result
     */
    async registerUser(userData) {
        try {
            // Validate required fields
            const validation = this.validateRegistrationData(userData);
            if (!validation.isValid) {
                return {
                    success: false,
                    message: 'Registration failed',
                    errors: validation.errors
                };
            }

            // Check if email already exists
            const existingUsers = await this.dataService.loadData('users') || [];
            const emailExists = existingUsers.some(user => user.email === userData.email);
            
            if (emailExists) {
                return {
                    success: false,
                    message: 'Email address already registered'
                };
            }

            // Generate user ID
            const userID = this.generateUserID();

            // Create new user
            const newUser = new User(
                userID,
                userData.userName,
                userData.email,
                userData.password, // In real system, hash this
                userData.phoneNumber,
                userData.address
            );

            // Save user data
            existingUsers.push(newUser.toJSON());
            await this.dataService.saveData('users', existingUsers);

            return {
                success: true,
                message: 'User registered successfully',
                userID: userID
            };

        } catch (error) {
            console.error('Error registering user:', error);
            return {
                success: false,
                message: 'Registration failed due to system error'
            };
        }
    }

    /**
     * Authenticates user login
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<Object>} - Login result
     */
    async loginUser(email, password) {
        try {
            // Load users data
            const users = await this.dataService.loadData('users') || [];
            const admins = await this.dataService.loadData('admins') || [];
            
            // Find user in users or admins
            let userData = users.find(user => user.email === email);
            let isAdmin = false;
            
            if (!userData) {
                userData = admins.find(admin => admin.email === email);
                isAdmin = true;
            }

            if (!userData) {
                return {
                    success: false,
                    message: 'Invalid email or password'
                };
            }

            // Create user object and validate credentials
            const userObj = isAdmin ? Admin.fromJSON(userData) : User.fromJSON(userData);
            
            if (!userObj.validateCredentials(email, password)) {
                return {
                    success: false,
                    message: 'Invalid email or password'
                };
            }

            // Set current user and create session
            this.currentUser = userObj;
            const sessionToken = this.createSession();

            // Record login for admins
            if (isAdmin) {
                userObj.recordLogin();
                await this.updateUserData(userObj);
            }

            return {
                success: true,
                message: 'Login successful',
                user: {
                    userID: userObj.userID,
                    userName: userObj.userName,
                    email: userObj.email,
                    isAdmin: isAdmin
                },
                sessionToken: sessionToken
            };

        } catch (error) {
            console.error('Error during login:', error);
            return {
                success: false,
                message: 'Login failed due to system error'
            };
        }
    }

    /**
     * Logs out current user
     * @returns {Object} - Logout result
     */
    logoutUser() {
        this.currentUser = null;
        this.clearSession();
        
        return {
            success: true,
            message: 'Logged out successfully'
        };
    }

    /**
     * Updates user profile
     * @param {string} userID - User ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<Object>} - Update result
     */
    async updateUserProfile(userID, updateData) {
        try {
            const users = await this.dataService.loadData('users') || [];
            const userIndex = users.findIndex(user => user.userID === userID);
            
            if (userIndex === -1) {
                return {
                    success: false,
                    message: 'User not found'
                };
            }

            const user = User.fromJSON(users[userIndex]);
            
            if (user.updateProfile(updateData)) {
                users[userIndex] = user.toJSON();
                await this.dataService.saveData('users', users);
                
                return {
                    success: true,
                    message: 'Profile updated successfully'
                };
            } else {
                return {
                    success: false,
                    message: 'Failed to update profile'
                };
            }

        } catch (error) {
            console.error('Error updating profile:', error);
            return {
                success: false,
                message: 'Update failed due to system error'
            };
        }
    }

    /**
     * Gets user by ID
     * @param {string} userID - User ID
     * @returns {Promise<User|null>} - User object or null
     */
    async getUserByID(userID) {
        try {
            const users = await this.dataService.loadData('users') || [];
            const userData = users.find(user => user.userID === userID);
            
            return userData ? User.fromJSON(userData) : null;
        } catch (error) {
            console.error('Error getting user:', error);
            return null;
        }
    }

    /**
     * Gets current logged-in user
     * @returns {User|null} - Current user or null
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Validates registration data
     * @param {Object} userData - User data to validate
     * @returns {Object} - Validation result
     */
    validateRegistrationData(userData) {
        const errors = [];

        if (!userData.userName || userData.userName.trim() === '') {
            errors.push('Username is required');
        }

        if (!userData.email || !/\S+@\S+\.\S+/.test(userData.email)) {
            errors.push('Valid email address is required');
        }

        if (!userData.password || userData.password.length < 6) {
            errors.push('Password must be at least 6 characters long');
        }

        if (!userData.phoneNumber || userData.phoneNumber.trim() === '') {
            errors.push('Phone number is required');
        }

        if (!userData.address || userData.address.trim() === '') {
            errors.push('Address is required');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Generates a unique user ID
     * @returns {string} - Unique user ID
     */
    generateUserID() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        return `USR-${timestamp}-${random}`.toUpperCase();
    }

    /**
     * Creates a session token
     * @returns {string} - Session token
     */
    createSession() {
        const sessionData = {
            userID: this.currentUser.userID,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + this.sessionTimeout)
        };

        const sessionToken = btoa(JSON.stringify(sessionData));
        localStorage.setItem('sessionToken', sessionToken);
        
        return sessionToken;
    }

    /**
     * Validates session token
     * @param {string} token - Session token to validate
     * @returns {boolean} - True if session is valid
     */
    validateSession(token) {
        try {
            const sessionData = JSON.parse(atob(token));
            const expiresAt = new Date(sessionData.expiresAt);
            
            return new Date() < expiresAt;
        } catch (error) {
            return false;
        }
    }

    /**
     * Clears current session
     */
    clearSession() {
        localStorage.removeItem('sessionToken');
    }

    /**
     * Updates user data in storage
     * @param {User} user - User object to update
     * @returns {Promise<boolean>} - True if update successful
     */
    async updateUserData(user) {
        try {
            const users = await this.dataService.loadData('users') || [];
            const userIndex = users.findIndex(u => u.userID === user.userID);
            
            if (userIndex !== -1) {
                users[userIndex] = user.toJSON();
                await this.dataService.saveData('users', users);
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Error updating user data:', error);
            return false;
        }
    }

    /**
     * Checks if user is logged in
     * @returns {boolean} - True if user is logged in
     */
    isLoggedIn() {
        const token = localStorage.getItem('sessionToken');
        return this.currentUser && token && this.validateSession(token);
    }

    /**
     * Requires user to be logged in
     * @returns {boolean} - True if user is logged in
     */
    requireLogin() {
        if (!this.isLoggedIn()) {
            throw new Error('User must be logged in to perform this action');
        }
        return true;
    }
}

export default UserService;
