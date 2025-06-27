<template>
  <view class="task-page">
    <!-- 隐藏的画布用于生成分享图片 -->
    <canvas canvas-id="shareCanvas" style="position: fixed; top: -9999px; left: -9999px; width: 750px; height: 1000px;"
      width="750" height="1000"></canvas>

    <view v-if="currentTask" class="task-container glass rounded">
      <!-- 任务头部 -->
      <view class="task-header">
        <text class="task-emoji">{{ currentTask.emoji }}</text>
        <text class="task-type">{{ currentTask.type }}</text>
      </view>

      <!-- 任务内容 -->
      <view class="task-content">
        <text class="task-text">{{ currentTask.content }}</text>
      </view>

      <!-- 执行提示 -->
      <view class="execution-tip">
        <text class="tip-text">{{ executionTip }}</text>
      </view>

      <!-- 计时器 -->
      <view v-if="showTimer" class="timer-container">
        <text class="timer-text">{{ formatTime(timer) }}</text>
        <view class="progress-bar">
          <view class="progress-fill" :style="{ width: progressPercent + '%' }"></view>
        </view>
        <text class="progress-text">{{ progressText }}</text>
      </view>

      <!-- 操作按钮 -->
      <view class="action-buttons">
        <button v-if="!isCompleted" class="action-btn complete-btn" @click="completeTask" :disabled="isProcessing">
          <text class="btn-emoji">✅</text>
          <text class="btn-text">完成任务</text>
        </button>

        <button v-if="!isCompleted" class="action-btn skip-btn" @click="skipTask" :disabled="isProcessing">
          <text class="btn-emoji">🙅‍♀️</text>
          <text class="btn-text">跳过任务</text>
        </button>

        <button v-if="!isCompleted && hasTimer" class="action-btn timer-btn" @click="toggleTimer"
          :class="{ 'timer-active': timerRunning }">
          <text class="btn-emoji">{{ timerRunning ? '⏸️' : '⏱️' }}</text>
          <text class="btn-text">{{ timerRunning ? '暂停' : '开始计时' }}</text>
        </button>

        <button v-if="isCompleted" class="action-btn share-btn" @click="generateShareImage">
          <text class="btn-emoji">📤</text>
          <text class="btn-text">分享成果</text>
        </button>
        <button v-if="isCompleted" class="action-btn next-btn" @click="generateNextTask">
          <text class="btn-emoji">🎲</text>
          <text class="btn-text">下一个任务</text>
        </button>
      </view>

      <!-- 完成反馈 -->
      <view v-if="isCompleted" class="completion-feedback">
        <text class="feedback-emoji">🎉</text>
        <text class="feedback-text">{{ completionFeedback }}</text>
      </view>

      <!-- 进度指示器 -->
      <view class="progress-indicator">
        <view class="progress-bar">
          <view class="progress-fill" :style="{ width: progressPercent + '%' }"></view>
        </view>
        <text class="progress-text">{{ progressText }}</text>
      </view>

      <!-- 分享图片预览 -->
      <view v-if="shareImagePath" class="share-preview" ref="previewRef">
        <text class="section-title">分享图片预览</text>
        <view class="preview-container">
          <image :src="shareImagePath" mode="widthFix" class="preview-image" @load="onImageLoad"
            @error="onImageError" />
          <view class="preview-info">
            <text class="info-text">尺寸: 750x1000</text>
            <text class="info-text">状态: 生成成功</text>
          </view>
        </view>
        <text class="preview-tip">长按图片可保存到相册，或点击下方按钮保存</text>
      </view>
    </view>

    <!-- 加载状态 -->
    <view v-else class="loading-container">
      <view class="loading-spinner"></view>
      <text class="loading-text">正在生成任务...</text>
    </view>

    <!-- 底部导航提示 -->
    <view class="bottom-hint">
      <text class="hint-text">💡 提示：完成任务后可以查看统计报告</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useTaskStore } from '@/stores/taskStore'
