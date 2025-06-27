import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { storage } from '@/utils/index'
import tasksData from '@/static/tasks.json'

export const useTaskStore = defineStore('task', () => {
  // 任务池数据 - 从JSON文件加载
  const taskPool = ref(tasksData.tasks || [])

  // 当前任务
  const currentTask = ref(null)

  // 当前任务的反馈
  const currentFeedback = ref({
    completed: '',
    skipped: ''
  })

  // 任务记录
  const taskHistory = ref([])

  // 统计数据
  const stats = ref({
    totalTasks: 0,
    completedTasks: 0,
    skippedTasks: 0,
    completionRate: 0,
    streakDays: 0, // 连续完成天数
    lastCompletedDate: null
  })

  // 计算属性
  const completionRate = computed(() => {
    if (stats.value.totalTasks === 0) return 0
    return Math.round((stats.value.completedTasks / stats.value.totalTasks) * 100)
  })

  // 生成随机任务和反馈
  const generateRandomTask = () => {
    const randomIndex = Math.floor(Math.random() * taskPool.value.length)
    const selectedTask = taskPool.value[randomIndex]

    currentTask.value = { ...selectedTask }
    currentFeedback.value = {
      completed: selectedTask.feedback.completed,
      skipped: selectedTask.feedback.skipped
    }

    return {
      task: currentTask.value,
      feedback: currentFeedback.value
    }
  }

  // 完成任务
  const completeTask = () => {
    if (!currentTask.value) return

    const record = {
      id: Date.now(),
      taskId: currentTask.value.id,
      task: currentTask.value,
      feedback: currentFeedback.value.completed,
      status: 'completed',
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString()
    }

    taskHistory.value.push(record)
    stats.value.totalTasks++
    stats.value.completedTasks++
    stats.value.completionRate = completionRate.value

    // 更新连续完成天数
    updateStreakDays()

    // 保存到本地存储
    saveToStorage()

    return record
  }

  // 跳过任务
  const skipTask = () => {
    if (!currentTask.value) return

    const record = {
      id: Date.now(),
      taskId: currentTask.value.id,
      task: currentTask.value,
      feedback: currentFeedback.value.skipped,
      status: 'skipped',
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString()
    }

    taskHistory.value.push(record)
    stats.value.totalTasks++
    stats.value.skippedTasks++
    stats.value.completionRate = completionRate.value

    // 保存到本地存储
    saveToStorage()

    return record
  }

  // 更新连续完成天数
  const updateStreakDays = () => {
    const today = new Date().toLocaleDateString()
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toLocaleDateString()

    if (stats.value.lastCompletedDate === today) {
      // 今天已经完成过，不重复计算
      return
    }

    if (stats.value.lastCompletedDate === yesterday) {
      // 昨天完成过，连续天数+1
      stats.value.streakDays++
    } else if (stats.value.lastCompletedDate !== today) {
      // 不是连续的天，重置为1
      stats.value.streakDays = 1
    }

    stats.value.lastCompletedDate = today
  }

  // 获取今日任务
  const getTodayTasks = () => {
    const today = new Date().toLocaleDateString()
    return taskHistory.value.filter(record => record.date === today)
  }

  // 获取本周任务
  const getWeekTasks = () => {
    const now = new Date()
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
    const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000)

    return taskHistory.value.filter(record => {
      const recordDate = new Date(record.timestamp)
      return recordDate >= weekStart && recordDate <= weekEnd
    })
  }

  // 获取本月任务
  const getMonthTasks = () => {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    return taskHistory.value.filter(record => {
      const recordDate = new Date(record.timestamp)
      return recordDate >= monthStart && recordDate <= monthEnd
    })
  }

  // 获取任务类型统计
  const getCategoryStats = () => {
    const categoryMap = {}

    taskHistory.value.forEach(record => {
      const category = record.task.category
      if (!categoryMap[category]) {
        categoryMap[category] = {
          name: record.task.type,
          emoji: record.task.emoji,
          count: 0,
          completed: 0,
          skipped: 0
        }
      }
      categoryMap[category].count++
      if (record.status === 'completed') {
        categoryMap[category].completed++
      } else {
        categoryMap[category].skipped++
      }
    })

    const total = taskHistory.value.length
    return Object.values(categoryMap).map(category => ({
      ...category,
      percent: total > 0 ? Math.round((category.count / total) * 100) : 0,
      completionRate: category.count > 0 ? Math.round((category.completed / category.count) * 100) : 0
    })).sort((a, b) => b.count - a.count)
  }

  // 保存到本地存储
  const saveToStorage = () => {
    storage.set('taskHistory', taskHistory.value)
    storage.set('taskStats', stats.value)
  }

  // 从本地存储加载
  const loadFromStorage = () => {
    const history = storage.get('taskHistory', [])
    const savedStats = storage.get('taskStats', null)

    if (history) {
      taskHistory.value = history
    }

    if (savedStats) {
      stats.value = { ...stats.value, ...savedStats }
    }
  }

  // 清空所有数据
  const clearAllData = () => {
    taskHistory.value = []
    stats.value = {
      totalTasks: 0,
      completedTasks: 0,
      skippedTasks: 0,
      completionRate: 0,
      streakDays: 0,
      lastCompletedDate: null
    }
    currentTask.value = null
    currentFeedback.value = {
      completed: '',
      skipped: ''
    }
    storage.clear()
  }

  // 初始化时加载数据
  loadFromStorage()

  return {
    taskPool,
    currentTask,
    currentFeedback,
    taskHistory,
    stats,
    completionRate,
    generateRandomTask,
    completeTask,
    skipTask,
    getTodayTasks,
    getWeekTasks,
    getMonthTasks,
    getCategoryStats,
    saveToStorage,
    loadFromStorage,
    clearAllData
  }
}) 