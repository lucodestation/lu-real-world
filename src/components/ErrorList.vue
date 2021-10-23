<template>
  <div>
    <ul class="error-messages">
      <li v-for="(error, index) in $store.state.errorArray" :key="index">
        {{ error }}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'ErrorList'
};
</script>
