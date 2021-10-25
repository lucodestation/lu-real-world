import store from '@/store';

// 自定义迭代器
const errorDetail2Iterator = (errorDetailArray) => {
  const errorList = {
    length: errorDetailArray.length,
    [Symbol.iterator]: function* () {
      let index = 0;
      while (index < errorDetailArray.length) {
        // 这里用 map 或报错。Unexpected strict mode reserved word 意外的严格模式保留字。估计是一旦用了 map ，yield 是在一个函数内部，而 yield 应该用在循环内部
        // errorDetailArray.map((item) => {
        let value = '';
        for (const prop in errorDetailArray[index]) {
          value = errorDetailArray[index][prop];
        }
        index++;
        yield value;
        // });
      }
    }
  };
  return errorList;
};

const errorHandle = (error) => {
  if (!error || error.length === 0) {
    store.commit('changeErrorArray', []);
    return;
  }

  if (typeof error === 'string') {
    store.commit('changeErrorArray', [error]);
    return;
  }

  // // 自定义迭代器
  // const errorList = errorDetail2Iterator(error);

  // const arr = [];
  // // 迭代
  // for (const item of errorList) {
  //   arr.push(item);
  // }

  // 把错误信息提交到 store
  store.commit('changeErrorArray', error);
};

export { errorHandle };
