<script setup lang="ts">
import { onMounted } from 'vue'
import { api } from './services/api'

onMounted(async () => {
  try {
    const res = await api.get<{ data?: { meta_title?: string; site_name?: string; meta_description?: string } }>('/api/site-config')
    const config = res.data?.data
    if (config?.meta_title || config?.site_name) {
      document.title = config.meta_title || config.site_name
    }
    if (config?.meta_description) {
      let metaDesc = document.querySelector('meta[name="description"]')
      if (!metaDesc) {
        metaDesc = document.createElement('meta')
        metaDesc.setAttribute('name', 'description')
        document.head.appendChild(metaDesc)
      }
      metaDesc.setAttribute('content', config.meta_description)
    }
  } catch {
    // Keep default static title if API is loading
  }
})
</script>

<template>
  <router-view />
</template>
