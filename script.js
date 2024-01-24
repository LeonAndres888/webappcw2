import products from "./lessons.js"; // Import lesson data from lessons.js

// Creates new vue instance
const webstore = new Vue({
  el: "#app",
  data: {
    // Data properties
    sitename: "👨‍🎓 STUDY SESSION STORE 👩‍🎓",
    showProduct: true,
    products,
    cart: [],
    searchLesson: "",
    sortAttribute: "title",
    sortOrder: "",
    custName: "",
    custPhone: "",
    orderSubmitted: false,
  },
  computed: {
    // Computed properties
    filteredProducts() {
      // Filter products based on search lesson
      let searchTerm = this.searchLesson.trim().toLowerCase();
      if (!searchTerm) {
        return this.products;
      }
      // .filter() creates array with elements inputted
      return this.products.filter((product) => {
        return (
          product.title.toLowerCase().includes(searchTerm) ||
          product.location.toLowerCase().includes(searchTerm)
        );
      });
    },

    validCheckout() {
      // Validate checkout
      const nameRegex = /^[A-Za-z\s]+$/;
      const phoneRegex = /^[0-9()-]+$/;
      return nameRegex.test(this.custName) && phoneRegex.test(this.custPhone);
    },

    sortedProducts() {
      // Sort products functionality
      return this.filteredProducts.slice().sort((a, b) => {
        let modifier = this.sortOrder === "ascending" ? 1 : -1;
        if (
          this.sortAttribute === "price" ||
          this.sortAttribute === "availableInventory"
        ) {
          return (a[this.sortAttribute] - b[this.sortAttribute]) * modifier;
        }
        return (
          a[this.sortAttribute].localeCompare(b[this.sortAttribute]) * modifier
        );
      });
    },
  },
  methods: {
    // Methods for different functionalities
    submitOrder() {
      // Submit order if checkout request is valid
      if (this.validCheckout) {
        this.orderSubmitted = true;
      }
    },
    canAddToCart(product) {
      // Check if product can be added to cart
      let cartItem = this.cart.find((item) => item.id === product.id);
      let cartItemCount = cartItem ? cartItem.quantity : 0;
      return product.availableInventory > cartItemCount;
    },
    addItemCart(product) {
      // Add product and decrease inventory by 1
      if (product.availableInventory > 0) {
        this.cart.push(product);
        product.availableInventory--;
      }
    },
    updateSortOrder(order) {
      // Update sorting order based on asc or dsc buttons
      this.sortOrder = order;
    },
    removeItemCart(item) {
      // Remove item from cart and increase inventory by 1
      let cartItem = this.cart.find((cartItem) => cartItem.id === item.id);
      if (cartItem.quantity > 1) {
        cartItem.quantity--;
      } else {
        let index = this.cart.indexOf(cartItem);
        this.cart.splice(index, 1);
      }
      item.availableInventory++;
    },

    toggleCart() {
      // Toggle between cart and product list
      this.showProduct = !this.showProduct;
    },
  },
});
