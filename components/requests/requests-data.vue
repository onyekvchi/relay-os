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
import type { Request } from '@/models/request'
import { RequestMapper } from '@/models/request/request.mapper'
import { h } from 'vue'
import { routes } from '@/routes'

const UBadge = resolveComponent('UBadge')
const { getRequests } = useRequestsApi()

// Fetch requests from API
const { data: requestsResponse, pending, error } = await getRequests()

// Map DTO to domain model using mapper
const requests = computed(() => {
  if (!requestsResponse.value?.data) return []
  return RequestMapper.toDomainList(requestsResponse.value.data)
})

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