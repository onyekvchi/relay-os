<template>
  <div class="container mx-auto p-8 space-y-8">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold">MSW API Test Page</h1>
      <UBadge :color="mswActive ? 'success' : 'error'" size="lg">
        MSW {{ mswActive ? 'Active' : 'Inactive' }}
      </UBadge>
    </div>

    <!-- Workflows Section -->
    <UAccordion :items="accordionItems" :default-open="true">
      <template #workflows>
        <div class="space-y-4 p-4">
          <div class="flex gap-2 flex-wrap">
            <UButton @click="fetchWorkflows" :loading="loading.workflows">
              Fetch All Workflows
            </UButton>
            <UButton @click="fetchSingleWorkflow" :loading="loading.singleWorkflow" color="neutral">
              Fetch Workflow #1
            </UButton>
            <UButton @click="createWorkflow" :loading="loading.createWorkflow" color="primary">
              Create Workflow
            </UButton>
          </div>

          <div v-if="workflows.length > 0" class="bg-muted p-4 rounded-lg">
            <p class="text-xs font-semibold mb-2">All Workflows ({{ workflows.length }}):</p>
            <pre class="text-xs overflow-auto max-h-96">{{ JSON.stringify(workflows, null, 2) }}</pre>
          </div>

          <div v-if="singleWorkflow" class="bg-muted p-4 rounded-lg">
            <p class="text-xs font-semibold mb-2">Single Workflow:</p>
            <pre class="text-xs overflow-auto max-h-96">{{ JSON.stringify(singleWorkflow, null, 2) }}</pre>
          </div>

          <div v-if="createdWorkflow" class="bg-green-50 p-4 rounded-lg border border-green-200">
            <p class="text-xs font-semibold mb-2 text-green-800">✅ Created Workflow:</p>
            <pre class="text-xs overflow-auto max-h-96">{{ JSON.stringify(createdWorkflow, null, 2) }}</pre>
          </div>

          <div v-if="error.workflows" class="bg-red-100 text-red-800 p-4 rounded-lg">
            <strong>Error:</strong> {{ error.workflows }}
          </div>
        </div>
      </template>

      <template #requests>
        <div class="space-y-4 p-4">
          <div class="flex gap-2 flex-wrap">
            <UButton @click="fetchRequests" :loading="loading.requests">
              Fetch All Requests
            </UButton>
            <UButton @click="createRequest" :loading="loading.createRequest" color="primary">
              Create Request
            </UButton>
            <UButton @click="approveRequest" :loading="loading.approveRequest" color="success">
              Approve Request #1
            </UButton>
          </div>

          <div v-if="requests.length > 0" class="bg-muted p-4 rounded-lg">
            <p class="text-xs font-semibold mb-2">All Requests ({{ requests.length }}):</p>
            <pre class="text-xs overflow-auto max-h-96">{{ JSON.stringify(requests, null, 2) }}</pre>
          </div>

          <div v-if="createdRequest" class="bg-green-50 p-4 rounded-lg border border-green-200">
            <p class="text-xs font-semibold mb-2 text-green-800">✅ Created Request:</p>
            <pre class="text-xs overflow-auto max-h-96">{{ JSON.stringify(createdRequest, null, 2) }}</pre>
          </div>

          <div v-if="approvedRequest" class="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p class="text-xs font-semibold mb-2 text-blue-800">✅ Approved Request:</p>
            <pre class="text-xs overflow-auto max-h-96">{{ JSON.stringify(approvedRequest, null, 2) }}</pre>
          </div>

          <div v-if="error.requests" class="bg-red-100 text-red-800 p-4 rounded-lg">
            <strong>Error:</strong> {{ error.requests }}
          </div>
        </div>
      </template>

      <template #users>
        <div class="space-y-4 p-4">
          <div class="flex gap-2 flex-wrap">
            <UButton @click="fetchUsers" :loading="loading.users">
              Fetch All Users
            </UButton>
            <UButton @click="fetchCurrentUser" :loading="loading.currentUser" color="neutral">
              Fetch Current User
            </UButton>
          </div>

          <div v-if="users.length > 0" class="bg-muted p-4 rounded-lg">
            <p class="text-xs font-semibold mb-2">All Users ({{ users.length }}):</p>
            <pre class="text-xs overflow-auto max-h-96">{{ JSON.stringify(users, null, 2) }}</pre>
          </div>

          <div v-if="currentUser" class="bg-muted p-4 rounded-lg">
            <p class="text-xs font-semibold mb-2">Current User:</p>
            <pre class="text-xs overflow-auto max-h-96">{{ JSON.stringify(currentUser, null, 2) }}</pre>
          </div>

          <div v-if="error.users" class="bg-red-100 text-red-800 p-4 rounded-lg">
            <strong>Error:</strong> {{ error.users }}
          </div>
        </div>
      </template>

      <template #database>
        <div class="space-y-4 p-4">
          <p class="text-sm text-muted"><strong>Note:</strong> This shows the MSW in-memory database state</p>
          <UButton @click="checkDatabase">Check Database State</UButton>
          
          <div v-if="dbState" class="bg-muted p-4 rounded-lg">
            <pre class="text-xs overflow-auto max-h-96">{{ dbState }}</pre>
          </div>
        </div>
      </template>

      <template #mswTests>
        <div class="space-y-4 p-4">
          <p class="text-sm text-muted mb-4">
            These tests verify MSW is intercepting requests and returning mock data correctly.
          </p>

          <div class="flex gap-2 flex-wrap">
            <UButton @click="runAllTests" :loading="testRunning" color="primary">
              Run All Tests
            </UButton>
            <UButton @click="clearTestResults" color="neutral" variant="outline">
              Clear Results
            </UButton>
          </div>

          <div v-if="testResults.length > 0" class="space-y-2">
            <div 
              v-for="(result, index) in testResults" 
              :key="index"
              :class="[
                'p-3 rounded-lg border',
                result.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              ]"
            >
              <div class="flex items-center justify-between">
                <span :class="result.passed ? 'text-green-800' : 'text-red-800'" class="font-semibold text-sm">
                  {{ result.passed ? '✅' : '❌' }} {{ result.name }}
                </span>
                <span class="text-xs text-muted">{{ result.duration }}ms</span>
              </div>
              <p class="text-xs mt-1" :class="result.passed ? 'text-green-700' : 'text-red-700'">
                {{ result.message }}
              </p>
            </div>
          </div>

          <div v-if="testSummary" class="bg-muted p-4 rounded-lg">
            <p class="font-semibold mb-2">Test Summary:</p>
            <div class="text-sm space-y-1">
              <p>Total: {{ testSummary.total }}</p>
              <p class="text-green-600">Passed: {{ testSummary.passed }}</p>
              <p class="text-red-600">Failed: {{ testSummary.failed }}</p>
              <p class="text-muted">Duration: {{ testSummary.duration }}ms</p>
            </div>
          </div>
        </div>
      </template>
    </UAccordion>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({
  layout: false, // No layout needed for test page
})

