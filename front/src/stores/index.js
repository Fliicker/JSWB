import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  const isLoggedIn = ref(false);
  const id = ref(null);
  const username = ref(null);
  const role = ref(null);

  function login(_id, _username, _role, _token) {
    isLoggedIn.value = true;
    id.value = _id
    username.value = _username;
    role.value = _role;
    window.sessionStorage.setItem("token", _token);
  }

  function logout() {
    id.value = null
    isLoggedIn.value = false;
    username.value = null;
    role.value = null;
    window.sessionStorage.setItem("token", null);
  }

  return { isLoggedIn, id, username, role, login, logout }
});