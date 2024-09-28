<template>
  <div class="grid-wrap">
    <div
      class="product-item"
      v-for="(product, index) in products"
      :key="product.id"
    >
      <img :src="product.imageUrl" />
      <span>{{ index + 1 }}</span>
      <h3 class="product-name">{{ product.name }}</h3>
      <p class="product-price">{{ product.price }}</p>
      <router-link :to="'/products/' + product.id">
        <button>View Details</button>
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: "ProductsList",
  props: ["products"],
};
</script>