const mswActive = ref(false)
const workflows = ref<any[]>([])
const singleWorkflow = ref<any>(null)
const createdWorkflow = ref<any>(null)
const requests = ref<any[]>([])
const createdRequest = ref<any>(null)
const approvedRequest = ref<any>(null)
const users = ref<any[]>([])
const currentUser = ref<any>(null)
const dbState = ref<string>('')
const testRunning = ref(false)
const testResults = ref<any[]>([])
const testSummary = ref<any>(null)

const loading = ref({
  workflows: false,
  singleWorkflow: false,
  createWorkflow: false,
  requests: false,
  createRequest: false,
  approveRequest: false,
  users: false,
  currentUser: false,
})

const error = ref({
  workflows: '',
  singleWorkflow: '',
  requests: '',
  users: '',
})

const accordionItems = [
  {
    label: '📋 Workflows',
    icon: 'i-heroicons-document-text',
    defaultOpen: true,
    slot: 'workflows'
  },
  {
    label: '📝 Requests',
    icon: 'i-heroicons-clipboard-document-list',
    slot: 'requests'
  },
  {
    label: '👥 Users',
    icon: 'i-heroicons-users',
    slot: 'users'
  },
  {
    label: '💾 Database State',
    icon: 'i-heroicons-circle-stack',
    slot: 'database'
  },
  {
    label: '🧪 MSW Tests',
    icon: 'i-heroicons-beaker',
    slot: 'mswTests'
  }
]

// Check if MSW is active
onMounted(() => {
  // MSW intercepts fetch requests, so we can detect it
  mswActive.value = typeof window !== 'undefined' && 'mockServiceWorker' in navigator
})

async function fetchWorkflows() {
  loading.value.workflows = true
  error.value.workflows = ''
  
  try {
    const { data, error: fetchError } = await useApi<{ success: boolean; data: any[] }>('/workflows')
    
    if (fetchError.value) {
      error.value.workflows = fetchError.value.message || 'Failed to fetch workflows'
    } else if (data.value) {
      workflows.value = data.value.data
    }
  } catch (e: any) {
    error.value.workflows = e.message
  } finally {
    loading.value.workflows = false
  }
}

