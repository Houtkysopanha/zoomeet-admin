<template>
  <div class="qr-code-container">
    <canvas
      ref="qrCanvas"
      :width="size"
      :height="size"
      class="rounded-lg"
      :class="containerClass"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import QRCode from 'qrcode'

const props = defineProps({
  value: {
    type: String,
    required: true,
    default: ''
  },
  size: {
    type: Number,
    default: 200
  },
  containerClass: {
    type: String,
    default: ''
  },
  options: {
    type: Object,
    default: () => ({
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
  }
})

const qrCanvas = ref(null)

const generateQRCode = async () => {
  if (!props.value || !qrCanvas.value) {
    console.warn('QR Code: Missing value or canvas element')
    return
  }

  try {
    await QRCode.toCanvas(qrCanvas.value, props.value, {
      width: props.size,
      height: props.size,
      ...props.options
    })
  } catch (error) {
    console.error('Error generating QR code:', error)
    
    // Fallback: draw a placeholder on canvas
    const ctx = qrCanvas.value.getContext('2d')
    ctx.fillStyle = '#f3f4f6'
    ctx.fillRect(0, 0, props.size, props.size)
    
    ctx.fillStyle = '#6b7280'
    ctx.font = '12px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('QR Error', props.size / 2, props.size / 2)
  }
}

// Generate QR code on mount and when value changes
onMounted(() => {
  generateQRCode()
})

watch(() => props.value, () => {
  generateQRCode()
}, { immediate: false })

watch(() => props.size, () => {
  generateQRCode()
})
</script>

<style scoped>
.qr-code-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

canvas {
  display: block;
}
</style>