import { parseTaskTime, getExecutionTip } from '@/utils/index'
const taskStore = useTaskStore()

// 响应式数据
const currentTask = ref(null)
const isCompleted = ref(false)
const isProcessing = ref(false)
const timer = ref(0)
const timerRunning = ref(false)
const timerInterval = ref(null)
const completionFeedback = ref('')
const taskRecord = ref(null)
const shareImagePath = ref('')
const previewRef = ref(null)

const stats = computed(() => taskStore.stats)

// 计算属性
const hasTimer = computed(() => {
  if (!currentTask.value) return false
  const timeInSeconds = parseTaskTime(currentTask.value.content)
  return timeInSeconds > 0
})

const showTimer = computed(() => {
  return hasTimer.value && timer.value > 0
})

const executionTip = computed(() => {
  if (!currentTask.value) return ''
  return getExecutionTip(currentTask.value.category)
})

const progressPercent = computed(() => {
  if (!hasTimer.value) return 0
  const totalTime = parseTaskTime(currentTask.value.content)
  if (totalTime === 0) return 0
  return Math.min((timer.value / totalTime) * 100, 100)
})

const progressText = computed(() => {
  if (!hasTimer.value) return ''
  const totalTime = parseTaskTime(currentTask.value.content)
  if (totalTime === 0) return ''
  return `${Math.round(progressPercent.value)}% 完成`
})

// 格式化时间显示
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 生成任务
const generateTask = () => {
  const result = taskStore.generateRandomTask()
  currentTask.value = result.task
  isCompleted.value = false
  isProcessing.value = false
  timer.value = 0
  timerRunning.value = false
  completionFeedback.value = ''
  taskRecord.value = null

  // 如果有计时器，自动开始
  if (hasTimer.value) {
    const totalTime = parseTaskTime(currentTask.value.content)
    timer.value = totalTime
    startTimer()
  }
}

// 开始计时器
const startTimer = () => {
  if (timerInterval.value) return

  timerRunning.value = true
  timerInterval.value = setInterval(() => {
    if (timer.value > 0) {
      timer.value--
    } else {
      stopTimer()
      // 时间到自动完成任务
      completeTask()
    }
  }, 1000)
}

// 停止计时器
const stopTimer = () => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
    timerInterval.value = null
  }
  timerRunning.value = false
}

// 切换计时器
const toggleTimer = () => {
  if (timerRunning.value) {
    stopTimer()
  } else {
    startTimer()
  }
}

// 完成任务
const completeTask = async () => {
  if (isProcessing.value) return

  isProcessing.value = true
  stopTimer()

  // 添加完成动画效果
  await new Promise(resolve => setTimeout(resolve, 500))

  taskRecord.value = taskStore.completeTask()
  completionFeedback.value = taskStore.currentFeedback.completed
  isCompleted.value = true
  isProcessing.value = false

  // 震动反馈
  uni.vibrateShort()

  // 显示完成提示
  uni.showToast({
    title: '任务完成！',
    icon: 'success',
    duration: 2000
  })
}

// 跳过任务
const skipTask = async () => {
  if (isProcessing.value) return

  isProcessing.value = true
  stopTimer()

  // 添加跳过动画效果
  await new Promise(resolve => setTimeout(resolve, 300))

  taskRecord.value = taskStore.skipTask()
  completionFeedback.value = taskStore.currentFeedback.skipped
  isCompleted.value = true
  isProcessing.value = false

  // 显示跳过提示
  uni.showToast({
    title: '已跳过任务',
    icon: 'none',
    duration: 2000
  })
}

// 生成分享图片
const generateShareImage = async () => {
  if (!currentTask.value) {
    uni.showToast({
      title: '暂无任务记录',
      icon: 'none',
      duration: 2000
    })
    return
  }
  // 跳转到新页面并传递参数
  uni.navigateTo({
    url: `/pages/share-preview/share-preview?taskRecord=${encodeURIComponent(JSON.stringify(taskRecord.value))}&stats=${encodeURIComponent(JSON.stringify(stats.value))}`
  })
}

