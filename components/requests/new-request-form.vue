<template>
  <div class="bg-white flex space-y-8 space-x-8">
    <UForm :state="state" class="space-y-8 w-md" @submit="onSubmit">
      <!-- Request Type -->
      <UFormField label="Request type" name="requestType" required>
        <USelectMenu
          v-model="selectedWorkflow"
          :items="workflows"
          label-key="name"
          placeholder="Select request type"
          class="w-full"
          size="lg"
        />
      </UFormField>
      
      <!-- Dynamic Workflow Fields -->
      <div v-if="selectedWorkflow" class="space-y-6">
        <USeparator />
        <template v-for="(field, index) in selectedWorkflow.fields" :key="index">
          <UFormField :label="field.label" :name="`field_${index}`" required>
            <UInput
              v-if="field.type === WorkflowFieldType.string"
              v-model="state.fields[index]"
              type="text"
              class="w-full"
              :placeholder="field.description"
              size="lg"
            />
            <UInput
              v-else-if="field.type === WorkflowFieldType.amount || field.type === WorkflowFieldType.integer || field.type === WorkflowFieldType.decimal"
              v-model="state.fields[index]"
              type="number"
              class="w-full"
              :placeholder="field.description"
              size="lg"
            />
            <UTextarea
              v-else-if="field.type === WorkflowFieldType.text"
              v-model="state.fields[index]"
              class="w-full"
              :placeholder="field.description"
              :rows="5"
              size="lg"
            />
            <UInput
              v-else
              v-model="state.fields[index]"
              type="text"
              class="w-full"
              :placeholder="field.description"
              size="lg"
            />
          </UFormField>
        </template>

        <!-- Followers -->
        <UFormField v-if="selectedWorkflow" label="Followers" name="followers">
          <div class="space-y-2">
            <USelectMenu
              v-model="selectedFollowers"
              :items="followers"
              label-key="email"
              placeholder="Select followers"
              size="lg"
              multiple
              class="w-full"
            />
            <div v-if="selectedFollowers.length > 0" class="flex flex-wrap gap-2">
              <UBadge v-for="follower in selectedFollowers" :key="follower.email" color="neutral" variant="outline" size="lg">
                {{ follower.firstName }} {{ follower.lastName }}
              </UBadge>
            </div>
          </div>
          <template #help>
            Everyone on this list will get notified when this request is updated
          </template>
        </UFormField>

        <!-- Submit Button -->
        <div class="flex py-4">
          <UButton
            type="submit"
            color="primary"
            size="lg"
            :loading="loading"
            class="w-full justify-center"
          >
            Submit request
          </UButton>
        </div>
      </div>
    </UForm>

    <div class="w-md space-y-8">
      <!-- Approvers (auto-populated from workflow) -->
      <UFormField v-if="selectedWorkflow" label="Approvers" name="approvers">
        <div class="flex flex-col bg-elevated p-3 space-y-3 pb-4">
          <div v-for="(step, stepIndex) in selectedWorkflow.steps" :key="stepIndex" class="space-y-1">
            <h3 class="text-[10px] font-semibold uppercase text-muted">Level {{ stepIndex + 1 }}</h3>
            <UBadge v-for="approval in step.approvals" :key="approval.approver.email" color="neutral" variant="outline" size="lg">
              {{ approval.approver.firstName }} {{ approval.approver.lastName }}
            </UBadge>
          </div>
        </div>
      </UFormField>

      <!-- Action Taker (auto-populated from workflow) -->
      <UFormField v-if="selectedWorkflow" label="Action taker" name="actionTaker">
        <div class="flex flex-wrap gap-2 p-3 bg-elevated">
          <UBadge color="neutral" variant="outline" size="lg">
            {{ selectedWorkflow.action.actor.firstName }} {{ selectedWorkflow.action.actor.lastName }}
          </UBadge>
        </div>
      </UFormField>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { createSampleWorkflow, WorkflowFieldType, type Workflow } from '@/models/workflow'
import { sampleAdminUsers, type User } from '@/models/user'

const loading = ref(false)

// Sample workflows
const workflows = ref<Workflow[]>([
  createSampleWorkflow(),
  {
    ...createSampleWorkflow(),
    name: "Budget Approval Request"
  },
  {
    ...createSampleWorkflow(),
    name: "Employee Onboarding"
  }
])


// Sample users for followers
const followers = ref<User[] | undefined>([
  { firstName: "Bolaji", lastName: "Akande", email: "b.akande@relayos.com", phonenumber: "+234 809 623 7816", role: 1 },
  ...sampleAdminUsers
])

// Form state
const selectedWorkflow = ref<Workflow | undefined>(undefined)
const selectedFollowers = ref<User[]>([])

const state = reactive({
  requestType: '',
  followers: [] as User[],
  fields: {} as Record<number, any>
})

// Reset fields when workflow changes
watch(selectedWorkflow, (newWorkflow) => {
  if (newWorkflow) {
    state.fields = {}
  }
})

async function onSubmit() {
  loading.value = true

  try {
    // TODO: Implement API call to create request
    console.log('Creating request:', {
      workflow: selectedWorkflow.value,
      followers: selectedFollowers.value,
      fields: state.fields
    })

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Navigate back to requests list
    await navigateTo('/requests')
  } catch (error) {
    console.error('Error creating request:', error)
  } finally {
    loading.value = false
  }
}
</script>
