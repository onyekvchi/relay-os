<script setup lang="ts">
import { routes } from '~/routes'

const { isAuthenticated } = useAuthStore()
await navigateTo(isAuthenticated ? routes.dashboard : routes.signIn, { replace: true })
</script>
