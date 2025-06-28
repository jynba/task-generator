<template>
  <view class="test-page">
    <view class="container glass rounded">
      <text class="title">任务生成测试</text>

      <!-- 任务筛选区 -->
      <view class="filter-section">
        <view class="filter-item">
          分类：
          <checkbox-group @change="onTagsChange">
            <label v-for="tag in tagOptions" :key="tag">
              <checkbox :value="tag" :checked="selectedTags.includes(tag)" />{{ tag }}
            </label>
          </checkbox-group>
        </view>
        <button class="action-btn" @click="clearFilters">重置筛选</button>
      </view>

      <!-- 筛选结果 -->
      <view class="filter-result-section">
        <text class="section-title">筛选结果（{{ filteredTasks.length }}）</text>
        <view v-if="filteredTasks.length > 0">
          <view v-for="task in filteredTasks" :key="task.id" class="task-card">
            <view class="task-header">
              <text class="task-emoji">{{ task.emoji }}</text>
              <text class="task-type">{{ task.type }}</text>
            </view>
            <text class="task-content">{{ task.content }}</text>
            <view class="task-tags">
              <text v-for="tag in task.tags" :key="tag" class="task-tag">#{{ tag }}</text>
            </view>
          </view>
        </view>
        <view v-else class="empty-history">
          <text class="empty-text">无符合条件的任务</text>
        </view>
      </view>

      <!-- 当前任务 -->
      <view v-if="currentTask" class="task-section">
        <text class="section-title">当前任务</text>
        <view class="task-card">
          <view class="task-header">
            <text class="task-emoji">{{ currentTask.emoji }}</text>
            <text class="task-type">{{ currentTask.type }}</text>
          </view>
          <text class="task-content">{{ currentTask.content }}</text>
          <!-- 反馈预览 -->
          <view class="feedback-preview">
            <text class="feedback-title">完成反馈：</text>
            <text class="feedback-text">{{ currentFeedback.completed }}</text>
          </view>

          <view class="feedback-preview">
            <text class="feedback-title">跳过反馈：</text>
            <text class="feedback-text">{{ currentFeedback.skipped }}</text>
          </view>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="action-buttons">
        <button class="action-btn generate-btn" @click="generateTask">
          <text class="btn-emoji">🎲</text>
          <text class="btn-text">生成任务</text>
        </button>

        <button v-if="currentTask" class="action-btn complete-btn" @click="completeTask">
          <text class="btn-emoji">✅</text>
          <text class="btn-text">完成任务</text>
        </button>

        <button v-if="currentTask" class="action-btn skip-btn" @click="skipTask">
          <text class="btn-emoji">🙅‍♀️</text>
          <text class="btn-text">跳过任务</text>
        </button>
      </view>

      <!-- 统计信息 -->
      <view class="stats-section">
        <text class="section-title">统计信息</text>
        <view class="stats-grid">
          <view class="stat-item">
            <text class="stat-number">{{ stats.totalTasks }}</text>
            <text class="stat-label">总任务数</text>
          </view>
          <view class="stat-item">
            <text class="stat-number">{{ stats.completedTasks }}</text>
            <text class="stat-label">已完成</text>
          </view>
          <view class="stat-item">
            <text class="stat-number">{{ stats.skippedTasks }}</text>
            <text class="stat-label">已跳过</text>
          </view>
          <view class="stat-item">
            <text class="stat-number">{{ completionRate }}%</text>
            <text class="stat-label">完成率</text>
          </view>
        </view>
      </view>

      <!-- 最近记录 -->
      <view class="history-section">
        <text class="section-title">最近记录</text>
        <view v-if="recentHistory.length > 0" class="history-list">
          <view v-for="record in recentHistory" :key="record.id" class="history-item">
            <view class="history-header">
              <text class="history-emoji">{{ record.task.emoji }}</text>
              <text class="history-status" :class="record.status">
                {{ record.status === 'completed' ? '✅ 已完成' : '🙅‍♀️ 已跳过' }}
              </text>
            </view>
            <text class="history-content">{{ record.task.content }}</text>
            <br />
            <text class="history-feedback">{{ record.feedback }}</text>
            <br />
            <text class="history-time">{{ formatTime(record.timestamp) }}</text>
          </view>
        </view>
        <view v-else class="empty-history">
          <text class="empty-text">暂无任务记录</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useTaskStore } from '@/stores/taskStore'
