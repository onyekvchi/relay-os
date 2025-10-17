import { type UserData } from "~/types/auth";

export const useAuthStore = defineStore('authStore', () => {
  const user = ref<UserData | null>(null);
  const token = ref<string | null>(null);
  const expiry = ref<number | null>(null);
  
  const isAuthenticated = computed(() => {
    const isTokenValid = !!token.value
    const isUserValid = !!user.value
    const isExpiryValid = !!expiry.value && Date.now() < expiry.value;
    return isTokenValid && isUserValid && isExpiryValid;
  })
  const getUser = computed(() => user.value);
  const getToken = computed(() => token.value);
  const getUserId = computed(() => user.value?.id);
  
  function setUser(newUser: UserData) {
    user.value = newUser;
  }
  
  function setToken(newToken: string) {
    token.value = newToken;
  }
  
  function setAuth({ user: newUser, token: newToken }: { user: UserData; token: string }) {
    user.value = newUser;
    token.value = newToken;
    expiry.value = Date.now() + 2 * 24 * 60 * 60 * 1000; // 2 days
  }
  
  function clearAuth() {
    user.value = null;
    token.value = null;
    expiry.value = null;
  }
  
  return {
    // State
    user,
    token,
    expiry,
    
    // Getters
    isAuthenticated,
    getUser,
    getToken,
    getUserId,
    
    // Actions
    setUser,
    setToken,
    setAuth,
    clearAuth
  };
},
{
  persist: {
    storage: piniaPluginPersistedstate.localStorage(),
  }
});