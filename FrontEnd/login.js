// Login function
async function login(email, password) {
	try {
		const response = await fetch('http://localhost:5678/api/users/login', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				email: email,
				password: password
			})
		});

		// If response is not JSON, throw error with response text
		if (!response.headers.get('content-type')?.includes('application/json')) {
			const text = await response.text();
			throw new Error(text.replaceAll(/<[^>]*>/g, '').trim());
		}

		const data = await response.json();

		// If user not found, throw specific error
		if (data?.message === 'user not found' || response.status === 401) throw new Error("Erreur dans l'identifiant ou le mot de passe");

		// Store token and redirect to homepage
		localStorage.setItem('token', data.token);
		location.href = 'index.html';
	} catch (error) {
		showError(error.message);
	}
}

// Show error message
function showError(message) {
	const errorDiv = document.querySelector('#error-message');
	errorDiv.textContent = message;
	errorDiv.style.display = 'block';
}

// Hide error message
function hideError() {
	const errorDiv = document.querySelector('#error-message');
	errorDiv.style.display = 'none';
}

// Login form handling
document.querySelector('#login-form').onsubmit = e => {
	e.preventDefault();
	hideError();

	const email = e.target.querySelector('#email').value;
	const password = e.target.querySelector('#password').value;

	login(email, password);
};
