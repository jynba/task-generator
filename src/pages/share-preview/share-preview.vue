<template>
  <view class="share-preview-page">
    <canvas canvas-id="shareCanvas"
      style="position: fixed; top: -9999rpx; left: -9999rpx; width: 750rpx; height: 800rpx;"></canvas>
    <view class="container">
      <view v-if="shareImagePath" class="preview-container">
        <image :src="shareImagePath" mode="widthFix" class="preview-image" @load="onImageLoad" @error="onImageError"
          @click="previewImage" />
      </view>
      <view v-else class="generating-status">
        <view class="loading-spinner"></view>
        <text class="status-text">正在生成分享图片...</text>
      </view>
      <button class="save-btn" @click="saveToAlbum" :disabled="!shareImagePath">
        <text class="btn-emoji">💾</text>
        <text class="btn-text">保存到相册</text>
      </button>
      <text class="preview-tip">长按图片可保存到相册，或点击下方按钮保存</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { shareManager } from '@/utils/shareImage'

const shareImagePath = ref('')
const taskRecord = ref(null)
const stats = ref(null)

onLoad((query) => {
  console.log('onLoad query:', query)
  if (query.taskRecord && query.stats) {
    try {
      taskRecord.value = JSON.parse(decodeURIComponent(query.taskRecord))
      stats.value = JSON.parse(decodeURIComponent(query.stats))
      console.log('taskRecord:', taskRecord.value)
      console.log('stats:', stats.value)
    } catch (e) {
      uni.showToast({ title: '参数解析失败', icon: 'none' })
      console.error('参数解析失败', e)
    }
  }
})

onMounted(async () => {
  if (taskRecord.value && stats.value) {
    uni.showLoading({ title: '生成分享图片...' })
    try {
      const imagePath = await shareManager.imageGenerator.generateShareImage(taskRecord.value, stats.value, 375, 750)
      console.log('生成的图片路径:', imagePath)
      shareImagePath.value = imagePath
      uni.hideLoading()
    } catch (error) {
      uni.hideLoading()
      uni.showToast({ title: '生成失败', icon: 'none' })
      console.error('生成分享图片失败:', error)
    }
  } else {
    console.warn('taskRecord 或 stats 不存在')
  }
})

const saveToAlbum = async () => {
  if (!shareImagePath.value) {
    uni.showToast({ title: '请先生成分享图片', icon: 'none' })
    return
  }
  try {
    await shareManager.saveToAlbum(shareImagePath.value)
  } catch (error) {
    uni.showToast({ title: '保存失败', icon: 'none' })
    console.error('保存到相册失败:', error)
  }
}

const onImageLoad = () => { console.log('图片加载成功', shareImagePath.value) }
const onImageError = (error) => {
  uni.showToast({ title: '图片加载失败', icon: 'none' })
  console.error('图片加载失败:', error, shareImagePath.value)
}

// 图片点击预览放大
const previewImage = () => {
  if (!shareImagePath.value) return
  uni.previewImage({
    current: shareImagePath.value,
    urls: [shareImagePath.value]
  })
}
</script>

<style lang="scss" scoped>
.share-preview-page {
  height: 100%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  justify-content: center;
}

.preview-container {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 24rpx;
  padding: 40rpx;
  margin-bottom: 30rpx;
  width: 100%;
  max-width: 750rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.preview-image {
  width: 100%;
  max-width: 750rpx;
  height: auto;
  border-radius: 16rpx;
  margin-bottom: 30rpx;
  display: block;
}

.generating-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx;
  margin-bottom: 60rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 24rpx;
}

.loading-spinner {
  width: 80rpx;
  height: 80rpx;
  border: 8rpx solid rgba(255, 255, 255, 0.3);
  border-top: 8rpx solid #4facfe;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 30rpx;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.status-text {
  font-size: 32rpx;
  color: white;
}

.save-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(79, 172, 254, 0.3);
  border: 4rpx solid #4facfe;
  border-radius: 24rpx;
  font-size: 32rpx;
  font-weight: bold;
  color: white;
  margin: 40rpx 0;
  transition: all 0.3s ease;
}

.save-btn:active:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
}

.btn-emoji {
  font-size: 36rpx;
  margin-right: 16rpx;
}

.preview-tip {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
}
</style>