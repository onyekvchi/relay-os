<!-- Table Empty state -->
<!-- Table Loading state -->
<!-- Table Data state -->
<!-- Table Filtering state -->
<template>
  <div class=" border border-muted">
    <UTable :data="workflows || []" :columns="columns" @select="handleRowClick" class="cursor-pointer" />
  </div>
</template>

<script setup lang="ts">
import type { TableColumn, TableRow } from '@nuxt/ui'
import type { Workflow } from '@/models/workflow'
import { routes } from '@/routes'

const UBadge = resolveComponent('UBadge')
const { getWorkflows } = useWorkflowsApi()

// Fetch workflows from API (already mapped to domain models)
const { data: workflows, pending, error } = await getWorkflows()

const columns: TableColumn<Workflow & { id: string }>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorFn: (row) => {
      return row.fields.length
    },
    header: 'Fields'
  },
  {
    accessorFn: (row) => {
      return row.steps.length
    },
    header: 'Steps'
  },
  {
    accessorFn: (row) => {
      return row.status
    },
    header: 'Status'
  },
]

const handleRowClick = (row: TableRow<Workflow>) => {
  navigateTo(routes.workflow(row.original.id))
}
</script>
