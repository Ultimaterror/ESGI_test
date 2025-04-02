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

function displayData() {
    let cart = JSON.parse(localStorage.getItem("cart")) ?? []

    const table = document.getElementById('liste-course-body')
    table.innerHTML = ''

    let newTotal = 0
    for (const item of cart) {
        const subtotal = Number((item.quantite * item.prix_unitaire).toFixed(2))
        newTotal = Number((newTotal + subtotal).toFixed(2))

        const newRow = document.createElement('tr')
        table.appendChild(newRow)

        const colProduct = document.createElement('td')
        colProduct.innerText = item.nom
        newRow.appendChild(colProduct)

        const colUnitPrice = document.createElement('td')
        colUnitPrice.innerText = item.prix_unitaire
        newRow.appendChild(colUnitPrice)

        const inputQuantity = document.createElement('input')
        inputQuantity.type = 'number'
        inputQuantity.min = 0
        inputQuantity.value = item.quantite
        inputQuantity.addEventListener('change', async (e) => await updateQuantity(item.nom, e.target.value))
        newRow.appendChild(inputQuantity)

        const colSubtotal = document.createElement('td')
        colSubtotal.innerText = subtotal
        newRow.appendChild(colSubtotal)

        const deleteButton = document.createElement('button')
        deleteButton.classList.add("btn", "btn-outline", "btn-error")
        deleteButton.addEventListener('click', () => deleteItem(item.nom))
        deleteButton.innerText = "Supprimer l'article"
        newRow.appendChild(deleteButton)
    }

    updateTotal(newTotal)
}

function deleteItem(productName) {
    let cart = JSON.parse(localStorage.getItem("cart")) ?? []
    const indexToDelete = cart.findIndex(item => item.nom === productName)
    cart.splice(indexToDelete, 1)

    localStorage.setItem("cart", JSON.stringify(cart))
    displayData()
}

function deleteAll() {
    localStorage.setItem("cart", JSON.stringify([]))
    displayData()
}
const deleteAllButton = document.getElementById('vider-liste')
deleteAllButton.addEventListener('click', () => deleteAll())

function updateTotal(newTotal = 0) {
    const total = document.getElementById('total-general')
    total.innerText = `💰 Total général : ${newTotal}€`
}

async function updateQuantity(productName, newQuantity) {
    if (!isNaN(Number(newQuantity)) && newQuantity >= 0) {
        let cart = JSON.parse(localStorage.getItem("cart")) ?? []

        const existingProductIndex = cart.findIndex(item => item.nom === productName)

        if (existingProductIndex >= 0) {
            const existingProduct = cart[existingProductIndex]
            const list = await fetchData()
            const currentItem = list.find(item => item.nom === existingProduct.nom)
            if (currentItem) {
                cart[existingProductIndex] = {
                    ...existingProduct,
                    quantite: currentItem.quantite_stock > newQuantity ? newQuantity : currentItem.quantite_stock
                }
                localStorage.setItem("cart", JSON.stringify(cart))
            }
        }
    }
    displayData()
}

displayData()
