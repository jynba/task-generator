<template>
  <view class="task-page">
    <view v-if="currentTask" class="task-container glass rounded">
      <!-- 任务头部 -->
      <view class="task-header">
        <view class="task-type">
          <text class="task-emoji">{{ currentTask.emoji }}</text>
          <text class="task-type-text">{{ currentTask.type }}</text>
        </view>
        
        <view class="task-timer" v-if="showTimer">
          <text class="timer-text">{{ formatTime(timer) }}</text>
        </view>
      </view>

      <!-- 任务内容 -->
      <view class="task-content">
        <text class="task-description">{{ currentTask.content }}</text>
      </view>

      <!-- 执行提示 -->
      <view class="execution-tip">
        <text class="tip-emoji">💡</text>
        <text class="tip-text">{{ executionTip }}</text>
      </view>

      <!-- 操作按钮 -->
      <view class="action-buttons">
        <button 
          v-if="!isCompleted" 
          class="action-btn complete-btn" 
          @click="completeTask"
          :disabled="isProcessing"
        >
          <text class="btn-emoji">✅</text>
          <text class="btn-text">完成任务</text>
        </button>
        
        <button 
          v-if="!isCompleted" 
          class="action-btn skip-btn" 
          @click="skipTask"
          :disabled="isProcessing"
        >
          <text class="btn-emoji">🙅‍♀️</text>
          <text class="btn-text">跳过任务</text>
        </button>
        
        <button 
          v-if="!isCompleted && hasTimer" 
          class="action-btn timer-btn" 
          @click="toggleTimer"
          :class="{ 'timer-active': timerRunning }"
        >
          <text class="btn-emoji">{{ timerRunning ? '⏸️' : '⏱️' }}</text>
          <text class="btn-text">{{ timerRunning ? '暂停' : '开始计时' }}</text>
        </button>
        
        <button 
          v-if="isCompleted" 
          class="action-btn share-btn" 
          @click="shareTask"
        >
          <text class="btn-emoji">📤</text>
          <text class="btn-text">分享成果</text>
        </button>
        
        <button 
          v-if="isCompleted" 
          class="action-btn next-btn" 
          @click="generateNextTask"
        >
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
          <view 
            class="progress-fill" 
            :style="{ width: progressPercent + '%' }"
          ></view>
        </view>
        <text class="progress-text">{{ progressText }}</text>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useTaskStore } from '@/stores/taskStore'
import { parseTaskTime, getRandomFeedback, getExecutionTip } from '@/utils/index'

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
  currentTask.value = taskStore.generateRandomTask()
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
  completionFeedback.value = getRandomFeedback('completed')
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
  completionFeedback.value = getRandomFeedback('skipped')
  isCompleted.value = true
  isProcessing.value = false
  
  // 显示跳过提示
  uni.showToast({
    title: '已跳过任务',
    icon: 'none',
    duration: 2000
  })
}

// 分享任务
const shareTask = () => {
  const shareText = `我在盲打任务生成器中完成了：${currentTask.value.content}`
  
  uni.share({
    provider: 'weixin',
    scene: 'WXSceneSession',
    type: 0,
    href: 'https://your-app-url.com',
    title: '盲打任务生成器',
    summary: shareText,
    imageUrl: 'https://your-app-url.com/share-image.png',
    success: () => {
      uni.showToast({
        title: '分享成功',
        icon: 'success',
        duration: 2000
      })
    },
    fail: () => {
      uni.showToast({
        title: '分享失败',
        icon: 'none',
        duration: 2000
      })
    }
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
</script>

<style lang="scss" scoped>
.task-page {
  min-height: 100vh;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.task-container {
  padding: 30px;
  margin-bottom: 20px;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.task-type {
  display: flex;
  align-items: center;
}

.task-emoji {
  font-size: 32px;
  margin-right: 12px;
}

.task-type-text {
  font-size: 18px;
  font-weight: bold;
  color: white;
}

.task-timer {
  background: rgba(255, 255, 255, 0.2);
  padding: 8px 16px;
  border-radius: 20px;
}

.timer-text {
  font-size: 16px;
  font-weight: bold;
  color: white;
}

.task-content {
  margin-bottom: 25px;
}

.task-description {
  font-size: 20px;
  color: white;
  line-height: 1.5;
  text-align: center;
}

.execution-tip {
  display: flex;
  align-items: flex-start;
  padding: 15px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  margin-bottom: 25px;
}

.tip-emoji {
  font-size: 20px;
  margin-right: 12px;
  margin-top: 2px;
}

.tip-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.4;
  flex: 1;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 25px;
}

.action-btn {
  height: 56px;
  border-radius: 28px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
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
  margin-right: 8px;
}

.completion-feedback {
  text-align: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  margin-bottom: 25px;
}

.feedback-emoji {
  display: block;
  font-size: 32px;
  margin-bottom: 10px;
}

.feedback-text {
  font-size: 16px;
  color: white;
  line-height: 1.4;
}

.progress-indicator {
  margin-top: 20px;
}

.progress-bar {
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4facfe, #00f2fe);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 16px;
  color: white;
}

.bottom-hint {
  text-align: center;
  padding: 20px;
}

.hint-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}
</style> 