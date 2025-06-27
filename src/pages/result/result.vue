<template>
  <view class="result-page">
    <!-- 隐藏的画布用于生成分享图片 -->
    <canvas canvas-id="shareCanvas" style="position: fixed; top: -9999px; left: -9999px; width: 750px; height: 1000px;"
      width="750" height="1000"></canvas>

    <view v-if="taskRecord" class="result-container glass rounded">
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
        <button class="action-btn stats-btn" @click="viewStats">
          <text class="btn-emoji">📊</text>
          <text class="btn-text">查看统计</text>
        </button>
        <button class="action-btn home-btn" @click="goHome">
          <text class="btn-emoji">🏠</text>
          <text class="btn-text">返回首页</text>
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

      <!-- 成就提示 -->
      <view v-if="showAchievement" class="achievement">
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
      text: '🎉 恭喜完成第一个任务！'
    },
    {
      condition: () => stats.value.totalTasks === 10,
      text: '🎯 已完成10个任务，行动力正在提升！'
    },
    {
      condition: () => stats.value.totalTasks === 50,
      text: '🚀 已完成50个任务，你正在创造奇迹！'
    },
    {
      condition: () => stats.value.streakDays === 3,
      text: '🔥 连续完成3天，习惯正在形成！'
    },
    {
      condition: () => stats.value.streakDays === 7,
      text: '🌟 连续完成一周，你已经成为行动大师！'
    },
    {
      condition: () => completionRate.value >= 80,
      text: '💎 完成率超过80%，你的执行力令人敬佩！'
    }
  ]

  for (const achievement of achievements) {
    if (achievement.condition()) {
      showAchievement.value = true
      achievementText.value = achievement.text
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

// 查看统计
const viewStats = () => {
  uni.switchTab({
    url: '/pages/stats/stats'
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
  padding: 40rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.result-container {
  padding: 60rpx;
  margin-bottom: 40rpx;
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

.share-btn {
  background: linear-gradient(135deg, #a8edea, #fed6e3);
  color: white;
}

.next-btn {
  background: linear-gradient(135deg, #4facfe, #00f2fe);
  color: white;
}

.stats-btn {
  background: linear-gradient(135deg, #4facfe, #00f2fe);
  color: white;
}

.home-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2rpx solid rgba(255, 255, 255, 0.3);
}

.action-btn:active {
  transform: scale(0.95);
}

.btn-emoji {
  margin-right: 16rpx;
}

.achievement {
  text-align: center;
  padding: 40rpx;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.3), rgba(255, 165, 0, 0.3));
  border-radius: 24rpx;
  border: 4rpx solid rgba(255, 215, 0, 0.5);
}

.achievement-emoji {
  display: block;
  font-size: 64rpx;
  margin-bottom: 20rpx;
}

.achievement-text {
  font-size: 32rpx;
  color: white;
  font-weight: bold;
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