async function fetchSingleWorkflow() {
  loading.value.singleWorkflow = true
  error.value.singleWorkflow = ''
  
  try {
    const { data, error: fetchError } = await useApi<{ success: boolean; data: any }>('/workflows/workflow-1')
    
    if (fetchError.value) {
      error.value.singleWorkflow = fetchError.value.message || 'Failed to fetch workflow'
    } else if (data.value) {
      singleWorkflow.value = data.value.data
    }
  } catch (e: any) {
    error.value.singleWorkflow = e.message
  } finally {
    loading.value.singleWorkflow = false
  }
}

async function fetchRequests() {
  loading.value.requests = true
  error.value.requests = ''
  
  try {
    const { data, error: fetchError } = await useApi<{ success: boolean; data: any[] }>('/requests')
    
    if (fetchError.value) {
      error.value.requests = fetchError.value.message || 'Failed to fetch requests'
    } else if (data.value) {
      requests.value = data.value.data
    }
  } catch (e: any) {
    error.value.requests = e.message
  } finally {
    loading.value.requests = false
  }
}

async function fetchUsers() {
  loading.value.users = true
  error.value.users = ''
  
  try {
    const { data, error: fetchError } = await useApi<{ success: boolean; data: any[] }>('/users')
    
    if (fetchError.value) {
      error.value.users = fetchError.value.message || 'Failed to fetch users'
    } else if (data.value) {
      users.value = data.value.data
    }
  } catch (e: any) {
    error.value.users = e.message
  } finally {
    loading.value.users = false
  }
}

async function createWorkflow() {
  loading.value.createWorkflow = true
  error.value.workflows = ''
  createdWorkflow.value = null
  
  try {
    const { data, error: fetchError } = await useApi<{ success: boolean; data: any }>('/workflows', {
      method: 'POST',
      body: {
        name: 'Test Workflow',
        description: 'Created via test page',
        fields: [
          { label: 'Test Field', type: 'string', description: 'A test field', required: true, order: 0 }
        ],
        approval_ids: ['user-1', 'user-3'],
        action_actor_id: 'user-2'
      }
    })
    
    if (fetchError.value) {
      error.value.workflows = fetchError.value.message || 'Failed to create workflow'
    } else if (data.value) {
      createdWorkflow.value = data.value.data
    }
  } catch (e: any) {
    error.value.workflows = e.message
  } finally {
    loading.value.createWorkflow = false
  }
}

async function createRequest() {
  loading.value.createRequest = true
  error.value.requests = ''
  createdRequest.value = null
  
  try {
    const { data, error: fetchError } = await useApi<{ success: boolean; data: any }>('/requests', {
      method: 'POST',
      body: {
        workflow_id: 'workflow-1',
        field_values: {
          'field-1-1': 'Test Merchant',
          'field-1-2': '1000',
          'field-1-3': '900',
          'field-1-4': 'Testing request creation'
        }
      }
    })
    
    if (fetchError.value) {
      error.value.requests = fetchError.value.message || 'Failed to create request'
    } else if (data.value) {
      createdRequest.value = data.value.data
    }
  } catch (e: any) {
    error.value.requests = e.message
  } finally {
    loading.value.createRequest = false
  }
}

async function approveRequest() {
  loading.value.approveRequest = true
  error.value.requests = ''
  approvedRequest.value = null
  
  try {
    const { data, error: fetchError } = await useApi<{ success: boolean; data: any }>('/requests/request-1/approve', {
      method: 'POST',
      body: {
        approval_id: 'req-approval-1-1',
        comment: 'Approved via test page'
      }
    })
    
    if (fetchError.value) {
      error.value.requests = fetchError.value.message || 'Failed to approve request'
    } else if (data.value) {
      approvedRequest.value = data.value.data
    }
  } catch (e: any) {
    error.value.requests = e.message
  } finally {
    loading.value.approveRequest = false
  }
}

async function fetchCurrentUser() {
  loading.value.currentUser = true
  error.value.users = ''
  
  try {
    const { data, error: fetchError } = await useApi<{ success: boolean; data: any }>('/users/me')
    
    if (fetchError.value) {
      error.value.users = fetchError.value.message || 'Failed to fetch current user'
    } else if (data.value) {
      currentUser.value = data.value.data
    }
  } catch (e: any) {
    error.value.users = e.message
  } finally {
    loading.value.currentUser = false
  }
}

