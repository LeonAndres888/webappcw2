import products from "./lessons.js"; // Import lesson data from lessons.js

// Creates new vue instance
const webstore = new Vue({
  el: "#app",
  data: {
    // Data properties
    sitename: "👨‍🎓 STUDY SESSION STORE 👩‍🎓",
    showProduct: true,
    products: [],
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
    // Fetch lessons from the backend when the component is mounted
    fetchLessons() {
      fetch("http://localhost:8888/api/lessons") // Use the actual backend URL
        .then((response) => response.json())
        .then((data) => {
          this.products = data;
        })
        .catch((error) => {
          console.error("Error fetching lessons:", error);
        });
    },

    // Submit order to the backend
    submitOrder() {
      const order = {
        name: this.custName,
        phoneNumber: this.custPhone,
        items: this.cart,
      };

      fetch("http://localhost:8888/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(order),
      })
        .then((response) => response.json())
        .then((data) => {
          this.orderSubmitted = true;
          console.log("Order submitted:", data);
        })
        .catch((error) => {
          console.error("Error submitting order:", error);
        });
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
  mounted() {
    // Call fetchLessons when the Vue instance is mounted
    this.fetchLessons();
  },
});
