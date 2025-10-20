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
import { mockWorkflow } from '@/models/factories'
import { h, ref, computed } from 'vue'
import { routes } from '@/routes'

const UBadge = resolveComponent('UBadge')

// Extended workflow type with ID
type WorkflowWithId = Workflow & { id: string }

const workflows = ref<WorkflowWithId[]>([])

for (let index = 0; index < 2; index++) {
  workflows.value.push({
    ...mockWorkflow(),
    id: (index + 1).toString()
  })
}

const columns: TableColumn<WorkflowWithId>[] = [
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

const handleRowClick = (row: TableRow<WorkflowWithId>) => {
  navigateTo(routes.workflow(row.id))
}
</script>
