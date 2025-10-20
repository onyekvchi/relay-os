<template>
  <UModal 
    v-model:open="isOpen" 
    :title="title" 
    :description="description"
    :ui="{ footer: 'justify-end' }"
  >
    <template #body>
      <UFormField 
        v-if="requireComment"
        label="Comment" 
        :name="commentLabel || 'comment'"
        :required="commentRequired"
      >
        <UTextarea
          v-model="comment"
          :placeholder="commentPlaceholder || 'Add a comment...'"
          :rows="3"
          class="w-full"
        />
      </UFormField>
    </template>

    <template #footer>
      <UButton 
        label="Cancel" 
        color="neutral" 
        variant="outline" 
        @click="handleCancel"
      />
      <UButton 
        :label="confirmLabel" 
        :color="confirmColor"
        :loading="loading"
        @click="handleConfirm"
      />
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  open?: boolean
  title: string
  description?: string
  confirmLabel?: string
  confirmColor?: 'primary' | 'error' | 'warning' | 'success' | 'neutral'
  requireComment?: boolean
  commentRequired?: boolean
  commentLabel?: string
  commentPlaceholder?: string
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
  confirmLabel: 'Confirm',
  confirmColor: 'primary',
  requireComment: false,
  commentRequired: false,
  loading: false
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  'confirm': [comment?: string]
  'cancel': []
}>()

const isOpen = ref(props.open)
const comment = ref('')

watch(() => props.open, (value) => {
  isOpen.value = value
  if (value) {
    comment.value = '' // Reset comment when modal opens
  }
})

watch(isOpen, (value) => {
  emit('update:open', value)
})

function handleCancel() {
  isOpen.value = false
  emit('cancel')
}

function handleConfirm() {
  emit('confirm', comment.value || undefined)
}
</script>
