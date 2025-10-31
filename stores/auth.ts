import type { User } from "~/models/user";

export const useAuthStore = defineStore('authStore', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const refreshToken = ref<string | null>(null);
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
  const getCurrentWorkspaceId = computed(() => {
    const workspaceId = user.value?.last_active_workspace_id
    if (!workspaceId) throw new Error('No active workspace')
    return workspaceId
  });
  
  function setUser(newUser: User) {
    user.value = newUser;
  }
  
  function setToken(newToken: string) {
    token.value = newToken;
  }
  
  function setAuth({ 
    user: newUser, 
    access_token, 
    refresh_token: newRefreshToken, 
    expires_in 
  }: { 
    user: User; 
    access_token: string; 
    refresh_token: string; 
    expires_in: number; 
  }) {
    user.value = newUser;
    token.value = access_token;
    refreshToken.value = newRefreshToken;
    expiry.value = Date.now() + expires_in * 1000;
  }
  
  function clearAuth() {
    user.value = null;
    token.value = null;
    refreshToken.value = null;
    expiry.value = null;
  }
  
  return {
    // State
    user,
    token,
    refreshToken,
    expiry,
    
    // Getters
    isAuthenticated,
    getUser,
    getToken,
    getUserId,
    getCurrentWorkspaceId,
    
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