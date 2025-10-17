<template>
  <header class="bg-white border-b border-muted">
      <div class="container mx-auto px-4 py-2 flex justify-between items-center">
        <div class="flex gap-6 items-center">
          <h1 class="text-sm font-bold font-mono tracking-tighter py-2 px-4 bg-primary text-inverted">relay-os</h1>
          <UNavigationMenu orientation="horizontal" :items="navigationItems" :ui="{
            list: 'gap-4',
            link: 'px-2 py-2 text-sm gap-4',
            linkLeadingIcon: 'size-4'
          }"/>
        </div>
        <div class="flex items-center gap-4">
          <UButton @click="handleLogout" variant="outline">
            Logout
          </UButton>
        </div>
      </div>
    </header>
</template>

<script setup lang="ts">
import { routes } from "@/routes";
const { getUser, clearAuth } = useAuthStore();

const handleLogout = async () => {
  clearAuth();
  await navigateTo(routes.signIn);
};

const { path } = useRoute()

const navigationItems = [
{
  label: "Home",
  to: "dashboard",
  icon: "",
  active: path.startsWith("dashboard"),
},
{
  label: "Requests",
  to: "requests",
  icon: "",
  active: path.startsWith("requests"),
},
{
  label: "Workflows",
  to: "workflows",
  icon: "",
  active: path.startsWith("workflows"),
},
{
  label: "Metrics",
  to: "metrics",
  icon: "",
  active: path.startsWith("metrics"),
}
]
</script>