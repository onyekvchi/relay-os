<template>
  <div class="max-w-4xl space-y-6">
    <!-- Success/Error Messages -->
    <UAlert
      v-if="successMessage"
      color="success"
      variant="soft"
      :title="successMessage"
      :close-button="{ icon: 'i-heroicons-x-mark-20-solid', color: 'gray', variant: 'link' }"
      @close="successMessage = null"
    />
    <UAlert
      v-if="errorMessage"
      color="error"
      variant="soft"
      :title="errorMessage"
      :close-button="{ icon: 'i-heroicons-x-mark-20-solid', color: 'gray', variant: 'link' }"
      @close="errorMessage = null"
    />

    <!-- Header with Invite Button -->
    <div v-if="canAddTeamMembers" class="flex gap-4 items-center">
      <UButton @click="showInviteModal = true" color="primary">
        Invite team members
      </UButton>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center py-8">
      <UIcon name="i-heroicons-arrow-path" class="animate-spin size-6" />
    </div>

    <!-- Team Members Table -->
    <UTable v-else :data="teamMembers" :columns="columns" class="flex-1" />

    <!-- Invite Modal -->
    <UModal v-model:open="showInviteModal" title="Invite team member">
      <template #body>
        <div class="space-y-4">
          <UFormField label="Email" required>
            <UInput
              v-model="inviteForm.email"
              type="email"
              placeholder="email@example.com"
              class="w-full"
            />
          </UFormField>
          <UFormField label="First name" required>
            <UInput
              v-model="inviteForm.first_name"
              placeholder="John"
              class="w-full"
            />
          </UFormField>
          <UFormField label="Last name" required>
            <UInput
              v-model="inviteForm.last_name"
              placeholder="Doe"
              class="w-full"
            />
          </UFormField>
          <UFormField label="Role" required>
            <USelect
              v-model="inviteForm.role"
              :items="roleOptions"
              class="w-full"
            />
          </UFormField>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton variant="outline" @click="showInviteModal = false">
            Cancel
          </UButton>
          <UButton
            :loading="isInviting"
            :disabled="!canInvite"
            @click="handleInviteMember"
          >
            Send invitation
          </UButton>
        </div>
      </template>
    </UModal>

    <!-- Edit Role Modal -->
    <UModal v-model:open="showEditRoleModal" title="Change member role">
      <template #body>
        <div v-if="selectedMember" class="space-y-4">
          <p class="text-sm text-muted">Change role for <span class="font-semibold text-highlighted">{{ selectedMember.name }}</span></p>
          <UFormField label="Role" required>
            <USelect
              v-model="editRoleForm.role"
              :items="roleOptions"
              class="w-full"
            />
          </UFormField>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton variant="outline" @click="showEditRoleModal = false">
            Cancel
          </UButton>
          <UButton
            :loading="isUpdatingRole"
            @click="handleUpdateRole"
          >
            Update role
          </UButton>
        </div>
      </template>
    </UModal>

    <!-- Remove Member Modal -->
    <UModal v-model:open="showRemoveModal" title="Remove team member">
      <template #body>
        <div v-if="selectedMember" class="space-y-4">
          <p class="text-sm">Are you sure you want to remove <span class="font-semibold">{{ selectedMember.name }}</span> from the team?</p>
          <p class="text-sm text-muted">This action cannot be undone.</p>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton variant="outline" @click="showRemoveModal = false">
            Cancel
          </UButton>
          <UButton
            color="error"
            :loading="isRemoving"
            @click="confirmRemoveMember"
          >
            Remove member
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import { UserMapper } from '@/models/user'
import type { UserDTO } from '@/models/user/user.dto'

const UAvatar = resolveComponent('UAvatar')
const USelect = resolveComponent('USelect')
const UBadge = resolveComponent('UBadge')
const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')

const { getCurrentWorkspaceMembers, inviteWorkspaceMember, removeWorkspaceMember } = useWorkspaceApi()
const authStore = useAuthStore()
const currentUser = computed(() => authStore.getUser)
const { canAddTeamMembers, canRemoveTeamMembers, canUpdateUserRoles } = usePermissions()

interface TeamMember {
  id: string
  name: string
  email: string
  initials: string
  role: string
  status: 'Active' | 'Pending'
}

// State
const teamMembers = ref<TeamMember[]>([])
const isLoading = ref(false)
const isInviting = ref(false)
const isUpdatingRole = ref(false)
const isRemoving = ref(false)
const showInviteModal = ref(false)
const showEditRoleModal = ref(false)
const showRemoveModal = ref(false)
const selectedMember = ref<TeamMember | null>(null)
const successMessage = ref<string | null>(null)
const errorMessage = ref<string | null>(null)

// Forms
const inviteForm = ref({
  email: '',
  first_name: '',
  last_name: '',
  role: 'User'
})

const editRoleForm = ref({
  role: 'User'
})

const canInvite = computed(() => {
  return (
    inviteForm.value.email.length > 0 &&
    inviteForm.value.first_name.length > 0 &&
    inviteForm.value.last_name.length > 0
  )
})

// Fetch team members on mount
onMounted(async () => {
  await fetchTeamMembers()
})

