<template>
  <AuthHeader title="You've got mail!" 
    :description="`Please check your email for a verification link to complete your registration.`" 
    center
  />

  <div v-if="emailProvider" class="w-full">
    <UButton
      variant="outline"
      block
      :to="emailProvider.link"
      external
      target="_blank"
    >
      Open {{ emailProvider.name }}
    </UButton>
  </div>
</template>

<script setup lang="ts">
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