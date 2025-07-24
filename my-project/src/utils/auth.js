// Save JWT token
export function saveToken(token) {
  localStorage.setItem('jwt', token);
}

// Retrieve token
export function getToken() {
  return localStorage.getItem('jwt');
}

// Check if logged in
export function isLoggedIn() {
  return !!getToken();
}

// Log out
export function logout() {
  localStorage.removeItem('jwt');
}
