<template>
  <div class="max-w-4xl space-y-6">
    <!-- Header with Invite Button -->
    <div class="flex gap-4 items-center">
      <UButton @click="handleInviteTeam" color="primary">
        Invite team members
      </UButton>
      <UButton @click="handleInviteTeam" variant="outline">
        Import via CSV
      </UButton>
    </div>

    <!-- Team Members Table -->
    <UTable :data="teamMembers" :columns="columns" class="flex-1" />
  </div>
</template>

<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'

const UAvatar = resolveComponent('UAvatar')
const USelect = resolveComponent('USelect')
const UBadge = resolveComponent('UBadge')
const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')

interface TeamMember {
  id: string
  name: string
  email: string
  initials: string
  role: string
  status: 'Active' | 'Pending'
}

const teamMembers = ref<TeamMember[]>([
  {
    id: '1',
    name: 'Onyekachi Mbaike',
    email: 'onyekachi.mbaike@gmail.com',
    initials: 'OM',
    role: 'Admin',
    status: 'Active'
  },
  {
    id: '2',
    name: 'John Doe',
    email: 'john.doe@example.com',
    initials: 'JD',
    role: 'WorkspaceManager',
    status: 'Active'
  },
  {
    id: '3',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    initials: 'JS',
    role: 'User',
    status: 'Pending'
  },
  {
    id: '4',
    name: 'Mike Johnson',
    email: 'mike.johnson@example.com',
    initials: 'MJ',
    role: 'FinanceApprover',
    status: 'Active'
  }
])

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
  'Admin',
  'WorkspaceManager',
  'FinanceApprover',
  'User'
]

function handleInviteTeam() {
  // TODO: Implement invite team member logic
  console.log('Invite team member clicked')
}

function handleRoleChange(member: TeamMember) {
  // TODO: Implement role change logic
  console.log('Role changed for', member.name, 'to', member.role)
}

function getMemberActions(member: TeamMember) {
  return [
    [
      {
        label: 'Edit member',
        icon: 'i-heroicons-pencil',
        onSelect: () => console.log('Edit', member.name)
      },
      {
        label: 'Resend invitation',
        icon: 'i-heroicons-envelope',
        onSelect: () => console.log('Resend invitation to', member.name),
        disabled: member.status === 'Active'
      }
    ],
    [
      {
        label: 'Remove member',
        icon: 'i-heroicons-trash',
        onSelect: () => console.log('Remove', member.name),
        class: 'text-error'
      }
    ]
  ]
}
</script>
