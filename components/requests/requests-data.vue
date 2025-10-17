<!-- Table Empty state -->
<!-- Table Loading state -->
<!-- Table Data state -->
<!-- Table Filtering state -->
<template>
  <div class=" border border-muted">
    <UTable :data="requests" :columns="columns" />
  </div>
</template>

<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { sampleRequest } from '@/models/request';
import type { Request } from '@/models/request';

const requests = ref<Request[]>([])

for (let index = 0; index < 10; index++) {
  requests.value.push(sampleRequest)
}

const columns: TableColumn<Request>[] = [
  {
    accessorKey: 'type.name',
    header: 'Request type',
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
    // accessorKey: 'status',
    accessorFn: (row) => row.status.toString(),
    header: 'Status',
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
</script>