// 生成下一个任务
const generateNextTask = () => {
  generateTask()
}

// 页面生命周期
onMounted(() => {
  generateTask()
})

onUnmounted(() => {
  stopTimer()
})

const onImageLoad = () => { }
const onImageError = (error) => {
  uni.showToast({ title: '图片加载失败', icon: 'none', duration: 2000 })
}
</script>

<style lang="scss" scoped>
.task-page {
  min-height: 100vh;
  padding: 0 40rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.task-container {
  padding: 60rpx;
  margin-bottom: 40rpx;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 50rpx;
}

.task-emoji {
  font-size: 64rpx;
  margin-right: 24rpx;
}

.task-type {
  font-size: 36rpx;
  font-weight: bold;
  color: white;
}

.task-content {
  margin-bottom: 50rpx;
}

.task-text {
  font-size: 40rpx;
  color: white;
  line-height: 1.5;
  text-align: center;
}

.execution-tip {
  display: flex;
  align-items: flex-start;
  padding: 30rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 24rpx;
  margin-bottom: 50rpx;
}

.tip-text {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.4;
  flex: 1;
}

.timer-container {
  display: flex;
  align-items: center;
  padding: 30rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 24rpx;
  margin-bottom: 50rpx;
}

.timer-text {
  font-size: 32rpx;
  font-weight: bold;
  color: white;
  margin-right: 40rpx;
}

.progress-bar {
  height: 12rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 6rpx;
  overflow: hidden;
  margin-right: 40rpx;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4facfe, #00f2fe);
  border-radius: 6rpx;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
  margin-bottom: 50rpx;
}

.action-btn {
  height: 112rpx;
  border-radius: 56rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  font-weight: bold;
  transition: all 0.3s ease;
}

.complete-btn {
  background: linear-gradient(135deg, #4facfe, #00f2fe);
  color: white;
}

.skip-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.timer-btn {
  background: linear-gradient(135deg, #ff9a9e, #fecfef);
  color: white;
}

.timer-btn.timer-active {
  background: linear-gradient(135deg, #ffecd2, #fcb69f);
}

.share-btn {
  background: linear-gradient(135deg, #a8edea, #fed6e3);
  color: white;
}


.next-btn {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.action-btn:active {
  transform: scale(0.95);
}

.action-btn:disabled {
  opacity: 0.6;
  transform: none;
}

.btn-emoji {
  margin-right: 16rpx;
}

.completion-feedback {
  text-align: center;
  padding: 40rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 24rpx;
  margin-bottom: 50rpx;
}

.feedback-emoji {
  display: block;
  font-size: 32px;
  margin-bottom: 20rpx;
}

.feedback-text {
  font-size: 32rpx;
  color: white;
  line-height: 1.4;
}

.progress-indicator {
  margin-top: 40rpx;
}

.progress-bar {
  height: 12rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 6rpx;
  overflow: hidden;
  margin-bottom: 16rpx;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4facfe, #00f2fe);
  border-radius: 6rpx;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 40rpx;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 6rpx solid rgba(255, 255, 255, 0.3);
  border-top: 6rpx solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 40rpx;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 32rpx;
  color: white;
}

.bottom-hint {
  text-align: center;
  padding: 40rpx;
}

.hint-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

.share-preview {
  padding: 40rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 24rpx;
  margin-top: 40rpx;
  margin-bottom: 40rpx;
}

.section-title {
  font-size: 36rpx;
  font-weight: bold;
  color: white;
  margin-bottom: 40rpx;
}

.preview-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 40rpx;
}

.preview-image {
  width: 100%;
  max-width: 750px;
  height: auto;
  border-radius: 24rpx;
}

.preview-info {
  margin-left: 40rpx;
}

.info-text {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 20rpx;
}

.preview-tip {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
}
</style>