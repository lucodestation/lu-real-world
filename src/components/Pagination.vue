<template>
  <nav style="text-align: center">
    <ul class="pagination">
      <!-- 首页 -->
      <li class="page-item" v-show="currentPage !== 1 && totalPage > 2">
        <a class="page-link" @click="changePage('start')" href="javascript:"
          >&lt;&lt;</a
        >
      </li>
      <!-- 上一页 -->
      <li class="page-item" v-show="currentPage !== 1">
        <a class="page-link" href="javascript:" @click="changePage('prev')"
          >&lt;</a
        >
      </li>
      <!-- 页码 -->
      <li
        class="page-item"
        :class="{
          active: currentPage === item
        }"
        v-for="item in totalPage <= 10 ? totalPage : pageNumber"
        :key="item"
        @click="changePage(item)"
      >
        <a class="page-link" href="javascript:">{{ item }}</a>
      </li>
      <li class="page-item" v-show="currentPage !== totalPage">
        <a class="page-link" href="javascript:" @click="changePage('next')"
          >&gt;</a
        >
      </li>
      <!-- 尾页 -->
      <li class="page-item" v-show="currentPage !== totalPage && totalPage > 2">
        <a class="page-link" @click="changePage('end')" href="javascript:"
          >&gt;&gt;</a
        >
      </li>
    </ul>
  </nav>
</template>

<script>
export default {
  name: 'Pagination',
  props: ['articlesCount', 'limit', 'currentPage'],
  data() {
    return {
      pageNumber: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      totalPage: Math.ceil(this.articlesCount / this.limit)
    };
  },
  // computed: {
  //   totalPage() {
  //     // return 3;
  //     return Math.ceil(this.articlesCount / this.limit);
  //   }
  // },
  watch: {
    articlesCount() {
      this.totalPage = Math.ceil(this.articlesCount / this.limit);
      const page = this.currentPage;
      this.$emit('changePage', -1);
      this.$emit('changePage', page);
    },
    currentPage() {
      if (this.currentPage > 6) {
        // console.log('变', this.currentPage - 5);
        const a = this.currentPage - 5;
        const arr = [];
        for (let i = a; i < this.currentPage + 5; i++) {
          arr.push(i);
        }
        // console.log(arr);
        this.pageNumber = arr;
      }
      if (this.currentPage >= this.totalPage - 4) {
        const a = this.totalPage - 9;
        const arr = [];
        for (let i = a; i <= this.totalPage; i++) {
          arr.push(i);
        }
        // console.log(arr);
        this.pageNumber = arr;
      }
      if (this.totalPage > 10 && this.currentPage <= 6) {
        this.pageNumber = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      }
      if (this.totalPage <= 10) {
        // console.log('10 页以内');
        const arr = [];
        for (let i = 1; i <= this.totalPage; i++) {
          arr.push(i);
        }
        // console.log(arr);
        this.pageNumber = arr;
      }
    }
  },
  methods: {
    // 向父元素提交页码
    changePage(increment) {
      let page = 1;
      if (increment === 'start') {
        page = 1;
      } else if (increment === 'end') {
        page = this.totalPage;
      } else if (increment === 'prev') {
        page = this.currentPage - 1;
      } else if (increment === 'next') {
        page = this.currentPage + 1;
      } else if (increment === this.currentPage) {
        return;
      } else {
        page = increment;
      }
      this.$emit('changePage', page);
    }
  }
};
</script>
