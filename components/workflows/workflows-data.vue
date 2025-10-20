<!-- Table Empty state -->
<!-- Table Loading state -->
<!-- Table Data state -->
<!-- Table Filtering state -->
<template>
  <div class=" border border-muted">
    <UTable :data="workflows" :columns="columns" @select="handleRowClick" class="cursor-pointer" />
  </div>
</template>

<script setup lang="ts">
import type { TableColumn, TableRow } from '@nuxt/ui'
import type { Workflow } from '@/models/workflow'
import { WorkflowMapper } from '@/models/workflow/workflow.mapper'
import { routes } from '@/routes'

const UBadge = resolveComponent('UBadge')
const { getWorkflows } = useWorkflowsApi()

// Fetch workflows from API
const { data: workflowsResponse, pending, error } = await getWorkflows()

// Map DTO to domain model using mapper
const workflows = computed(() => {
  if (!workflowsResponse.value?.data) return []
  return WorkflowMapper.toDomainList(workflowsResponse.value.data)
})

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
      return row.approvals.length
    },
    header: 'Approvals'
  },
  {
    accessorFn: (row) => {
      const firstName = row.action.actor.firstName
      const lastName = row.action.actor.lastName
      return `${firstName} ${lastName}`
    },
    header: 'Executor'
  },
]

const handleRowClick = (row: TableRow<Workflow & { id: string }>) => {
  navigateTo(routes.workflow(row.id))
}
</script>
