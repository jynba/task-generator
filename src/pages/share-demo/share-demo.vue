<template>
  <view class="share-demo-page">
    <!-- 隐藏的画布用于生成分享图片 -->
    <canvas canvas-id="shareCanvas"
      style="position: fixed; top: -9999px; left: -9999px; width: 750px; height: 1000px;"></canvas>

    <view class="container glass rounded">
      <text class="title">分享功能演示</text>

      <!-- 模拟任务记录 -->
      <view class="demo-task">
        <text class="section-title">模拟任务记录</text>
        <view class="task-card">
          <view class="task-header">
            <text class="task-emoji">✨</text>
            <text class="task-type">极简自律</text>
          </view>
          <text class="task-content">去洗个脸，不许看镜子超过10秒</text>
          <text class="task-feedback">你正逐渐脱离现代社会的高速列车</text>
        </view>
      </view>

      <!-- 模拟统计数据 -->
      <view class="demo-stats">
        <text class="section-title">模拟统计数据</text>
        <view class="stats-grid">
          <view class="stat-item">
            <text class="stat-number">15</text>
            <text class="stat-label">总任务数</text>
          </view>
          <view class="stat-item">
            <text class="stat-number">12</text>
            <text class="stat-label">已完成</text>
          </view>
          <view class="stat-item">
            <text class="stat-number">80%</text>
            <text class="stat-label">完成率</text>
          </view>
        </view>
      </view>

      <!-- 分享按钮 -->
      <view class="share-buttons">
        <button class="share-btn primary" @click="generateShareImage">
          <text class="btn-emoji">🎨</text>
          <text class="btn-text">生成分享图片</text>
        </button>

        <button class="share-btn" @click="saveToAlbum" :disabled="!shareImagePath">
          <text class="btn-emoji">💾</text>
          <text class="btn-text">保存到相册</text>
        </button>
      </view>

      <!-- 生成状态 -->
      <view v-if="isGenerating" class="generating-status">
        <view class="loading-spinner"></view>
        <text class="status-text">正在生成分享图片...</text>
      </view>

      <!-- 分享预览 -->
      <view v-if="shareImagePath" class="share-preview" ref="previewRef">
        <text class="section-title">分享图片预览</text>
        <view class="preview-container">
          <image :src="shareImagePath" mode="widthFix" class="preview-image" @load="onImageLoad" @error="onImageError"
            @click="previewImage" />
        </view>
        <text class="preview-tip">长按图片可保存到相册，或点击下方按钮保存</text>
      </view>

      <!-- 功能说明 -->
      <view class="feature-info">
        <text class="section-title">功能说明</text>
        <view class="info-list">
          <view class="info-item">
            <text class="info-emoji">🎨</text>
            <text class="info-text">自动生成精美的分享图片</text>
          </view>
          <view class="info-item">
            <text class="info-emoji">🚀</text>
            <text class="info-text">高级生成器使用离屏画布，性能更好</text>
          </view>
          <view class="info-item">
            <text class="info-emoji">💾</text>
            <text class="info-text">可保存图片到手机相册</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { shareManager } from '@/utils/shareImage'

// 响应式数据
const shareImagePath = ref('')
const isGenerating = ref(false)
const previewRef = ref(null)

// 模拟任务记录
const mockTaskRecord = {
  id: Date.now(),
  taskId: 1,
  task: {
    id: 1,
    type: '✨ 极简自律',
    content: '去洗个脸，不许看镜子超过10秒',
    emoji: '✨',
    category: 'self-discipline'
  },
  feedback: '你正逐渐脱离现代社会的高速列车',
  status: 'completed',
  timestamp: new Date().toISOString(),
  date: new Date().toLocaleDateString()
}

// 模拟统计数据
const mockStats = {
  totalTasks: 15,
  completedTasks: 12,
  skippedTasks: 3,
  completionRate: 80,
  streakDays: 5,
  lastCompletedDate: new Date().toLocaleDateString()
}

// 生成分享图片
const generateShareImage = async () => {
  try {
    isGenerating.value = true
    uni.showLoading({
      title: '生成分享图片...'
    })

    // 只使用高级生成器
    const imagePath = await shareManager.imageGenerator.generateShareImage(mockTaskRecord, mockStats, 375, 750)
    shareImagePath.value = imagePath

    uni.hideLoading()
    isGenerating.value = false

    uni.showToast({
      title: '图片生成成功',
      icon: 'success',
      duration: 2000
    })

    // 自动滚动到预览区域
    await nextTick()
    if (previewRef.value && previewRef.value.$el) {
      previewRef.value.$el.scrollIntoView({ behavior: 'smooth' })
    } else {
      // 兼容H5/小程序
      uni.pageScrollTo({
        selector: '.share-preview',
        duration: 300
      })
    }
  } catch (error) {
    uni.hideLoading()
    isGenerating.value = false

    uni.showToast({
      title: '生成失败',
      icon: 'none',
      duration: 2000
    })
    console.error('生成分享图片失败:', error)
  }
}

// 保存到相册
const saveToAlbum = async () => {
  if (!shareImagePath.value) {
    uni.showToast({
      title: '请先生成分享图片',
      icon: 'none',
      duration: 2000
    })
    return
  }

  try {
    await shareManager.saveToAlbum(shareImagePath.value)
  } catch (error) {
    console.error('保存到相册失败:', error)
  }
}

// 图片加载成功
const onImageLoad = () => {
  console.log('分享图片加载成功')
}

// 图片加载失败
const onImageError = (error) => {
  console.error('分享图片加载失败:', error)
  uni.showToast({
    title: '图片加载失败',
    icon: 'none',
    duration: 2000
  })
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
.share-demo-page {
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.container {
  padding: 30px;
}

.title {
  font-size: 24px;
  font-weight: bold;
  color: white;
  text-align: center;
  margin-bottom: 30px;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  color: white;
  margin-bottom: 15px;
}

.demo-task {
  margin-bottom: 30px;
}

.task-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
}

.task-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.task-emoji {
  font-size: 24px;
  margin-right: 10px;
}

.task-type {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
}

.task-content {
  font-size: 16px;
  color: white;
  line-height: 1.5;
  margin-bottom: 15px;
}

.task-feedback {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.4;
}

.demo-stats {
  margin-bottom: 30px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.stat-item {
  text-align: center;
  padding: 15px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}

.stat-number {
  display: block;
  font-size: 24px;
  font-weight: bold;
  color: #4facfe;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.share-buttons {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 30px;
}

.share-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 15px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  border: none;
  font-size: 16px;
  font-weight: bold;
  color: white;
  transition: all 0.3s ease;

  &.primary {
    background: rgba(79, 172, 254, 0.3);
    border: 2px solid #4facfe;
  }

  &:disabled {
    opacity: 0.5;
    background: rgba(255, 255, 255, 0.1);
  }
}

.share-btn:active:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
}

.btn-emoji {
  font-size: 18px;
  margin-right: 8px;
}

.generating-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px;
  margin-bottom: 30px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid #4facfe;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
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
  font-size: 16px;
  color: white;
}

.share-preview {
  margin-bottom: 30px;
}

.preview-container {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 15px;
}

.preview-image {
  width: 100%;
  border-radius: 8px;
  margin-bottom: 15px;
}

.preview-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.info-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

.preview-tip {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
}

.feature-info {
  margin-bottom: 20px;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-item {
  display: flex;
  align-items: center;
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.info-emoji {
  font-size: 16px;
  margin-right: 10px;
}

.info-text {
  font-size: 14px;
  color: white;
}
</style>