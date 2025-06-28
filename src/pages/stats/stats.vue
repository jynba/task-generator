<template>
  <view class="stats-page">
    <!-- 总体统计 -->
    <view class="overall-stats glass rounded">
      <text class="stats-title">总体行动力报告</text>

      <view class="stats-grid">
        <view class="stat-card">
          <text class="stat-number">{{ stats.totalTasks }}</text>
          <text class="stat-label">总任务数</text>
        </view>

        <view class="stat-card">
          <text class="stat-number">{{ stats.completedTasks }}</text>
          <text class="stat-label">已完成</text>
        </view>

        <view class="stat-card">
          <text class="stat-number">{{ stats.skippedTasks }}</text>
          <text class="stat-label">已跳过</text>
        </view>

        <view class="stat-card">
          <text class="stat-number">{{ completionRate }}%</text>
          <text class="stat-label">完成率</text>
        </view>
      </view>
    </view>

    <!-- 连续完成天数 -->
    <view class="streak-stats glass rounded">
      <text class="section-title">🔥 连续完成</text>
      <view class="streak-content">
        <text class="streak-number">{{ stats.streakDays }}</text>
        <text class="streak-label">天</text>
      </view>
      <text class="streak-desc">继续保持这个节奏！</text>
    </view>

    <!-- 本周统计 -->
    <view class="week-stats glass rounded">
      <text class="section-title">本周表现</text>

      <view class="week-data">
        <view class="week-item">
          <text class="week-label">本周任务</text>
          <text class="week-number">{{ weekTasks.length }}</text>
        </view>

        <view class="week-item">
          <text class="week-label">本周完成</text>
          <text class="week-number">{{ weekCompleted }}</text>
        </view>

        <view class="week-item">
          <text class="week-label">本周完成率</text>
          <text class="week-number">{{ weekRate }}%</text>
        </view>
      </view>
    </view>

    <!-- 本月统计 -->
    <view class="month-stats glass rounded">
      <text class="section-title">本月表现</text>

      <view class="month-data">
        <view class="month-item">
          <text class="month-label">本月任务</text>
          <text class="month-number">{{ monthTasks.length }}</text>
        </view>

        <view class="month-item">
          <text class="month-label">本月完成</text>
          <text class="month-number">{{ monthCompleted }}</text>
        </view>

        <view class="month-item">
          <text class="month-label">本月完成率</text>
          <text class="month-number">{{ monthRate }}%</text>
        </view>
      </view>
    </view>

    <!-- 任务类型分布 -->
    <view class="category-stats glass rounded">
      <text class="section-title">任务类型分布</text>

      <view class="category-list">
        <view v-for="category in categoryStats" :key="category.name" class="category-item">
          <view class="category-info">
            <text class="category-emoji">{{ category.emoji }}</text>
            <text class="category-name">{{ category.name }}</text>
          </view>

          <view class="category-numbers">
            <text class="category-count">{{ category.count }}</text>
            <text class="category-percent">{{ category.percent }}%</text>
            <text class="category-rate">({{ category.completionRate }}%)</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 最近任务记录 -->
    <view class="recent-tasks glass rounded">
      <text class="section-title">最近任务记录</text>

      <view v-if="recentTasks.length > 0" class="task-list">
        <view v-for="task in recentTasks" :key="task.id" class="task-item">
          <view class="task-main">
            <view class="task-header">
              <text class="task-emoji">{{ task.task.emoji }}</text>
              <text class="task-type">{{ task.task.type }}</text>
              <text class="task-status" :class="task.status">
                {{ task.status === 'completed' ? '✅' : '🙅‍♀️' }}
              </text>
            </view>

            <text class="task-content">{{ task.task.content }}</text>

            <text class="task-time">{{ formatTime(task.timestamp) }}</text>
          </view>
        </view>
      </view>

      <view v-else class="empty-tasks">
        <text class="empty-emoji">📊</text>
        <text class="empty-text">还没有任务记录</text>
        <text class="empty-subtext">快去别问，点一下开始你的行动之旅吧！</text>
      </view>
    </view>

    <!-- 行动建议 -->
    <view class="action-suggestions glass rounded">
      <text class="section-title">行动建议</text>

      <view class="suggestion-list">
        <view class="suggestion-item">
          <text class="suggestion-emoji">💡</text>
          <text class="suggestion-text">{{ currentSuggestion }}</text>
        </view>
      </view>
    </view>

    <!-- 数据管理 -->
    <view class="data-management glass rounded">
      <text class="section-title">数据管理</text>

      <view class="management-buttons">
        <button class="management-btn export-btn" @click="exportData">
          <text class="btn-emoji">📤</text>
          <text class="btn-text">导出数据</text>
        </button>

        <button class="management-btn clear-btn" @click="clearData">
          <text class="btn-emoji">🗑️</text>
          <text class="btn-text">清空数据</text>
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useTaskStore } from '@/stores/taskStore'
import { formatTime, getActionSuggestion } from '@/utils/index'

const taskStore = useTaskStore()

