<template>
  <view class="index-page">
    <!-- 头部区域 -->
    <view class="header">
      <view class="test-btn" @click="goTestPage">
        <text class="test-btn-text">测试</text>
      </view>
      <view class="title">
        <text class="main-title">别问我干嘛</text>
        <text class="sub-title">让系统给你安排任务，盲目执行</text>
      </view>

      <!-- 今日统计 -->
      <view class="today-stats glass rounded">
        <view class="stat-item">
          <text class="stat-number">{{ todayTasks.length }}</text>
          <text class="stat-label">今日任务</text>
        </view>
        <view class="stat-item">
          <text class="stat-number">{{ todayCompleted }}</text>
          <text class="stat-label">已完成</text>
        </view>
        <view class="stat-item">
          <text class="stat-number">{{ todayRate }}%</text>
          <text class="stat-label">完成率</text>
        </view>
      </view>
    </view>

    <!-- 主要内容区域 -->
    <view class="main-content">
      <!-- 行动按钮 -->
      <view class="action-button-container">
        <button class="action-button" @click="generateTask" :disabled="isGenerating">
          <view class="action-button-content">
            <text class="button-emoji">🌀</text>
            <text class="button-text">{{ isGenerating ? '生成中...' : '随机一下' }}</text>
          </view>
        </button>
      </view>

      <!-- 当前任务展示 -->
      <view v-if="currentTask" class="task-display glass rounded">
        <view class="task-header">
          <text class="task-emoji">{{ currentTask.emoji }}</text>
          <text class="task-type">{{ currentTask.type }}</text>
        </view>

        <view class="task-content">
          <text class="task-text">{{ currentTask.content }}</text>
        </view>

        <view class="task-actions">
          <button class="action-btn complete-btn" @click="handleComplete">
            <text class="btn-emoji">✅</text>
            <text class="btn-text">去做了</text>
          </button>

          <button class="action-btn skip-btn" @click="handleSkip">
            <text class="btn-emoji">🙅‍♀️</text>
            <text class="btn-text">跳过</text>
          </button>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-else class="empty-state glass rounded">
        <text class="empty-emoji">🎲</text>
        <text class="empty-text">点击上方按钮开始行动</text>
        <text class="empty-subtext">系统会随机给你安排一个任务</text>
      </view>
    </view>

    <!-- 底部提示 -->
    <view class="footer-tips">
      <text class="tip-text">💡 提示：别想太多，直接执行就好</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTaskStore } from '@/stores/taskStore'

const taskStore = useTaskStore()
const isGenerating = ref(false)

// 计算属性
const currentTask = computed(() => taskStore.currentTask)
const todayTasks = computed(() => taskStore.getTodayTasks())
const todayCompleted = computed(() =>
  todayTasks.value.filter(task => task.status === 'completed').length
)
const todayRate = computed(() => {
  if (todayTasks.value.length === 0) return 0
  return Math.round((todayCompleted.value / todayTasks.value.length) * 100)
})

// 生成任务
const generateTask = async () => {
  isGenerating.value = true

  // 模拟加载效果
  await new Promise(resolve => setTimeout(resolve, 800))

  taskStore.generateRandomTask()
  isGenerating.value = false
}

// 完成任务
const handleComplete = () => {
  const record = taskStore.completeTask()

  uni.showToast({
    title: '任务完成！',
    icon: 'success',
    duration: 2000
  })

  // 跳转到结果页面
  setTimeout(() => {
    uni.navigateTo({
      url: `/pages/result/result?id=${record.id}`
    })
  }, 1000)
}

// 跳过任务
const handleSkip = () => {
  const record = taskStore.skipTask()

  uni.showToast({
    title: '已跳过',
    icon: 'none',
    duration: 1500
  })

  // 清空当前任务
  taskStore.currentTask = null
}

const goTestPage = () => {
  uni.navigateTo({ url: '/pages/test/test' })
}

onMounted(() => {
  // 页面加载时的初始化
  console.log('首页加载完成')
})
</script>

<style lang="scss" scoped>
.index-page {
  padding: 40rpx;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.header {
  margin-bottom: 30rpx;
  position: relative;
}

.title {
  text-align: center;
  margin-bottom: 60rpx;
}

.main-title {
  display: block;
  font-size: 28px;
  font-weight: bold;
  color: white;
  margin-bottom: 8px;
}

.sub-title {
  display: block;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
}

.today-stats {
  display: flex;
  justify-content: space-around;
  padding: 40rpx;
  margin: 0 40rpx;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 24px;
  font-weight: bold;
  color: white;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.action-button-container {
  margin-bottom: 40rpx;
  position: relative;
  width: 220rpx;
  height: 220rpx;
}

.action-button {
  width: 220rpx;
  height: 220rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  border: none;
  box-shadow: 0 20rpx 120rpx rgba(255, 107, 107, 0.3);
  transition: all 0.3s ease;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  position: absolute;

  .action-button-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-around;
    height: 100%;
    width: 100%;
  }
}

.action-button:active {
  transform: translate(-50%, -50%) scale(0.95);
}

.action-button:disabled {
  opacity: 0.7;
}

.button-emoji {
  font-size: 64rpx;
  height: 64rpx;
  margin-bottom: 8rpx;
}

.button-text {
  font-size: 32rpx;
  color: white;
  font-weight: bold;
}

.task-display {
  height: 400rpx;
  width: 100%;
  max-width: 100%;
  padding: 30rpx;
}

.task-header {
  display: flex;
  align-items: center;
  margin-bottom: 40rpx;
}

.task-emoji {
  font-size: 32px;
  margin-right: 12px;
}

.task-type {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

.task-content {
  margin-bottom: 60rpx;
}

.task-text {
  font-size: 18px;
  color: white;
  line-height: 1.6;
  text-align: center;
}

.task-actions {
  display: flex;
  gap: 15px;
}

.action-btn {
  flex: 1;
  height: 50px;
  border-radius: 25px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.3s ease;
}

.complete-btn {
  background: linear-gradient(135deg, #00b894, #00a085);
  color: white;
}

.skip-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.action-btn:active {
  transform: scale(0.95);
}

.btn-emoji {
  margin-right: 8px;
}

.empty-state {
  height: 400rpx;
  width: 100%;
  max-width: 100%;
  padding: 30rpx;
  text-align: center;
}

.empty-emoji {
  font-size: 64px;
  display: block;
  margin-bottom: 40rpx;
}

.empty-text {
  display: block;
  font-size: 18px;
  color: white;
  margin-bottom: 8px;
}

.empty-subtext {
  display: block;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

.footer-tips {
  text-align: center;
  margin-top: 20rpx;
}

.tip-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

.test-btn {
  position: absolute;
  top: 18rpx;
  right: 0rpx;
  z-index: 10;
  background: rgba(255, 255, 255, 0.18);
  border-radius: 20rpx;
  padding: 10rpx 28rpx;
  color: #fff;
  font-size: 16px;
  font-weight: bold;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
  cursor: pointer;
}

.test-btn-text {
  letter-spacing: 2rpx;
}
</style>
