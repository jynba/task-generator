<template>
  <view class="result-page">
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
        <button class="action-btn share-btn" @click="shareResult">
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
import { ref, computed, onMounted } from 'vue'
import { useTaskStore } from '@/stores/taskStore'
import { formatTime, getRandomFeedback } from '@/utils/index'

const taskStore = useTaskStore()

// 响应式数据
const taskRecord = ref(null)
const completionFeedback = ref('')
const showAchievement = ref(false)
const achievementText = ref('')

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
      completionFeedback.value = getRandomFeedback(record.status)
      
      // 检查是否触发成就
      checkAchievements()
    } else {
      // 如果没有找到记录，使用最新的记录
      const latestRecord = taskStore.taskHistory[taskStore.taskHistory.length - 1]
      if (latestRecord) {
        taskRecord.value = latestRecord
        completionFeedback.value = getRandomFeedback(latestRecord.status)
        checkAchievements()
      }
    }
  } else {
    // 没有ID参数，使用最新记录
    const latestRecord = taskStore.taskHistory[taskStore.taskHistory.length - 1]
    if (latestRecord) {
      taskRecord.value = latestRecord
      completionFeedback.value = getRandomFeedback(latestRecord.status)
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

// 分享结果
const shareResult = () => {
  const shareText = `我在盲打任务生成器中${taskRecord.value.status === 'completed' ? '完成了' : '跳过了'}：${taskRecord.value.task.content}`
  
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
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.result-container {
  padding: 30px;
  margin-bottom: 20px;
}

.result-header {
  text-align: center;
  margin-bottom: 30px;
}

.result-emoji {
  display: block;
  font-size: 64px;
  margin-bottom: 15px;
}

.result-title {
  font-size: 24px;
  font-weight: bold;
  color: white;
}

.task-info {
  margin-bottom: 30px;
}

.task-type {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
}

.task-emoji {
  font-size: 24px;
  margin-right: 10px;
}

.task-type-text {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
}

.task-content {
  display: block;
  font-size: 18px;
  color: white;
  line-height: 1.5;
  text-align: center;
  margin-bottom: 15px;
}

.task-time {
  display: block;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
}

.completion-feedback {
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  margin-bottom: 25px;
  text-align: center;
}

.feedback-text {
  font-size: 16px;
  color: white;
  line-height: 1.5;
}

.stats-preview {
  display: flex;
  justify-content: space-around;
  margin-bottom: 25px;
}

.stats-item {
  text-align: center;
}

.stats-number {
  display: block;
  font-size: 24px;
  font-weight: bold;
  color: white;
  margin-bottom: 5px;
}

.stats-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.streak-info {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 15px;
  background: rgba(255, 107, 107, 0.2);
  border-radius: 12px;
  margin-bottom: 25px;
}

.streak-emoji {
  font-size: 20px;
  margin-right: 8px;
}

.streak-text {
  font-size: 16px;
  color: white;
  font-weight: bold;
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

.share-btn {
  background: linear-gradient(135deg, #a8edea, #fed6e3);
  color: white;
}

.next-btn {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.stats-btn {
  background: linear-gradient(135deg, #4facfe, #00f2fe);
  color: white;
}

.home-btn {
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

.achievement {
  text-align: center;
  padding: 20px;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.3), rgba(255, 165, 0, 0.3));
  border-radius: 12px;
  border: 2px solid rgba(255, 215, 0, 0.5);
}

.achievement-emoji {
  display: block;
  font-size: 32px;
  margin-bottom: 10px;
}

.achievement-text {
  font-size: 16px;
  color: white;
  font-weight: bold;
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
</style> 