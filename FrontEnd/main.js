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
}

main();
