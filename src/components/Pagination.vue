<template>
  <list-pagination>
    <nav style="text-align: center">
      <ul class="pagination">
        <li class="page-item active">
          <a class="page-link" href="javascript:">1</a>
        </li>
        <li class="page-item">
          <a class="page-link" href="javascript:">2</a>
        </li>
        <li class="page-item">
          <a class="page-link" href="javascript:">
            <i class="ion-load-a"></i>
          </a>
        </li>
        <li class="page-item active">
          <a class="page-link" href="javascript:">
            <i class="ion-load-a"></i>
          </a>
        </li>
      </ul>
    </nav>
  </list-pagination>
</template>

<script>
export default {
  name: 'Pagination'
};
</script>
