<template>
  <div class="quill-editor-wrapper">
    <div ref="quillEditorRef" :class="editorClass"></div>
    <div v-if="error" class="text-red-500 text-sm mt-1">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, onBeforeUnmount } from 'vue'
import { normalizeQuillHtml } from '~/utils/htmlUtils'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Enter description...'
  },
  editorClass: {
    type: String,
    default: 'w-full bg-gray-100 rounded-2xl border-gray-300 focus:border-purple-500'
  },
  error: {
    type: String,
    default: ''
  },
  minHeight: {
    type: String,
    default: '120px'
  },
  // Option to send HTML or plain text to server
  sendHtml: {
    type: Boolean,
    default: false // Default to plain text for server
  },
  // Maximum character limit
  maxLength: {
    type: Number,
    default: null
  }
})

const emit = defineEmits(['update:modelValue'])

const quillEditorRef = ref(null)
let quillInstance = null
let Quill = null

// Utility function to strip HTML tags completely
const stripHtmlTags = (html) => {
  if (!html) return ''
  // Create a temporary div to parse HTML
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = html
  return tempDiv.textContent || tempDiv.innerText || ''
}

// Function to clean and validate text content
const cleanTextContent = (text) => {
  if (!text) return ''
  // Remove extra whitespace and normalize line breaks
  // Quill always adds a trailing newline, so we need to handle this
  return text
    .replace(/\r\n/g, '\n') // Normalize line breaks
    .replace(/\r/g, '\n') // Convert \r to \n
    .replace(/\n{3,}/g, '\n\n') // Max 2 consecutive line breaks
    .replace(/\n$/, '') // Remove trailing newline that Quill adds
    .trim()
}

// Function to load CSS dynamically
const loadQuillCSS = () => {
  if (process.client) {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.snow.css'
    document.head.appendChild(link)
  }
}

onMounted(async () => {
  await nextTick()
  if (process.client && quillEditorRef.value) {
    try {
      // Load CSS first
      loadQuillCSS()
      
      // Dynamic import of Quill for client-side only
      const QuillModule = await import('quill')
      Quill = QuillModule.default
      
      // Quill configuration optimized for Vue 3
      const options = {
        theme: 'snow',
        placeholder: props.placeholder,
        modules: {
          toolbar: [
            ['bold', 'italic', 'underline'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['link'],
            ['clean']
          ]
        },
        formats: ['bold', 'italic', 'underline', 'list', 'link']
      }

      quillInstance = new Quill(quillEditorRef.value, options)
      
      // Set initial content properly - handle both HTML and plain text
      if (props.modelValue) {
        if (props.sendHtml) {
          // If sendHtml is true, normalize and set content as HTML (preserving formatting)
          const normalizedContent = normalizeQuillHtml(props.modelValue)
          
          if (normalizedContent.includes('<') && normalizedContent.includes('>')) {
            // Content appears to be HTML, set it directly
            quillInstance.root.innerHTML = normalizedContent
          } else {
            // Content is plain text, set as text
            quillInstance.setText(normalizedContent)
          }
        } else {
          // If sendHtml is false, always treat as plain text
          const cleanText = stripHtmlTags(props.modelValue) || props.modelValue
          quillInstance.setText(cleanText)
        }
      }

      // Style the editor
      quillInstance.root.style.minHeight = props.minHeight
      quillInstance.root.style.padding = '12px'
      quillInstance.root.style.fontSize = '14px'
      quillInstance.root.style.lineHeight = '1.5'
      quillInstance.root.style.fontFamily = 'inherit'

      // Listen for text changes with debouncing
      let changeTimeout = null
      quillInstance.on('text-change', (delta, oldDelta, source) => {
        if (source === 'user') {
          // Clear previous timeout
          if (changeTimeout) {
            clearTimeout(changeTimeout)
          }
          
          // Debounce the updates to reduce excessive API calls
          changeTimeout = setTimeout(() => {
            // Get content based on sendHtml prop
            let content
            
            if (props.sendHtml) {
              // Send HTML for rich display with normalized structure
              const html = quillInstance.root.innerHTML
              if (html === '<p><br></p>' || html === '<p></p>' || html.trim() === '') {
                content = ''
              } else {
                // Normalize Quill HTML for consistent display across the app
                content = normalizeQuillHtml(html)
              }
            } else {
              // Send plain text without HTML tags - BEST for server
              const plainText = quillInstance.getText()
              content = cleanTextContent(plainText)
              
              // Double-check: strip any remaining HTML if it somehow got through
              content = stripHtmlTags(content) || content
            }
            
            // Apply character limit if specified
            if (props.maxLength && content.length > props.maxLength) {
              content = content.substring(0, props.maxLength)
              // Show warning to user

            }
            
            // Emit clean content to server
            emit('update:modelValue', content)
          }, 300) // 300ms debounce for server responsiveness
        }
      })

      // Handle focus and blur for styling
      quillInstance.on('selection-change', (range) => {
        const container = quillEditorRef.value?.querySelector('.ql-container')
        if (container) {
          if (range) {
            // Editor is focused
            container.style.borderColor = '#a855f7'
            container.style.boxShadow = '0 0 0 1px #a855f7'
          } else {
            // Editor lost focus
            container.style.borderColor = props.error ? '#ef4444' : '#d1d5db'
            container.style.boxShadow = 'none'
          }
        }
      })
    } catch (error) {
      console.error('Failed to load Quill editor:', error)
    }
  }
})

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue, oldValue) => {
  if (quillInstance && newValue !== oldValue) {
    // Handle content based on sendHtml prop
    if (props.sendHtml) {
      // When receiving HTML content from server, normalize it first then display
      if (newValue && typeof newValue === 'string') {
        // First normalize the content in case it came from server with Quill markup
        const normalizedContent = normalizeQuillHtml(newValue)
        
        if (normalizedContent.includes('<') && normalizedContent.includes('>')) {
          // Content appears to be HTML
          const currentHtml = quillInstance.root.innerHTML
          const currentNormalized = normalizeQuillHtml(currentHtml)
          
          if (currentNormalized !== normalizedContent) {
            // Preserve cursor position when possible
            const selection = quillInstance.getSelection()
            quillInstance.root.innerHTML = normalizedContent
            if (selection) {
              quillInstance.setSelection(selection)
            }
          }
        } else {
          // Content is plain text
          const currentText = quillInstance.getText().trim()
          const newText = normalizedContent || ''
          
          if (currentText !== newText.trim()) {
            const selection = quillInstance.getSelection()
            quillInstance.setText(newText)
            if (selection) {
              quillInstance.setSelection(selection)
            }
          }
        }
      }
    } else {
      // When receiving data from server, assume it's plain text
      // Strip any HTML tags that might be in the data
      const cleanText = stripHtmlTags(newValue) || newValue || ''
      const currentText = quillInstance.getText().trim()
      
      if (currentText !== cleanText.trim()) {
        // Preserve cursor position when possible
        const selection = quillInstance.getSelection()
        
        // Clear editor and set plain text
        quillInstance.setText(cleanText)
        if (selection) {
          quillInstance.setSelection(selection)
        }
      }
    }
  }
})

