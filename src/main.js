async function fetchData() {
  try {
    const response = await fetch('liste_produits_quotidien.json');

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    return await response.json();  // Parse la réponse en JSON
  } catch (error) {

    console.error('Une erreur est survenue', error);
    return []
  }
}

async function filterData(filterParams = {}) {
  let productList = await fetchData()

  if (filterParams?.tri === "nom") {
    productList = productList.sort((a, b) => {
      const nameA = a.nom.toLowerCase();
      const nameB = b.nom.toLowerCase();
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }

      return 0;
    })
  } else if (filterParams?.tri === "prix") {
    productList = productList.sort((a, b) => a.prix_unitaire - b.prix_unitaire)
  }

  return "search" in filterParams
    ? productList.filter(value => value.nom.toLowerCase().includes(filterParams.search.toLowerCase()))
    : productList
}

function updateCounter(listLength) {
  const counter = document.getElementById('compteur-produits')
  if (listLength < 2) {
    counter.innerText = `${listLength} produit`
  } else {
    counter.innerText = `${listLength} produits`
  }
}

async function displayData(filterParams = {}) {
  const productList = await filterData(filterParams)

  const grid = document.getElementById('liste-produits')
  grid.innerHTML = ''

  updateCounter(productList.length)

  for (const item of productList) {
    const card = document.createElement("li")
    card.classList.add("card")
    grid.appendChild(card)

    const cardBody = document.createElement('div')
    cardBody.classList.add("card-body", "card-border", "shadow-sm")
    card.appendChild(cardBody)

    const cardTitle = document.createElement('h2')
    cardTitle.classList.add("card-title")
    cardTitle.innerText = item.nom
    cardBody.appendChild(cardTitle)

    const cardQuantity = document.createElement('p')
    cardQuantity.innerText = `Quantité en stock : ${item.quantite_stock}`
    cardBody.appendChild(cardQuantity)

    const cardPrice = document.createElement('p')
    cardPrice.innerText = `Prix unitaire : ${item.prix_unitaire}`
    cardBody.appendChild(cardPrice)

    const cardActions = document.createElement('div')
    cardActions.classList.add("card-actions", "justify-end")
    cardBody.appendChild(cardActions)

    const cardButton = document.createElement('button')
    cardButton.classList.add("btn", "btn-primary")
    cardButton.dataset.action = "add-to-cart"
    cardButton.innerText = 'Ajouter au panier'
    cardButton.addEventListener('click', () => addToCart(item))
    cardActions.appendChild(cardButton)
  }
}

function setSearchFilter(value) {
  let filterParams = JSON.parse(localStorage.getItem("filterParams"))
  if (!filterParams) {
    filterParams = {}
  }
  filterParams = { ...filterParams, search: value }
  localStorage.setItem("filterParams", JSON.stringify(filterParams))

  displayData(filterParams)
}

function setTriFilter(value) {
  let filterParams = JSON.parse(localStorage.getItem("filterParams"))
  if (!filterParams) {
    filterParams = {}
  }
  filterParams = { ...filterParams, tri: value }
  localStorage.setItem("filterParams", JSON.stringify(filterParams))

  displayData(filterParams)
}

async function addToCart(product) {
  let cart = JSON.parse(localStorage.getItem("cart")) ?? []
  const existingProductIndex = cart.findIndex(item => item.nom === product.nom)

  if (existingProductIndex >= 0) {
    const existingProduct = cart[existingProductIndex]
    const list = await fetchData()
    const currentItem = list.find(item => item.nom === existingProduct.nom)
    if (currentItem && currentItem.quantite_stock > existingProduct.quantite) {
      cart[existingProductIndex] = { ...existingProduct, quantite: existingProduct.quantite + 1 }
    }
  } else {
    cart.push({ ...product, quantite: 1 })
  }
  localStorage.setItem("cart", JSON.stringify(cart))
}

const searchInput = document.getElementById('recherche')
searchInput.addEventListener('input', (e) => setSearchFilter(e.target.value))

const triSelect = document.getElementById('tri')
triSelect.addEventListener('change', (e) => setTriFilter(e.target.value))

async function resetFilter() {
  searchInput.value = ""

  const optionDefault = document.getElementById('option-default')
  triSelect.value = optionDefault.value

  localStorage.removeItem('filterParams')
  displayData()

}

const resetButton = document.getElementById('reset-filtres')
resetButton.addEventListener('click', () => resetFilter())

displayData()