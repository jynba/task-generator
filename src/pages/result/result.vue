<template>
  <view class="result-page">
    <view v-if="taskRecord" class="result-container glass rounded">
      <!-- 顶部icon按钮 -->
      <view class="corner-btn left-corner" @click="goHome">
        <text class="corner-icon">🏠</text>
      </view>
      <!-- 结果头部 -->
      <view class="result-header">
        <text class="result-emoji">{{ resultEmoji }}</text>
        <text class="result-title">{{ resultTitle }}</text>
      </view>

      <!-- 任务信息 -->
      <view class="task-info">
        <view class="task-type">
          <text class="task-emoji">{{ taskRecord.task.emoji }}</text>
          <text class="task-type-text">{{ taskRecord.task.type }}</text>
        </view>

        <text class="task-content">{{ taskRecord.task.content }}</text>

        <text class="task-time">{{ formatTime(taskRecord.timestamp) }}</text>
      </view>

      <!-- 完成反馈 -->
      <view class="completion-feedback">
        <text class="feedback-text">{{ completionFeedback }}</text>
      </view>

      <!-- 统计信息 -->
      <view class="stats-preview">
        <view class="stats-item">
          <text class="stats-number">{{ stats.totalTasks }}</text>
          <text class="stats-label">总任务数</text>
        </view>

        <view class="stats-item">
          <text class="stats-number">{{ stats.completedTasks }}</text>
          <text class="stats-label">已完成</text>
        </view>

        <view class="stats-item">
          <text class="stats-number">{{ completionRate }}%</text>
          <text class="stats-label">完成率</text>
        </view>
      </view>

      <!-- 连续完成天数 -->
      <view v-if="stats.streakDays > 0" class="streak-info">
        <text class="streak-emoji">🔥</text>
        <text class="streak-text">连续完成 {{ stats.streakDays }} 天</text>
      </view>

      <!-- 操作按钮 -->
      <view class="action-buttons">
        <button class="action-btn share-btn" @click="generateShareImage">
          <text class="btn-emoji">📤</text>
          <text class="btn-text">分享成果</text>
        </button>
        <button class="action-btn next-btn" @click="generateNextTask">
          <text class="btn-emoji">🎲</text>
          <text class="btn-text">下一个任务</text>
        </button>
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

      <!-- 顶部成就浮现提示 -->
      <view v-if="showAchievement" class="achievement-toast" :class="{ 'show': showAchievement }">
        <text class="achievement-emoji">🏆</text>
        <text class="achievement-text">{{ achievementText }}</text>
      </view>
    </view>

    <!-- 加载状态 -->
    <view v-else class="loading-container">
      <view class="loading-spinner"></view>
      <text class="loading-text">加载中...</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useTaskStore } from '@/stores/taskStore'
import { formatTime } from '@/utils/index'

const taskStore = useTaskStore()

// 响应式数据
const taskRecord = ref(null)
const completionFeedback = ref('')
const showAchievement = ref(false)
const achievementText = ref('')
const shareImagePath = ref('')
const previewRef = ref(null)
let achievementTimer = null

// 计算属性
const stats = computed(() => taskStore.stats)
const completionRate = computed(() => taskStore.completionRate)

const resultEmoji = computed(() => {
  if (!taskRecord.value) return '🎉'
  return taskRecord.value.status === 'completed' ? '🎉' : '😌'
})

const resultTitle = computed(() => {
  if (!taskRecord.value) return '任务结果'
  return taskRecord.value.status === 'completed' ? '任务完成！' : '任务已跳过'
})

// 页面加载
onMounted(() => {
  // 从页面参数获取任务记录ID
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const taskId = currentPage.options?.id

  if (taskId) {
    // 查找任务记录
    const record = taskStore.taskHistory.find(r => r.id == taskId)
    if (record) {
      taskRecord.value = record
      completionFeedback.value = record.feedback

      // 检查是否触发成就
      checkAchievements()
    } else {
      // 如果没有找到记录，使用最新的记录
      const latestRecord = taskStore.taskHistory[taskStore.taskHistory.length - 1]
      if (latestRecord) {
        taskRecord.value = latestRecord
        completionFeedback.value = latestRecord.feedback
        checkAchievements()
      }
    }
  } else {
    // 没有ID参数，使用最新记录
    const latestRecord = taskStore.taskHistory[taskStore.taskHistory.length - 1]
    if (latestRecord) {
      taskRecord.value = latestRecord
      completionFeedback.value = latestRecord.feedback
      checkAchievements()
    }
  }
})