function checkDatabase() {
  // This is a client-side check - we can import the db in the browser
  if (process.client) {
    import('~/mocks/db').then(({ db }) => {
      const dbUsers = db.user.getAll()
      const workflows = db.workflow.getAll()
      const fields = db.workflowField.getAll()
      const approvals = db.workflowApproval.getAll()
      const actions = db.workflowAction.getAll()
      const requests = db.request.getAll()
      const logs = db.requestLog.getAll()
      
      dbState.value = JSON.stringify({
        users: dbUsers.length,
        workflows: workflows.length,
        fields: fields.length,
        approvals: approvals.length,
        actions: actions.length,
        requests: requests.length,
        logs: logs.length,
        userSample: dbUsers.slice(0, 2),
        workflowSample: workflows.slice(0, 1),
        requestSample: requests.slice(0, 1),
      }, null, 2)
    })
  }
}

async function runAllTests() {
  testRunning.value = true
  testResults.value = []
  testSummary.value = null
  
  const startTime = Date.now()
  const tests = [
    { name: 'MSW is active', fn: testMSWActive },
    { name: 'Fetch workflows returns data', fn: testFetchWorkflows },
    { name: 'Workflows have nested user objects', fn: testWorkflowNestedObjects },
    { name: 'Fetch requests returns data', fn: testFetchRequests },
    { name: 'Requests have nested workflow', fn: testRequestNestedWorkflow },
    { name: 'Fetch users returns data', fn: testFetchUsers },
    { name: 'Users have correct structure', fn: testUserStructure },
    { name: 'Database has seed data', fn: testDatabaseSeedData },
  ]
  
  for (const test of tests) {
    const testStart = Date.now()
    try {
      await test.fn()
      testResults.value.push({
        name: test.name,
        passed: true,
        message: 'Test passed',
        duration: Date.now() - testStart
      })
    } catch (error: any) {
      testResults.value.push({
        name: test.name,
        passed: false,
        message: error.message,
        duration: Date.now() - testStart
      })
    }
  }
  
  const totalDuration = Date.now() - startTime
  const passed = testResults.value.filter(r => r.passed).length
  const failed = testResults.value.filter(r => !r.passed).length
  
  testSummary.value = {
    total: tests.length,
    passed,
    failed,
    duration: totalDuration
  }
  
  testRunning.value = false
}

function clearTestResults() {
  testResults.value = []
  testSummary.value = null
}

// Test functions
async function testMSWActive() {
  if (!mswActive.value) {
    throw new Error('MSW is not active')
  }
}

async function testFetchWorkflows() {
  const { data } = await useApi<{ success: boolean; data: any[] }>('/workflows')
  if (!data.value || !data.value.data || data.value.data.length === 0) {
    throw new Error('No workflows returned')
  }
}

async function testWorkflowNestedObjects() {
  const { data } = await useApi<{ success: boolean; data: any[] }>('/workflows')
  const workflow = data.value?.data[0]
  if (!workflow.created_by || !workflow.created_by.first_name) {
    throw new Error('Workflow missing nested creator object')
  }
  if (!workflow.steps || workflow.steps.length === 0) {
    throw new Error('Workflow missing steps')
  }
  if (!workflow.fields || workflow.fields.length === 0) {
    throw new Error('Workflow missing fields')
  }
}

async function testFetchRequests() {
  const { data } = await useApi<{ success: boolean; data: any[] }>('/requests')
  if (!data.value || !data.value.data || data.value.data.length === 0) {
    throw new Error('No requests returned')
  }
}

async function testRequestNestedWorkflow() {
  const { data } = await useApi<{ success: boolean; data: any[] }>('/requests')
  const request = data.value?.data[0]
  if (!request.workflow || !request.workflow.name) {
    throw new Error('Request missing nested workflow object')
  }
  if (!request.initiator || !request.initiator.email) {
    throw new Error('Request missing nested initiator object')
  }
}

async function testFetchUsers() {
  const { data } = await useApi<{ success: boolean; data: any[] }>('/users')
  if (!data.value || !data.value.data || data.value.data.length === 0) {
    throw new Error('No users returned')
  }
}

async function testUserStructure() {
  const { data } = await useApi<{ success: boolean; data: any[] }>('/users')
  const user = data.value?.data[0]
  if (!user.first_name || !user.last_name || !user.email || !user.role) {
    throw new Error('User missing required fields')
  }
}

async function testDatabaseSeedData() {
  if (process.client) {
    const { db } = await import('~/mocks/db')
    const users = db.user.getAll()
    const workflows = db.workflow.getAll()
    const requests = db.request.getAll()
    
    if (users.length < 4) throw new Error(`Expected 4 users, got ${users.length}`)
    if (workflows.length < 1) throw new Error(`Expected 1 workflow, got ${workflows.length}`)
    if (requests.length < 2) throw new Error(`Expected 2 requests, got ${requests.length}`)
  }
}
</script>
