// public/Kuching-ART-Online-System/js/Admin.js

/**
 * Return an array of all registered user‐emails.
 * We assume each user was stored under:
 *    localStorage.setItem(email, JSON.stringify({ password, … }));
 */
export function getAllUsers() {
  const users = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key === 'loggedInUser') continue; // skip the “currently logged‐in” marker
    try {
      const val = JSON.parse(localStorage.getItem(key));
      // If it looks like { password: "…" }, treat it as a user record
      if (val && typeof val === 'object' && 'password' in val) {
        users.push(key);
      }
    } catch {
      // skip anything that isn't valid JSON / not a user object
    }
  }
  return users;
}

/**
 * Remove a user from localStorage by email.
 */
export function deleteUser(email) {
  localStorage.removeItem(email);
}

/**
 * Return the total number of registered users.
 */
export function getTotalUsers() {
  return getAllUsers().length;
}

/**
 * Return a mock “total tickets issued” count.
 * In a real application, replace this with a real API call.
 */
export function getTotalTickets() {
  return 1234; // placeholder
}

/**
 * Return a mock “total revenue” (in RM).
 * In a real application, replace this with a real API call.
 */
export function getTotalRevenue() {
  return 5678.90; // placeholder
}

/**
 * Generate and display usage statistics in the “Usage Statistics” section.
 * - Counts total users (from localStorage)
 * - Picks a random number for “logins today”
 * - Picks a random number for “total bookings”
 */
export function generateStats() {
  const totalUsers = getTotalUsers();
  const loginsToday = Math.floor(Math.random() * 20) + 1;      // random 1–20
  const totalBookings = Math.floor(Math.random() * 100) + 30;  // random 30–129

  const elTotalUsers = document.getElementById('totalUsers');
  const elLoginsToday = document.getElementById('loginsToday');
  const elTotalBookings = document.getElementById('totalBookings');

  if (elTotalUsers) elTotalUsers.textContent = totalUsers;
  if (elLoginsToday) elLoginsToday.textContent = loginsToday;
  if (elTotalBookings) elTotalBookings.textContent = totalBookings;
}

/**
 * Log out the current user by removing the “loggedInUser” key
 * and redirecting to login.html.
 */
export function logout() {
  localStorage.removeItem('loggedInUser');
  window.location.href = 'login.html';
}
