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

// Logout function
function logout(e) {
	e.preventDefault();
	localStorage.clear();
	window.location.reload();
}

async function getCategories() {
	const res_categories = await fetch('http://localhost:5678/api/categories');
	return await res_categories.json();
}

async function getWorks() {
	const res_works = await fetch('http://localhost:5678/api/works');
	return await res_works.json();
}

function showWorks(works) {
	const galleryContainer = document.querySelector('.gallery');

	// Clear gallery
	galleryContainer.innerHTML = '';

	for (const work of works) {
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

function selectCategory(elem) {
	// Remove "selected" class from all categories
	document.querySelector('.category.selected').classList.remove('selected');

	// Add "selected" class to clicked category
	elem.classList.add('selected');
}

async function main() {
	// Works (all by default)
	const works = await getWorks();
	showWorks(works);

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
			showWorks(works.filter(work => work.categoryId === category.id));
		};
	}

	// "All" category
	document.querySelector('.category.all').onclick = e => {
		// Select category
		selectCategory(e.target);

		// Show all works
		showWorks(works);
	};

	// Update authentication interface
	updateAuthInterface();
}

main();

// Modal handling
const modalOverlay = document.querySelector('.overlay');
const editButton = document.querySelector('#portfolio #edit');
const closeModalButton = document.querySelector('.modal .close');

closeModalButton.onclick = () => modalOverlay.classList.remove('open');
modalOverlay.onclick = e => {
	if (e.target === modalOverlay) modalOverlay.classList.remove('open');
};

editButton.onclick = async () => {
	// Populate modal with works
	const modalGallery = document.querySelector('.modal-gallery');
	modalGallery.innerHTML = '';

	for (const work of await getWorks()) {
		const workElement = document.createElement('div');
		workElement.classList.add('modal-work');

		workElement.innerHTML = `
			<img src="${work.imageUrl}" alt="${work.title}" />
			<button class="delete-work" data-id="${work.id}">
				<i class="fas fa-trash-alt"></i>
			</button>
		`;

		modalGallery.appendChild(workElement);
	}

	// open modal
	modalOverlay.classList.add('open');
};
