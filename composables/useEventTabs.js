import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useEventTabsStore = defineStore('eventTabs', () => {
  const activeTab = ref(0)
  const completedTabs = ref(new Set())
  const isTabChanging = ref(false)

  function markTabComplete(tabIndex) {
    completedTabs.value.add(tabIndex)
  }

  function isTabCompleted(tabIndex) {
    return completedTabs.value.has(tabIndex)
  }

  function setActiveTab(index) {
    activeTab.value = index
  }

  function resetTabs() {
    activeTab.value = 0
    completedTabs.value = new Set()
  }

  return {
    activeTab,
    isTabChanging,
    setActiveTab,
    markTabComplete,
    isTabCompleted,
    resetTabs,
  }
})
