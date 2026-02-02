// Save JWT token
export function saveToken(token) {
  localStorage.setItem('token', token);
}

// Retrieve token
export function getToken() {
  return localStorage.getItem('token');
}

// Check if logged in
export function isLoggedIn() {
  return !!getToken();
}

// Log out
export function logout() {
  localStorage.removeItem('token');
}