// 检查成就
const checkAchievements = () => {
  const achievements = [
    {
      condition: () => stats.value.totalTasks === 1,
      text: '恭喜完成第一个任务！'
    },
    {
      condition: () => stats.value.totalTasks === 10,
      text: '已完成10个任务，行动力正在提升！'
    },
    {
      condition: () => stats.value.totalTasks === 50,
      text: '已完成50个任务，你正在创造奇迹！'
    },
    {
      condition: () => stats.value.streakDays === 3,
      text: '连续完成3天，习惯正在形成！'
    },
    {
      condition: () => stats.value.streakDays === 7,
      text: '连续完成一周，你已经成为行动大师！'
    },
    {
      condition: () => completionRate.value >= 80,
      text: '完成率超过80%，你的执行力令人敬佩！'
    }
  ]

  for (const achievement of achievements) {
    if (achievement.condition()) {
      showAchievement.value = true
      achievementText.value = achievement.text
      if (achievementTimer) clearTimeout(achievementTimer)
      achievementTimer = setTimeout(() => {
        showAchievement.value = false
      }, 2500)
      break
    }
  }
}

const generateShareImage = async () => {
  if (!taskRecord.value) {
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

const onImageLoad = () => { }
const onImageError = (error) => {
  uni.showToast({ title: '图片加载失败', icon: 'none', duration: 2000 })
}

// 生成下一个任务
const generateNextTask = () => {
  taskStore.generateRandomTask()
  uni.navigateTo({
    url: '/pages/task/task'
  })
}

// 返回首页
const goHome = () => {
  uni.switchTab({
    url: '/pages/index/index'
  })
}
</script>

<style lang="scss" scoped>
.result-page {
  min-height: 100vh;
  padding: 0 40rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.result-container {
  padding: 60rpx;
}

.result-header {
  text-align: center;
  margin-bottom: 60rpx;
}

.result-emoji {
  display: block;
  font-size: 128rpx;
  margin-bottom: 30rpx;
}

.result-title {
  font-size: 48rpx;
  font-weight: bold;
  color: white;
}

.task-info {
  margin-bottom: 60rpx;
}

.task-type {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30rpx;
}

.task-emoji {
  font-size: 48rpx;
  margin-right: 20rpx;
}

.task-type-text {
  font-size: 32rpx;
  color: rgba(255, 255, 255, 0.9);
}

.task-content {
  display: block;
  font-size: 36rpx;
  color: white;
  line-height: 1.5;
  text-align: center;
  margin-bottom: 30rpx;
}

.task-time {
  display: block;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
}

.completion-feedback {
  padding: 40rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 24rpx;
  margin-bottom: 50rpx;
  text-align: center;
}

.feedback-text {
  font-size: 32rpx;
  color: white;
  line-height: 1.5;
}

.stats-preview {
  display: flex;
  justify-content: space-around;
  margin-bottom: 50rpx;
}

.stats-item {
  text-align: center;
}

.stats-number {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: white;
  margin-bottom: 10rpx;
}

.stats-label {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
}

.streak-info {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30rpx;
  background: rgba(255, 107, 107, 0.2);
  border-radius: 24rpx;
  margin-bottom: 50rpx;
}

.streak-emoji {
  font-size: 40rpx;
  margin-right: 16rpx;
}

.streak-text {
  font-size: 32rpx;
  color: white;
  font-weight: bold;
}

.corner-btn {
  position: absolute;
  top: 32rpx;
  width: 80rpx;
  height: 80rpx;
  background: rgba(255, 255, 255, 0.18);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
  cursor: pointer;
}

.left-corner {
  left: 32rpx;
}

.right-corner {
  right: 32rpx;
}

.corner-icon {
  font-size: 40rpx;
  color: #fff;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 40rpx;
  margin: 40rpx 0 0 0;
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

.achievement-toast {
  position: fixed;
  top: 60rpx;
  left: 50%;
  transform: translateX(-50%) translateY(-60rpx);
  background: linear-gradient(90deg, #ffe259, #ffa751);
  color: #fff;
  border-radius: 32rpx;
  box-shadow: 0 4rpx 24rpx rgba(255, 215, 0, 0.18);
  min-width: 480rpx;
  max-width: 90vw;
  padding: 28rpx 80rpx;
  display: flex;
  align-items: center;
  z-index: 999;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s, transform 0.3s;
}

.achievement-toast.show {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
  pointer-events: auto;
}

.achievement-emoji {
  font-size: 40rpx;
  margin-right: 18rpx;
}

.achievement-text {
  font-size: 28rpx;
  font-weight: bold;
  color: #fff;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 40rpx;
}

.loading-spinner {
  width: 80rpx;
  height: 80rpx;
  border: 6rpx solid rgba(255, 255, 255, 0.3);
  border-top: 6rpx solid white;
  border-radius: 100%;
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

.share-preview {
  padding: 40rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 24rpx;
  margin-bottom: 40rpx;
  text-align: center;
}

.section-title {
  font-size: 48rpx;
  font-weight: bold;
  color: white;
  margin-bottom: 40rpx;
}

.preview-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30rpx;
}

.preview-image {
  width: 100%;
  max-width: 1500rpx;
  height: auto;
  border-radius: 16rpx;
}

.preview-info {
  text-align: left;
  margin-left: 30rpx;
}

.info-text {
  display: block;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 10rpx;
}

.preview-tip {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.7);
}
</style>