import { formatTime } from '@/utils/index'

const taskStore = useTaskStore()

// 响应式数据
const currentTask = ref(null)
const currentFeedback = ref({
  completed: '',
  skipped: ''
})

// 计算属性
const stats = computed(() => taskStore.stats)
const completionRate = computed(() => taskStore.completionRate)
const recentHistory = computed(() => {
  return taskStore.taskHistory.slice(-5).reverse()
})

// 筛选相关数据
const tagOptions = [
  '自律', '放松', '创造', '情感', '自然', '专注', '趣味', '感恩'
]
const selectedTags = ref([])
const onTagsChange = e => {
  selectedTags.value = e.detail.value
}
const clearFilters = () => {
  selectedTags.value = []
}
const filteredTasks = computed(() => {
  return taskStore.filterTasks({
    tags: selectedTags.value
  })
})

// 生成任务
const generateTask = () => {
  const result = taskStore.generateRandomTask()
  currentTask.value = result.task
  currentFeedback.value = result.feedback

  uni.showToast({
    title: '任务已生成',
    icon: 'success',
    duration: 1500
  })
}

// 完成任务
const completeTask = () => {
  const record = taskStore.completeTask()
  currentTask.value = null
  currentFeedback.value = { completed: '', skipped: '' }

  uni.showToast({
    title: '任务完成！',
    icon: 'success',
    duration: 2000
  })
}

// 跳过任务
const skipTask = () => {
  const record = taskStore.skipTask()
  currentTask.value = null
  currentFeedback.value = { completed: '', skipped: '' }

  uni.showToast({
    title: '已跳过任务',
    icon: 'none',
    duration: 2000
  })
}
</script>

<style lang="scss" scoped>
.test-page {
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

.task-section {
  margin-bottom: 30px;
}

.task-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
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
  margin-bottom: 20px;
}

.feedback-preview {
  margin-bottom: 15px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.feedback-title {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 5px;
}

.feedback-text {
  font-size: 14px;
  color: white;
  line-height: 1.4;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 30px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 15px;
  border-radius: 12px;
  border: none;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.3s ease;
}

.generate-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.complete-btn {
  background: rgba(76, 175, 80, 0.3);
  color: white;
}

.skip-btn {
  background: rgba(255, 152, 0, 0.3);
  color: white;
}

.btn-emoji {
  font-size: 18px;
  margin-right: 8px;
}

.stats-section {
  margin-bottom: 30px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
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
  color: white;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.history-section {
  margin-bottom: 20px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.history-item {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 15px;
}

.history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.history-emoji {
  font-size: 20px;
}

.history-status {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 6px;

  &.completed {
    background: rgba(76, 175, 80, 0.3);
    color: #4caf50;
  }

  &.skipped {
    background: rgba(255, 152, 0, 0.3);
    color: #ff9800;
  }
}

.history-content {
  font-size: 14px;
  color: white;
  line-height: 1.4;
  margin-bottom: 8px;
}

.history-feedback {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.3;
  margin-bottom: 5px;
}

.history-time {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
}

.empty-history {
  text-align: center;
  padding: 30px;
}

.empty-text {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

.filter-section {
  margin-bottom: 30px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 20px 15px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.filter-item {
  font-size: 15px;
  color: #fff;
  margin-bottom: 8px;
}

.filter-result-section {
  margin-bottom: 30px;
}

.task-tags {
  margin-top: 8px;
}

.task-tag {
  display: inline-block;
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  font-size: 12px;
  border-radius: 6px;
  padding: 2px 8px;
  margin-right: 6px;
  margin-bottom: 2px;
}

.task-difficulty {
  font-size: 13px;
  color: #ffd700;
  margin-left: 8px;
}
</style>