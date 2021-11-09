<template>
  <nav style="text-align: center">
    <div>总数量 {{ count }}</div>
    <ul class="pagination">
      <!-- 首页 -->
      <li class="page-item">
        <a class="page-link" href="javascript:">&lt;&lt;</a>
      </li>
      <!-- 上一页 -->
      <li class="page-item">
        <a class="page-link" href="javascript:" @click="changePage(-1)">&lt;</a>
      </li>
      <li class="page-item active">
        <a class="page-link" href="javascript:">10</a>
      </li>
      <li class="page-item">
        <a class="page-link" href="javascript:">11</a>
      </li>
      <!-- <li class="page-item active">
          <a class="page-link" href="javascript:">
            <i class="ion-load-a"></i>
          </a>
        </li> -->
      <!-- 下一页 -->
      <li class="page-item">
        <a class="page-link" href="javascript:" @click="changePage(1)">&gt;</a>
      </li>
      <!-- 尾页 -->
      <li class="page-item">
        <a class="page-link" href="javascript:">&gt;&gt;</a>
      </li>
    </ul>
  </nav>
</template>

<script>
export default {
  name: 'Pagination',
  props: ['count'],
  data() {
    return {
      currentPage: 1
    };
  },
  methods: {
    changePage(n) {
      console.log(n);
    }
  }
};
</script>
