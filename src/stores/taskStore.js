import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { storage } from '@/utils/index'

export const useTaskStore = defineStore('task', () => {
  // 任务池数据
  const taskPool = ref([
    {
      id: 1,
      type: '✨ 极简自律',
      content: '去洗个脸，不许看镜子超过10秒',
      emoji: '✨',
      category: 'self-discipline'
    },
    {
      id: 2,
      type: '🧘 松弛体验',
      content: '躺下盯着天花板发呆 3 分钟',
      emoji: '🧘',
      category: 'relaxation'
    },
    {
      id: 3,
      type: '🎨 怪异哲学',
      content: '在纸上写一句"我也不知道我是谁"然后折起来撕掉',
      emoji: '🎨',
      category: 'philosophy'
    },
    {
      id: 4,
      type: '🐸 离谱执行',
      content: '学一声青蛙叫，没人听见也要叫',
      emoji: '🐸',
      category: 'weird'
    },
    {
      id: 5,
      type: '📵 抗拒行为',
      content: '关掉手机 10 分钟，现在就做',
      emoji: '📵',
      category: 'resistance'
    },
    {
      id: 6,
      type: '🎯 实用微动作',
      content: '给你水杯倒满水，然后看它发呆 30 秒',
      emoji: '🎯',
      category: 'practical'
    },
    {
      id: 7,
      type: '📍 空洞荒谬',
      content: '打开窗户，对外面说："我自由啦！"',
      emoji: '📍',
      category: 'absurd'
    },
    {
      id: 8,
      type: '🌱 自然连接',
      content: '去阳台或窗边深呼吸 5 次，感受空气',
      emoji: '🌱',
      category: 'nature'
    },
    {
      id: 9,
      type: '🎭 角色扮演',
      content: '对着镜子做三个不同的表情，然后笑一笑',
      emoji: '🎭',
      category: 'playful'
    },
    {
      id: 10,
      type: '📝 文字游戏',
      content: '在纸上写三个你最喜欢的词，然后划掉一个',
      emoji: '📝',
      category: 'creative'
    },
    {
      id: 11,
      type: '🎵 声音探索',
      content: '用不同的音调说"你好"，直到找到最舒服的',
      emoji: '🎵',
      category: 'sensory'
    },
    {
      id: 12,
      type: '🔄 重复仪式',
      content: '把桌上的东西重新排列一遍，然后恢复原状',
      emoji: '🔄',
      category: 'ritual'
    },
    {
      id: 13,
      type: '🤔 深度思考',
      content: '问自己一个问题："我现在最需要什么？"然后等待答案',
      emoji: '🤔',
      category: 'reflection'
    },
    {
      id: 14,
      type: '🎪 即兴表演',
      content: '站起来转三圈，然后停下来感受眩晕',
      emoji: '🎪',
      category: 'physical'
    },
    {
      id: 15,
      type: '💭 内心对话',
      content: '在心里对今天的自己说一句话，无论是什么',
      emoji: '💭',
      category: 'emotional'
    }
  ])

  // 当前任务
  const currentTask = ref(null)

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

  // 生成随机任务
  const generateRandomTask = () => {
    const randomIndex = Math.floor(Math.random() * taskPool.value.length)
    currentTask.value = { ...taskPool.value[randomIndex] }
    return currentTask.value
  }

  // 完成任务
  const completeTask = () => {
    if (!currentTask.value) return

    const record = {
      id: Date.now(),
      taskId: currentTask.value.id,
      task: currentTask.value,
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
    storage.clear()
  }

  // 初始化时加载数据
  loadFromStorage()

  return {
    taskPool,
    currentTask,
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