async function fetchTeamMembers() {
  isLoading.value = true
  errorMessage.value = null
  
  try {
    const response = await getCurrentWorkspaceMembers()
    
    if (response?.data) {
      // Transform DTOs to display format
      teamMembers.value = response.data.map((member) => {
        return {
          id: member.user_id,
          name: `${member.first_name} ${member.last_name}`,
          email: member.email,
          initials: `${member.first_name[0]}${member.last_name[0]}`,
          role: member.role,
          status: member.status === 'active' ? 'Active' as const : 'Pending' as const
        }
      })
    }
  } catch (err: any) {
    errorMessage.value = err.message || 'Failed to load team members'
  } finally {
    isLoading.value = false
  }
}

async function handleInviteMember() {
  isInviting.value = true
  errorMessage.value = null
  
  try {
    const response = await inviteWorkspaceMember(inviteForm.value)
    
    if (response) {
      successMessage.value = `Invitation sent to ${inviteForm.value.email}`
      showInviteModal.value = false
      
      // Reset form
      inviteForm.value = {
        email: '',
        first_name: '',
        last_name: '',
        role: 'User'
      }
      
      // Refresh team list
      await fetchTeamMembers()
    }
  } catch (err: any) {
    errorMessage.value = err.message || 'Failed to invite team member'
  } finally {
    isInviting.value = false
  }
}

function openEditRoleModal(member: TeamMember) {
  selectedMember.value = member
  editRoleForm.value.role = member.role
  showEditRoleModal.value = true
}

async function handleUpdateRole() {
  if (!selectedMember.value) return
  
  isUpdatingRole.value = true
  errorMessage.value = null
  
  try {
    // TODO: Add API call to update role
    // For now, just update locally
    const member = teamMembers.value.find(m => m.id === selectedMember.value!.id)
    if (member) {
      member.role = editRoleForm.value.role
    }
    
    successMessage.value = `Role updated for ${selectedMember.value.name}`
    showEditRoleModal.value = false
    selectedMember.value = null
  } catch (err: any) {
    errorMessage.value = err.message || 'Failed to update role'
  } finally {
    isUpdatingRole.value = false
  }
}

function openRemoveModal(member: TeamMember) {
  selectedMember.value = member
  showRemoveModal.value = true
}

async function confirmRemoveMember() {
  if (!selectedMember.value) return
  
  isRemoving.value = true
  
  try {
    await removeWorkspaceMember(selectedMember.value.id)

    successMessage.value = `${selectedMember.value.name} has been removed from the team`
    showRemoveModal.value = false
    selectedMember.value = null
    await fetchTeamMembers()
  } catch (err: any) {
    errorMessage.value = err.message || 'Failed to remove team member'
  } finally {
    isRemoving.value = false
  }
}

async function handleResendInvitation(member: TeamMember) {
  try {
    // TODO: Add API call to resend invitation
    successMessage.value = `Invitation resent to ${member.email}`
  } catch (err: any) {
    errorMessage.value = err.message || 'Failed to resend invitation'
  }
}

const columns: TableColumn<TeamMember>[] = [{
  accessorKey: 'name',
  header: 'Name',
  cell: ({ row }) => {
    return h('div', { class: 'flex items-center gap-3' }, [
      h(UAvatar, { text: row.original.initials, size: 'sm' }),
      h('span', { class: 'text-sm font-semibold' }, row.original.name)
    ])
  }
}, {
  accessorKey: 'email',
  header: 'Email',
  cell: ({ row }) => h('span', { class: 'text-sm text-muted' }, row.original.email)
}, {
  accessorKey: 'role',
  header: 'Role',
  cell: ({ row }) => {
    return h(UBadge, {
      variant: 'subtle',
      size: 'sm'
    }, () => row.original.role)
  }
}, {
  accessorKey: 'status',
  header: 'Status',
  cell: ({ row }) => {
    return h(UBadge, {
      color: row.original.status === 'Active' ? 'primary' : 'neutral',
      variant: 'subtle',
      size: 'sm'
    }, () => row.original.status)
  }
}, {
  id: 'actions',
  header: 'Actions',
  cell: ({ row }) => {
    return h('div', { class: 'flex justify-end' }, 
      h(UDropdownMenu, {
        items: getMemberActions(row.original),
        'aria-label': 'Actions dropdown'
      }, () => h(UButton, {
        variant: 'ghost',
        size: 'sm',
        icon: 'i-heroicons-ellipsis-horizontal',
        'aria-label': 'Actions'
      }))
    )
  }
}]

const roleOptions = [
  { label: 'Admin', value: 'Admin' },
  { label: 'Workspace Manager', value: 'WorkspaceManager' },
  { label: 'Finance Approver', value: 'FinanceApprover' },
  { label: 'User', value: 'User' }
]

function getMemberActions(member: TeamMember) {
  const isCurrentUser = member.id === currentUser.value?.id
  
  const actions = []
  
  // Only show resend for pending users
  if (member.status === 'Pending') {
    actions.push([
      {
        label: 'Resend invitation',
        icon: 'i-heroicons-envelope',
        onSelect: () => handleResendInvitation(member)
      }
    ])
  }
  
  // Show edit role if user has permission (but not for themselves)
  if (canUpdateUserRoles.value && !isCurrentUser) {
    actions.push([
      {
        label: 'Change role',
        icon: 'i-heroicons-pencil',
        onSelect: () => openEditRoleModal(member)
      }
    ])
  }
  
  // Show remove if user has permission (but not for themselves)
  if (canRemoveTeamMembers.value && !isCurrentUser) {
    actions.push([
      {
        label: 'Remove member',
        icon: 'i-heroicons-trash',
        onSelect: () => openRemoveModal(member),
        class: 'text-error'
      }
    ])
  }
  
  return actions
}
</script>
