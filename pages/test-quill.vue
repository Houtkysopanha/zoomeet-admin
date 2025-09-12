<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold mb-6">Quill Editor Test - HTML Tags to Server</h1>
    
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Quill Editor -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-lg font-semibold mb-4">Quill Editor (sendHtml=true)</h2>
        <ClientOnly>
          <QuillEditor
            v-model="content"
            :sendHtml="true"
            placeholder="Type here and use toolbar formatting..."
            min-height="200px"
          />
          <template #fallback>
            <div class="bg-gray-100 p-4 rounded">Loading Quill Editor...</div>
          </template>
        </ClientOnly>
      </div>
      
      <!-- Raw Output Display -->
      <div class="bg-gray-50 p-6 rounded-lg">
        <h2 class="text-lg font-semibold mb-4">Raw Content Sent to Server</h2>
        <div class="bg-white p-4 rounded border">
          <pre class="whitespace-pre-wrap text-sm font-mono">{{ content || 'Type in the editor to see output...' }}</pre>
        </div>
        
        <h3 class="text-md font-semibold mt-6 mb-2">Rendered HTML Preview</h3>
        <div class="bg-white p-4 rounded border quill-content prose prose-sm max-w-none" v-html="content"></div>
        
        <h3 class="text-md font-semibold mt-6 mb-2">HTML Classes Check</h3>
        <div class="bg-gray-100 p-3 rounded text-xs">
          <div v-if="content.includes('class=')">
            ✅ Classes detected: {{ extractClasses(content).join(', ') }}
          </div>
          <div v-else class="text-orange-600">
            ⚠️ No classes found - check if formatting is applied
          </div>
        </div>
      </div>
    </div>
    
    <!-- Instructions -->
    <div class="mt-8 bg-blue-50 p-6 rounded-lg">
      <h3 class="text-lg font-semibold text-blue-800 mb-3">Test Instructions:</h3>
      <ul class="text-blue-700 space-y-2">
        <li>✅ <strong>Bold text</strong> - should show <code>&lt;strong class="font-bold"&gt;text&lt;/strong&gt;</code></li>
        <li>✅ <em>Italic text</em> - should show <code>&lt;em class="italic"&gt;text&lt;/em&gt;</code></li>
        <li>✅ <u>Underlined text</u> - should show <code>&lt;u class="underline"&gt;text&lt;/u&gt;</code></li>
        <li>✅ Bullet lists - should show <code>&lt;ul class="list-disc pl-6 space-y-1"&gt;&lt;li&gt;item&lt;/li&gt;&lt;/ul&gt;</code></li>
        <li>✅ Numbered lists - should show <code>&lt;ol class="list-decimal pl-6 space-y-1"&gt;&lt;li&gt;item&lt;/li&gt;&lt;/ol&gt;</code></li>
        <li>✅ Links - should show <code>&lt;a class="text-purple-600 underline hover:text-purple-800" href="url"&gt;text&lt;/a&gt;</code></li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import QuillEditor from '~/components/common/QuillEditor.vue'

const content = ref('')

// Extract classes from HTML content for debugging
const extractClasses = (html) => {
  const classMatches = html.match(/class="([^"]*)"/g) || []
  return classMatches.map(match => match.replace(/class="([^"]*)"/, '$1'))
}

// Watch content changes to see what's being sent
watch(() => content.value, (newValue) => {
})

definePageMeta({
  layout: "admin",
})
</script>

<style scoped>
pre {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 12px;
  font-size: 12px;
  line-height: 1.4;
  max-height: 300px;
  overflow-y: auto;
}
</style>
