describe("List", () => {
	beforeEach(() => {
		cy.visit("http://localhost:5173");
	});

	describe("Initial", () => {
		it("Count products", () => {
			cy.get("#compteur-produits").contains("98");
		});

		it("Display products", () => {
			cy.get("#liste-produits").children().should("have.length", 98);
		});
	});

	describe("Search", () => {
		beforeEach(() => {
			cy.get("#recherche").type("lait");
		});

		it("Count products after search", () => {
			cy.get("#compteur-produits").contains("3");
		});

		it("Display products after search", () => {
			cy.get("#liste-produits").children().should("have.length", 3);
		});
	});

	describe("Sort", () => {
		it("Sort alphabetically", () => {
			cy.get("#tri").select("nom");

			cy.get("#liste-produits")
				.children("li")
				.children("div")
				.children("h2")
				.then((items) => {
					const unsortedItems = items
						.toArray()
						.map((_i, title) => title.textContent);
					const sortedItems = unsortedItems.sort((a, b) => a.localeCompare(b));

					expect(unsortedItems).to.deep.eq(sortedItems);
				});
		});

		// it("Sort by price", () => {
		// 	cy.get("#liste-produits")
		// 		.children()
		// 		.then((items) => {
		// 			const unsortedItems = items
		// 				.map((index, html) => Cypress.$(html).text())
		// 				.get();
		// 			const sortedItems = unsortedItems.slice().sort();
		// 			expect(unsortedItems, "Items are sorted").to.deep.equal(sortedItems);
		// 		});
		// });
	});
});
