async function getCategories() {
	const res_categories = await fetch('http://localhost:5678/api/categories');
	return await res_categories.json();
}

async function main() {
	const categories = await getCategories();
	const categoriesContainer = document.querySelector('#categories');

	for (const category of categories) {
		const categoryElement = document.createElement('div');
		categoryElement.classList.add('category');
		categoryElement.innerText = category.name;
		categoriesContainer.appendChild(categoryElement);
	}
}

main();
