// Check if user is logged in and update interface
function updateAuthInterface() {
	const token = localStorage.getItem('token');
	const authLink = document.getElementById('auth-link');

	if (token) {
		authLink.innerHTML = '<a href="#" id="logout-link">logout</a>';
		authLink.querySelector('a').onclick = logout;
	} else {
		authLink.innerHTML = '<a href="login.html">login</a>';
	}

	document.body.classList.toggle('logged-in', !!token);
}

// Logout
function logout(e) {
	e.preventDefault();
	localStorage.clear();
	window.location.reload();
}

// Get categories from API
async function getCategories() {
	const res_categories = await fetch('http://localhost:5678/api/categories');
	return await res_categories.json();
}

// Get works from API
let works = [];
async function fetchWorks() {
	const res_works = await fetch('http://localhost:5678/api/works');
	works = await res_works.json();
}

// Display works in page gallery
function showWorks(category = null) {
	const galleryContainer = document.querySelector('.gallery');

	// Clear gallery
	galleryContainer.innerHTML = '';

	// Filter works by category if provided
	const filteredWorks = category ? works.filter(work => work.categoryId === category) : works;

	for (const work of filteredWorks) {
		const workElement = document.createElement('div');
		workElement.classList.add('work');

		workElement.innerHTML = `
			<figure>
				<img src="${work.imageUrl}" alt="${work.title}" />
				<figcaption>${work.title}</figcaption>
			</figure>
		`;

		galleryContainer.appendChild(workElement);
	}
}

// Select category
function selectCategory(elem) {
	// Remove "selected" class from all categories
	document.querySelector('.category.selected').classList.remove('selected');

	// Add "selected" class to clicked category
	elem.classList.add('selected');
}

// Main function to initialize the page
async function main() {
	// Works (all by default)
	await fetchWorks();
	showWorks();

	// Categories
	const categories = await getCategories();
	const categoriesContainer = document.querySelector('#categories');

	for (const category of categories) {
		const categoryElement = document.createElement('div');
		categoryElement.classList.add('category');
		categoryElement.innerText = category.name;
		categoriesContainer.appendChild(categoryElement);

		categoryElement.onclick = e => {
			// Select category
			selectCategory(e.target);

			// Filter works
			showWorks(category.id);
		};
	}

	// "All" category
	document.querySelector('.category.all').onclick = e => {
		// Select category
		selectCategory(e.target);

		// Show all works
		showWorks();
	};

	// Update authentication interface
	updateAuthInterface();
}

main();

// Modal handling
const modalOverlay = document.querySelector('.overlay');
const modal = document.querySelector('.modal');
const fileInput = modal.querySelector('#photo-file');
const fileInputPlaceholder = modal.querySelector('.file-input-placeholder');

// Close modal functionality
document.querySelector('.modal .close').onclick = () => modalOverlay.classList.remove('open');
modalOverlay.onclick = e => {
	if (e.target === modalOverlay) modalOverlay.classList.remove('open');
};

// Add photo button functionality
document.querySelector('.modal .add-photo').onclick = () => modal.classList.add('show-add-photo');

// Back button functionality
document.querySelector('.modal .back').onclick = () => modal.classList.remove('show-add-photo');

// File input functionality
fileInputPlaceholder.onclick = () => fileInput.click();

fileInput.onchange = e => {
	const file = e.target.files[0];
	if (!file) {
		// File was removed/cancelled, validate form
		validateAddPhotoForm();
		return;
	}

	// Validate file size (4MB max)
	if (file.size > 4 * 1024 * 1024) {
		fileInput.value = '';
		validateAddPhotoForm();
		return alert(`Le fichier est trop volumineux. Taille maximale autorisée : 4Mo`);
	}

	// Validate file type (additional check)
	if (!['image/jpeg', 'image/png'].includes(file.type)) {
		fileInput.value = '';
		validateAddPhotoForm();
		return alert('Format de fichier non autorisé. Utilisez uniquement JPG ou PNG.');
	}

	const reader = new FileReader();
	reader.onload = e => {
		modal.querySelector('.preview-image').src = e.target.result;
		fileInputPlaceholder.style.display = 'none';
		modal.querySelector('.file-preview').style.display = 'flex';
	};
	reader.readAsDataURL(file);

	// Validate form after file selection
	validateAddPhotoForm();
};

