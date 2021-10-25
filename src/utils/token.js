import { tokenPrefix } from '@/config/index.js';

export default () => {
  const token = localStorage.getItem('token');
  // console.log('token.js token:', token);
  return tokenPrefix + token;
};
