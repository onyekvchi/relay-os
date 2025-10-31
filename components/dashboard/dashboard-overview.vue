<template>
  <div class="space-y-8">
    <!-- Quick Requests Grid -->
    <div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <button v-for="workflow in popularWorkflows" :key="workflow.id" @click="createRequest(workflow.id)"
          class="bg-muted border border-muted p-4 rounded-lg hover:border- hover:shadow-sm transition-all text-left group cursor-pointer">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <h4 class="font-semibold text-base mb-1 group-hover:text-primary transition-colors">
                {{ workflow.name }}
              </h4>
              <p class="text-sm text-muted">
                {{ workflow.fields.length }} field{{ workflow.fields.length !== 1 ? 's' : '' }} ·
                {{ workflow.steps.length }} step{{ workflow.steps.length !== 1 ? 's' : '' }}
              </p>
            </div>
            <div class="text-muted group-hover:text-primary transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </div>
          </div>
        </button>
      </div>
    </div>

    <!-- Pending Actions -->
    <div>
      <div class="flex items-center gap-2 mb-4">
        <h3 class="font-semibold tracking-tight">
          Pending Actions
        </h3>
        <UBadge v-if="pendingActions && pendingActions.length > 0" color="neutral" variant="soft">
          {{ pendingActions.length }}
        </UBadge>
      </div>

      <div v-if="!pendingActions || pendingActions.length === 0" class="bg-white border border-muted p-8 rounded-lg text-center">
        <p class="text-muted">No pending actions</p>
      </div>

      <div v-else class="bg-white border border-muted rounded-lg divide-y divide-muted">
        <div v-for="action in pendingActions" :key="action.id"
          class="p-4 hover:bg-elevated transition-colors cursor-pointer flex items-center justify-between"
          @click="navigateTo(routes.request(action.id))">
          <div class="flex items-center space-x-3 flex-1">
            <UAvatar :text="action.createdBy.firstName[0] + action.createdBy.lastName[0]" size="md" />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold">
                {{ action.createdBy.firstName }} {{ action.createdBy.lastName }} created a
                <span class="text-muted">{{ action.workflow.name }}</span>
                for your approval
              </p>
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <span class="text-xs text-muted whitespace-nowrap">{{ formatTimeAgo(action.createdAt) }}</span>
            <UButton size="sm" color="primary">Review</UButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div>
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-semibold tracking-tight">Recent Activity</h3>
      </div>

      <div v-if="!recentActivity || recentActivity.length === 0" class="bg-white border border-muted p-8 rounded-lg text-center">
        <p class="text-muted">No recent activity</p>
      </div>

      <div v-else class="bg-white border border-muted rounded-lg divide-y divide-muted">
        <div v-for="activity in recentActivity" :key="activity.id" class="p-4 hover:bg-elevated transition-colors">
          <div class="flex items-center space-x-3">
            <UAvatar :text="activity.user.firstName[0] + activity.user.lastName[0]" size="sm" />
            <div class="flex-1 min-w-0">
              <p class="text-sm leading-relaxed">
                <span class="font-semibold">{{ activity.user.firstName }} {{ activity.user.lastName }}</span>
                <span class="text-muted ml-1">{{ getActionText(activity.action) }}</span>
                <span class="font-semibold ml-1">{{ activity.request.workflow.name }}</span>
                <span class="text-muted ml-1">· {{ formatTimeAgo(activity.createdAt) }}</span>
              </p>
            </div>
          </div>
        </div>

        <button v-if="recentActivity && recentActivity.length >= 8"
          class="w-full p-3 text-sm text-muted hover:text-foreground hover:bg-elevated transition-colors flex items-center justify-center space-x-2"
          @click="showMoreActivity">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m6 9 6 6 6-6" />
          </svg>
          <span>Show 8 more</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RequestAction } from '@/models/request'
import { routes } from '@/routes'

const { getPopularWorkflows, getPendingActions, getRecentActivity } = useDashboardApi()

// Fetch dashboard data from three separate endpoints
const { data: popularWorkflows, pending: workflowsLoading } = await getPopularWorkflows()
const { data: pendingActions, pending: actionsLoading } = await getPendingActions()
const { data: recentActivity, pending: activityLoading } = await getRecentActivity()

function createRequest(workflowId: string) {
  // TODO: Navigate to request creation with pre-selected workflow
  navigateTo(routes.newRequest)
}

function showMoreActivity() {
  // TODO: Load more activity items
  console.log('Load more activity')
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) {
    return `${diffMins}m`
  } else if (diffHours < 24) {
    return `${diffHours}h`
  } else {
    return `${diffDays}d`
  }
}

function getActionText(action: RequestAction): string {
  switch (action) {
    case RequestAction.create:
      return 'created'
    case RequestAction.approve:
      return 'approved'
    case RequestAction.requestChange:
      return 'requested changes to'
    case RequestAction.reject:
      return 'rejected'
    case RequestAction.cancel:
      return 'cancelled'
    case RequestAction.complete:
      return 'completed'
    case RequestAction.comment:
      return 'commented on'
    case RequestAction.update:
      return 'updated'
    default:
      return 'acted on'
  }
}
</script>
