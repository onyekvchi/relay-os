<template>
  <div class="container mx-auto p-8 space-y-8">
    <div>
      <h1 class="text-3xl font-bold mb-2">API Composables Test</h1>
      <p class="text-muted-foreground">Testing the new API composables with MSW handlers</p>
    </div>

    <div class="grid gap-6">
      <!-- Workflows Test -->
      <UCard>
        <template #header>
          <h2 class="text-xl font-semibold">Workflows API</h2>
        </template>
        
        <div class="space-y-4">
          <div>
            <UButton @click="testGetWorkflows" :loading="workflowsLoading">
              Get All Workflows
            </UButton>
            <div v-if="workflowsData" class="mt-2 p-3 bg-muted rounded text-sm">
              <p class="font-medium">Success: {{ workflowsData.success }}</p>
              <p>Count: {{ workflowsData.data?.length || 0 }}</p>
              <p v-if="workflowsData.data?.[0]">First: {{ workflowsData.data[0].name }}</p>
            </div>
            <div v-if="workflowsError" class="mt-2 p-3 bg-destructive/10 text-destructive rounded text-sm">
              Error: {{ workflowsError }}
            </div>
          </div>

          <div>
            <UButton @click="testGetWorkflow" :loading="workflowLoading">
              Get Single Workflow
            </UButton>
            <div v-if="workflowData" class="mt-2 p-3 bg-muted rounded text-sm">
              <p class="font-medium">Success: {{ workflowData.success }}</p>
              <p>Name: {{ workflowData.data?.name }}</p>
              <p>Fields: {{ workflowData.data?.fields.length }}</p>
            </div>
            <div v-if="workflowError" class="mt-2 p-3 bg-destructive/10 text-destructive rounded text-sm">
              Error: {{ workflowError }}
            </div>
          </div>
        </div>
      </UCard>

      <!-- Requests Test -->
      <UCard>
        <template #header>
          <h2 class="text-xl font-semibold">Requests API</h2>
        </template>
        
        <div class="space-y-4">
          <div>
            <UButton @click="testGetRequests" :loading="requestsLoading">
              Get All Requests
            </UButton>
            <div v-if="requestsData" class="mt-2 p-3 bg-muted rounded text-sm">
              <p class="font-medium">Success: {{ requestsData.success }}</p>
              <p>Count: {{ requestsData.data?.length || 0 }}</p>
              <p v-if="requestsData.data?.[0]">First Status: {{ requestsData.data[0].status }}</p>
            </div>
            <div v-if="requestsError" class="mt-2 p-3 bg-destructive/10 text-destructive rounded text-sm">
              Error: {{ requestsError }}
            </div>
          </div>

          <div>
            <UButton @click="testGetRequest" :loading="requestLoading">
              Get Single Request
            </UButton>
            <div v-if="requestData" class="mt-2 p-3 bg-muted rounded text-sm">
              <p class="font-medium">Success: {{ requestData.success }}</p>
              <p>Status: {{ requestData.data?.status }}</p>
              <p>Workflow: {{ requestData.data?.workflow.name }}</p>
            </div>
            <div v-if="requestError" class="mt-2 p-3 bg-destructive/10 text-destructive rounded text-sm">
              Error: {{ requestError }}
            </div>
          </div>
        </div>
      </UCard>

      <!-- Users Test -->
      <UCard>
        <template #header>
          <h2 class="text-xl font-semibold">Users API</h2>
        </template>
        
        <div class="space-y-4">
          <div>
            <UButton @click="testGetUsers" :loading="usersLoading">
              Get All Users
            </UButton>
            <div v-if="usersData" class="mt-2 p-3 bg-muted rounded text-sm">
              <p class="font-medium">Success: {{ usersData.success }}</p>
              <p>Count: {{ usersData.data?.length || 0 }}</p>
              <p v-if="usersData.data?.[0]">
                First: {{ usersData.data[0].first_name }} {{ usersData.data[0].last_name }} ({{ usersData.data[0].role }})
              </p>
            </div>
            <div v-if="usersError" class="mt-2 p-3 bg-destructive/10 text-destructive rounded text-sm">
              Error: {{ usersError }}
            </div>
          </div>

          <div>
            <UButton @click="testGetCurrentUser" :loading="currentUserLoading">
              Get Current User
            </UButton>
            <div v-if="currentUserData" class="mt-2 p-3 bg-muted rounded text-sm">
              <p class="font-medium">Success: {{ currentUserData.success }}</p>
              <p>Name: {{ currentUserData.data?.first_name }} {{ currentUserData.data?.last_name }}</p>
              <p>Role: {{ currentUserData.data?.role }}</p>
            </div>
            <div v-if="currentUserError" class="mt-2 p-3 bg-destructive/10 text-destructive rounded text-sm">
              Error: {{ currentUserError }}
            </div>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
