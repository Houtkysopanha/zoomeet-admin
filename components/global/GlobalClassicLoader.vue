<template>
  <ClassicLoader 
    :visible="classicLoader.isVisible.value"
    :progress="classicLoader.progress.value"
    :text="classicLoader.text.value"
    :statusText="classicLoader.statusText.value"
    :steps="classicLoader.steps.value"
    :currentStep="classicLoader.currentStep.value"
    size="lg"
    :showLogo="true"
    :showDots="true"
    :showSteps="classicLoader.steps.value.length > 0"
  />
</template>

<script setup>
import ClassicLoader from '~/components/ui/ClassicLoader.vue'
import { classicLoader } from '~/composables/useClassicLoader.js'
</script>
