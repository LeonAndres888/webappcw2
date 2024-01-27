// Creates new Vue instance
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
    // Computed properties for filtering and sorting the product list
    filteredProducts() {
      let searchTerm = this.searchLesson.trim().toLowerCase();
      return this.products.filter((product) => {
        return (
          product.title.toLowerCase().includes(searchTerm) ||
          product.location.toLowerCase().includes(searchTerm)
        );
      });
    },
    validCheckout() {
      const nameRegex = /^[A-Za-z\s]+$/;
      const phoneRegex = /^[0-9()-]+$/;
      return nameRegex.test(this.custName) && phoneRegex.test(this.custPhone);
    },
    sortedProducts() {
      let modifier = this.sortOrder === "ascending" ? 1 : -1;
      return this.filteredProducts.slice().sort((a, b) => {
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
    fetchLessons() {
      // Fetch lessons from the backend when the component is mounted
      fetch("http://localhost:8080/api/lessons")
        .then((response) => response.json())
        .then((data) => {
          this.products = data;
        })

        .catch((error) => {
          console.error("Error fetching lessons:", error);
        });
    },
    submitOrder() {
      // Submit order to the backend and update lesson space
      const order = {
        name: this.custName,
        phoneNumber: this.custPhone,
        items: this.cart.map((item) => ({
          lessonId: item.id,
          quantity: item.quantity, // Now dynamic based on cart item quantity
        })),
      };

      fetch("http://localhost:8080/api/orders", {
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
          this.updateLessonSpace(order.items);
        })
        .catch((error) => {
          console.error("Error submitting order:", error);
        });
    },
    updateLessonSpace(orderedItems) {
      orderedItems.forEach((item) => {
        fetch(`http://localhost:8080/api/lessons/${item.lessonId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ numberToDecrease: item.quantity }),
        })
          .then((response) => {
            if (response.ok) {
              console.log(
                `Lesson space updated for lesson ID ${item.lessonId}`
              );
            } else {
              console.error(
                `Failed to update lesson space for lesson ID ${item.lessonId}`
              );
            }
          })
          .catch((error) => {
            console.error("Error updating lesson space:", error);
          });
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
      let cartItemIndex = this.cart.findIndex(
        (cartItem) => cartItem.id === item.id
      );
      if (cartItemIndex > -1) {
        let cartItem = this.cart[cartItemIndex];
        if (cartItem.quantity > 1) {
          cartItem.quantity--;
        } else {
          this.cart.splice(cartItemIndex, 1);
        }
      }
    },
    toggleCart() {
      this.showProduct = !this.showProduct;
    },
  },
  mounted() {
    this.fetchLessons();
  },
});
