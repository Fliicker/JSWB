import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  const isLoggedIn = ref(false);
  const id = ref(null);
  const username = ref(null);
  const role = ref(null);
  const token = ref(null);

  function login(_id, _username, _role, _token) {
    isLoggedIn.value = true;
    id.value = _id
    username.value = _username;
    role.value = _role;
    token.value = _token
  }

  function logout() {
    id.value = null
    isLoggedIn.value = false;
    username.value = null;
    role.value = null;
    token.value = null;
  }

  return { isLoggedIn, id, username, role, token, login, logout }
});