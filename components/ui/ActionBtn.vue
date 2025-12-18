<script setup lang="ts">
interface Props {
  label: string;
  icon?: string;
  to: string;
}

defineProps<Props>();
</script>

<template>
  <NuxtLink
    :to="to"
    class="inline-flex items-center gap-2 px-4 py-2 border border-current text-sm font-mono uppercase transition-all duration-300 hover:bg-white hover:text-black hover:border-white group"
  >
    <span>{{ label }}</span>
    <Icon
      v-if="icon"
      :name="icon"
      size="16"
      class="group-hover:rotate-45 transition-transform duration-300"
    />
  </NuxtLink>
</template>
