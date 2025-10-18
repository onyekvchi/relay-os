<!-- Table Empty state -->
<!-- Table Loading state -->
<!-- Table Data state -->
<!-- Table Filtering state -->
<template>
  <div class=" border border-muted">
    <UTable :data="workflows" :columns="columns" />
  </div>
</template>

<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { createSampleWorkflow, type Workflow } from '@/models/workflow';
import { h, ref, computed } from 'vue'

const UBadge = resolveComponent('UBadge')

const workflows = ref<Workflow[]>([])

for (let index = 0; index < 2; index++) {
  workflows.value.push(createSampleWorkflow())
}

const columns: TableColumn<Workflow>[] = [
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
</script>