// Reset add photo form
function resetAddPhotoForm() {
	fileInput.value = '';
	modal.querySelector('#photo-title').value = '';
	modal.querySelector('#photo-category').value = '';
	fileInputPlaceholder.style.display = 'flex';
	modal.querySelector('.file-preview').style.display = 'none';
	modal.querySelector('.preview-image').src = '';
	validateAddPhotoForm(); // Re-validate form after reset
}

// Validate add photo form and enable/disable submit button
function validateAddPhotoForm() {
	const fileInput = modal.querySelector('#photo-file');
	const titleInput = modal.querySelector('#photo-title');
	const categorySelect = modal.querySelector('#photo-category');
	const submitButton = modal.querySelector('#add-photo-form button[type="submit"]');

	// Check if all required fields are filled
	const hasFile = fileInput.files && fileInput.files.length > 0;
	const hasTitle = titleInput.value.trim() !== '';
	const hasCategory = categorySelect.value !== '';

	const isFormValid = hasFile && hasTitle && hasCategory;

	// Enable/disable submit button
	submitButton.disabled = !isFormValid;
}

// Populate modal categories
async function populateModalCategories() {
	const categorySelect = modal.querySelector('#photo-category');
	const categories = await getCategories();

	// Clear existing options except the first empty one
	categorySelect.innerHTML = '<option value=""></option>';

	categories.forEach(category => {
		const option = document.createElement('option');
		option.value = category.id;
		option.textContent = category.name;
		categorySelect.appendChild(option);
	});
}

// Populate modal works
async function populateModalWorks() {
	const modalGallery = modal.querySelector('.modal-gallery');
	modalGallery.innerHTML = '';

	for (const work of works) {
		const workElement = document.createElement('div');
		workElement.classList.add('modal-work');

		const img = document.createElement('img');
		img.src = work.imageUrl;
		img.alt = work.title;

		const deleteButton = document.createElement('button');
		deleteButton.type = 'button';
		deleteButton.classList.add('delete-work');
		deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
		deleteButton.onclick = () => deleteWork(work.id);

		workElement.appendChild(img);
		workElement.appendChild(deleteButton);
		modalGallery.appendChild(workElement);
	}
}

// Delete work function
async function deleteWork(workId) {
	if (!confirm('Êtes-vous sûr de vouloir supprimer cette image ?')) return;

	try {
		const response = await fetch(`http://localhost:5678/api/works/${workId}`, {
			method: 'DELETE',
			headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
		});

		if (!response.ok) throw new Error(`Erreur ${response.status}: ${response.statusText}`);

		// Remove work from array
		works = works.filter(work => work.id !== workId);

		// Refresh both gallery and modal
		showWorks();
		populateModalWorks();

		alert('Image supprimée avec succès!');
	} catch (error) {
		alert("Erreur lors de la suppression de l'image: " + error.message);
	}
}

// Submit add photo form
document.querySelector('#add-photo-form').onsubmit = async e => {
	e.preventDefault();

	const fileInput = document.querySelector('#photo-file');
	const titleInput = document.querySelector('#photo-title');
	const categorySelect = document.querySelector('#photo-category');

	// Make an image is selected
	if (!fileInput.files[0]) return alert('Veuillez sélectionner une image');

	// Create FormData for file upload
	const formData = new FormData();
	formData.append('image', fileInput.files[0]);
	formData.append('title', titleInput.value.trim());
	formData.append('category', parseInt(categorySelect.value));

	// Reset form
	resetAddPhotoForm();

	try {
		const response = await fetch('http://localhost:5678/api/works', {
			method: 'POST',
			headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
			body: formData
		});

		if (!response.ok) throw new Error(`Erreur ${response.status}: ${response.statusText}`);

		const newWork = await response.json();

		// Add the new work to the existing works array and refresh the display
		works.push(newWork);
		showWorks();

		// Close modal and reset form
		modalOverlay.classList.remove('open');
		alert('Photo ajoutée avec succès!');

		// Scroll to the newly added work
		const lastWorkElement = document.querySelector('.gallery .work:last-child');
		lastWorkElement?.scrollIntoView({ behavior: 'smooth' });
	} catch (error) {
		alert("Erreur lors de l'ajout de la photo :\n" + error.message);
	}
};

// Open modal
document.querySelector('#portfolio #edit').onclick = async () => {
	resetAddPhotoForm();
	populateModalWorks();
	populateModalCategories();
	modal.classList.remove('show-add-photo');
	modalOverlay.classList.add('open');

	// Add event listeners for form validation
	modal.querySelector('#photo-title').oninput = validateAddPhotoForm;
	modal.querySelector('#photo-category').onchange = validateAddPhotoForm;
};