const { getWorkflows, getWorkflow } = useWorkflowsApi()
const { getRequests, getRequest } = useRequestsApi()
const { getCurrentUser } = useUsersApi()
const { getCurrentWorkspaceMembers } = useWorkspaceApi()

// Workflows
const workflowsData = ref<any>(null)
const workflowsError = ref<string | null>(null)
const workflowsLoading = ref(false)

const workflowData = ref<any>(null)
const workflowError = ref<string | null>(null)
const workflowLoading = ref(false)

// Requests
const requestsData = ref<any>(null)
const requestsError = ref<string | null>(null)
const requestsLoading = ref(false)

const requestData = ref<any>(null)
const requestError = ref<string | null>(null)
const requestLoading = ref(false)

// Users
const usersData = ref<any>(null)
const usersError = ref<string | null>(null)
const usersLoading = ref(false)

const currentUserData = ref<any>(null)
const currentUserError = ref<string | null>(null)
const currentUserLoading = ref(false)

// Test functions
async function testGetWorkflows() {
  workflowsLoading.value = true
  workflowsError.value = null
  try {
    const { data, error } = await getWorkflows()
    if (error.value) {
      workflowsError.value = error.value.message
    } else {
      workflowsData.value = data.value
    }
  } catch (e: any) {
    workflowsError.value = e.message
  } finally {
    workflowsLoading.value = false
  }
}

async function testGetWorkflow() {
  workflowLoading.value = true
  workflowError.value = null
  try {
    const { data, error } = await getWorkflow('workflow-1')
    if (error.value) {
      workflowError.value = error.value.message
    } else {
      workflowData.value = data.value
    }
  } catch (e: any) {
    workflowError.value = e.message
  } finally {
    workflowLoading.value = false
  }
}

async function testGetRequests() {
  requestsLoading.value = true
  requestsError.value = null
  try {
    const { data, error } = await getRequests()
    if (error.value) {
      requestsError.value = error.value.message
    } else {
      requestsData.value = data.value
    }
  } catch (e: any) {
    requestsError.value = e.message
  } finally {
    requestsLoading.value = false
  }
}

async function testGetRequest() {
  requestLoading.value = true
  requestError.value = null
  try {
    const { data, error } = await getRequest('request-1')
    if (error.value) {
      requestError.value = error.value.message
    } else {
      requestData.value = data.value
    }
  } catch (e: any) {
    requestError.value = e.message
  } finally {
    requestLoading.value = false
  }
}

async function testGetUsers() {
  usersLoading.value = true
  usersError.value = null
  try {
    const response = await getCurrentWorkspaceMembers()
    if (response?.data) {
      usersData.value = response.data
    } else {
      usersError.value = 'No data returned'
    }
  } catch (e: any) {
    usersError.value = e.message
  } finally {
    usersLoading.value = false
  }
}

async function testGetCurrentUser() {
  currentUserLoading.value = true
  currentUserError.value = null
  try {
    const { data, error } = await getCurrentUser()
    if (error.value) {
      currentUserError.value = error.value.message
    } else {
      currentUserData.value = data.value
    }
  } catch (e: any) {
    currentUserError.value = e.message
  } finally {
    currentUserLoading.value = false
  }
}
</script>