// Watch for error changes to update styling
watch(() => props.error, (newError) => {
  if (quillInstance) {
    const container = quillEditorRef.value?.querySelector('.ql-container')
    const toolbar = quillEditorRef.value?.querySelector('.ql-toolbar')
    
    if (container && toolbar) {
      if (newError) {
        container.style.borderColor = '#ef4444'
        container.style.borderWidth = '2px'
        toolbar.style.borderColor = '#ef4444'
        toolbar.style.borderWidth = '2px'
      } else {
        container.style.borderColor = '#d1d5db'
        container.style.borderWidth = '1px'
        toolbar.style.borderColor = '#d1d5db'
        toolbar.style.borderWidth = '1px'
      }
    }
  }
})

// Cleanup on unmount
onBeforeUnmount(() => {
  if (quillInstance) {
    quillInstance = null
  }
})
</script>

<style scoped>
.quill-editor-wrapper :deep(.ql-editor) {
  font-family: inherit;
  white-space: pre-wrap; /* Preserve spaces and line breaks */
}

.quill-editor-wrapper :deep(.ql-container) {
  border-radius: 1rem;
  border: 1px solid #d1d5db;
  transition: all 0.2s ease;
}

.quill-editor-wrapper :deep(.ql-toolbar) {
  border-radius: 1rem 1rem 0 0;
  border: 1px solid #d1d5db;
  border-bottom: none;
  background-color: #f9fafb;
  transition: all 0.2s ease;
}

.quill-editor-wrapper :deep(.ql-container.ql-snow) {
  border-radius: 0 0 1rem 1rem;
}

.quill-editor-wrapper :deep(.ql-editor.ql-blank::before) {
  color: #9ca3af;
  font-style: normal;
}

.quill-editor-wrapper :deep(.ql-editor p) {
  margin: 0 0 0.5em 0;
}

.quill-editor-wrapper :deep(.ql-editor p:last-child) {
  margin-bottom: 0;
}

/* Better spacing for lists with enhanced classes */
.quill-editor-wrapper :deep(.ql-editor ul, .ql-editor ol) {
  margin: 0.5em 0;
  padding-left: 1.5em;
}

.quill-editor-wrapper :deep(.ql-editor li) {
  margin: 0.25em 0;
}

/* Enhanced styling for Quill formatting classes */
.quill-editor-wrapper :deep(.ql-bold) {
  font-weight: bold;
}

.quill-editor-wrapper :deep(.ql-italic) {
  font-style: italic;
}

.quill-editor-wrapper :deep(.ql-underline) {
  text-decoration: underline;
}

.quill-editor-wrapper :deep(.ql-bullet-list) {
  list-style-type: disc;
  margin: 0.5em 0;
  padding-left: 1.5em;
}

.quill-editor-wrapper :deep(.ql-ordered-list) {
  list-style-type: decimal;
  margin: 0.5em 0;
  padding-left: 1.5em;
}

.quill-editor-wrapper :deep(.ql-bullet) {
  display: list-item;
  list-style-type: disc;
  margin: 0.25em 0;
}

.quill-editor-wrapper :deep(.ql-ordered) {
  display: list-item;
  list-style-type: decimal;
  margin: 0.25em 0;
}

/* Link styling with enhanced classes */
.quill-editor-wrapper :deep(.ql-editor a),
.quill-editor-wrapper :deep(.ql-link) {
  color: #a855f7;
  text-decoration: underline;
}

.quill-editor-wrapper :deep(.ql-editor a:hover),
.quill-editor-wrapper :deep(.ql-link:hover) {
  color: #9333ea;
}
</style>
