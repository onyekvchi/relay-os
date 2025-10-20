<!-- Table Empty state -->
<!-- Table Loading state -->
<!-- Table Data state -->
<!-- Table Filtering state -->
<template>
  <div class=" border border-muted">
    <UTable :data="requests" :columns="columns" @select="handleRowClick" class="cursor-pointer" />
  </div>
</template>

<script setup lang="ts">
import type { TableColumn, TableRow } from '@nuxt/ui'
import { mockRequest } from '@/models/factories'
import type { Request } from '@/models/request';
import { h, ref } from 'vue'
import { routes } from '@/routes'

const UBadge = resolveComponent('UBadge')
const requests = ref<Request[]>([])

for (let index = 0; index < 10; index++) {
  requests.value.push(mockRequest({ id: (index + 1).toString() }))
}

const columns: TableColumn<Request>[] = [
  {
    accessorKey: 'type.name',
    header: 'Type',
  },
  {
    accessorFn: (row) => {
      const firstName = row.initiator.firstName
      const lastName = row.initiator.lastName
      return `${firstName} ${lastName}`
    },
    header: 'Requester'
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      return h(UBadge, { color: 'neutral', variant: 'soft' }, () => status)
    }
  },
  {
    header: 'Date created',
    accessorFn: (row) => formatDate(row.createdAt)
  },
]

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleRowClick = (row: TableRow<Request>) => {
  navigateTo(routes.request(row.id))
}
</script>