// 计算属性
const stats = computed(() => taskStore.stats)
const completionRate = computed(() => taskStore.completionRate)
const weekTasks = computed(() => taskStore.getWeekTasks())
const weekCompleted = computed(() =>
  weekTasks.value.filter(task => task.status === 'completed').length
)
const weekRate = computed(() => {
  if (weekTasks.value.length === 0) return 0
  return Math.round((weekCompleted.value / weekTasks.value.length) * 100)
})

const monthTasks = computed(() => taskStore.getMonthTasks())
const monthCompleted = computed(() =>
  monthTasks.value.filter(task => task.status === 'completed').length
)
const monthRate = computed(() => {
  if (monthTasks.value.length === 0) return 0
  return Math.round((monthCompleted.value / monthTasks.value.length) * 100)
})

const recentTasks = computed(() => {
  return taskStore.taskHistory
    .slice(-5)
    .reverse()
})

const categoryStats = computed(() => taskStore.getCategoryStats())

const currentSuggestion = computed(() => {
  return getActionSuggestion(completionRate.value)
})

// 导出数据
const exportData = () => {
  const data = {
    stats: taskStore.stats,
    history: taskStore.taskHistory,
    exportTime: new Date().toISOString()
  }

  const dataStr = JSON.stringify(data, null, 2)

  // 在 H5 环境下可以下载文件
  if (process.env.NODE_ENV === 'development') {
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `blind-task-data-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  uni.showToast({
    title: '数据导出功能开发中',
    icon: 'none',
    duration: 2000
  })
}

// 清空数据
const clearData = () => {
  uni.showModal({
    title: '确认清空',
    content: '这将清空所有任务记录和统计数据，此操作不可恢复。确定要继续吗？',
    success: (res) => {
      if (res.confirm) {
        taskStore.clearAllData()
        uni.showToast({
          title: '数据已清空',
          icon: 'success',
          duration: 2000
        })
      }
    }
  })
}

onMounted(() => {
  console.log('统计页面加载完成')
})
</script>

<style lang="scss" scoped>
.stats-page {
  min-height: 100vh;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.overall-stats {
  padding: 25px;
}

.stats-title {
  display: block;
  font-size: 20px;
  font-weight: bold;
  color: white;
  text-align: center;
  margin-bottom: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.stat-card {
  text-align: center;
  padding: 15px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}

.stat-number {
  display: block;
  font-size: 24px;
  font-weight: bold;
  color: white;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.streak-stats {
  padding: 25px;
  text-align: center;
}

.section-title {
  display: block;
  font-size: 18px;
  font-weight: bold;
  color: white;
  margin-bottom: 20px;
}

.streak-content {
  display: flex;
  align-items: baseline;
  justify-content: center;
  margin-bottom: 10px;
}

.streak-number {
  font-size: 48px;
  font-weight: bold;
  color: #ff6b6b;
  margin-right: 8px;
}

.streak-label {
  font-size: 20px;
  color: white;
}

.streak-desc {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.week-stats,
.month-stats {
  padding: 25px;
}

.week-data,
.month-data {
  display: flex;
  justify-content: space-between;
}

.week-item,
.month-item {
  text-align: center;
  flex: 1;
}

.week-label,
.month-label {
  display: block;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 5px;
}

.week-number,
.month-number {
  display: block;
  font-size: 20px;
  font-weight: bold;
  color: white;
}

.category-stats {
  padding: 25px;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

.category-info {
  display: flex;
  align-items: center;
}

.category-emoji {
  font-size: 20px;
  margin-right: 10px;
}

.category-name {
  font-size: 14px;
  color: white;
}

.category-numbers {
  text-align: right;
}

.category-count {
  display: block;
  font-size: 16px;
  font-weight: bold;
  color: white;
}

.category-percent {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  margin-right: 4px;
}

.category-rate {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.5);
}

.recent-tasks {
  padding: 25px;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.task-item {
  padding: 15px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

.task-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.task-emoji {
  font-size: 16px;
  margin-right: 8px;
}

.task-type {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  flex: 1;
}

.task-status {
  font-size: 16px;
}

.task-content {
  display: block;
  font-size: 14px;
  color: white;
  line-height: 1.4;
  margin-bottom: 8px;
}

.task-time {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.empty-tasks {
  text-align: center;
  padding: 40px 20px;
}

.empty-emoji {
  display: block;
  font-size: 48px;
  margin-bottom: 15px;
}

.empty-text {
  display: block;
  font-size: 16px;
  color: white;
  margin-bottom: 8px;
}

.empty-subtext {
  display: block;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

.action-suggestions {
  padding: 25px;
}

.suggestion-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.suggestion-item {
  display: flex;
  align-items: flex-start;
  padding: 15px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

.suggestion-emoji {
  font-size: 20px;
  margin-right: 12px;
  margin-top: 2px;
}

.suggestion-text {
  font-size: 14px;
  color: white;
  line-height: 1.5;
  flex: 1;
}

.data-management {
  padding: 25px;
}

.management-buttons {
  display: flex;
  gap: 15px;
}

.management-btn {
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

.export-btn {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.clear-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.management-btn:active {
  transform: scale(0.95);
}

.btn-emoji {
  margin-right: 8px;
}
</style>