<template>
  <AuthHeader title="Check your email" :description="`We sent a password reset link to ${email || 'your email'}`" center />

  <div class="w-full space-y-4">
    <UButton
      v-if="emailProvider"
      variant="outline"
      block
      :to="emailProvider.link"
      external
      target="_blank"
    >
      Open {{ emailProvider.name }}
    </UButton>
  </div>

  <div class="flex justify-center">
    <AuthBackButton label="Back to log in" :href="routes.signIn" />
  </div>
</template>

<script setup lang="ts">
import { routes } from '~/routes'

definePageMeta({
  layout: 'auth',
  middleware: 'auth'
})

const route = useRoute()
const email = route.query.email as string

const emailProvider = computed(() => {
  if (!email) return null
  
  // Extract email provider from email address
  const domain = email.split('@')[1]?.toLowerCase()
  
  if (!domain) return null
  
  // Map common email providers to their web URLs
  const providers: Record<string, { name: string; link: string }> = {
    'gmail.com': {
      name: 'Gmail',
      link: 'https://gmail.com'
    },
    'outlook.com': {
      name: 'Outlook',
      link: 'https://outlook.live.com'
    },
    'hotmail.com': {
      name: 'Outlook',
      link: 'https://outlook.live.com'
    },
    'yahoo.com': {
      name: 'Yahoo',
      link: 'https://mail.yahoo.com'
    },
    'icloud.com': {
      name: 'iCloud',
      link: 'https://icloud.com/mail'
    },
    'me.com': {
      name: 'iCloud',
      link: 'https://icloud.com/mail'
    }
  }
  
  return providers[domain] || null
})
</script>