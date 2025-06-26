// 应用配置
export const APP_CONFIG = {
  name: '盲打任务生成器',
  version: '1.0.0',
  description: '一个帮助你摆脱决策疲劳，通过随机任务促进行动的极简应用',

  // 存储键名
  storageKeys: {
    taskHistory: 'taskHistory',
    taskStats: 'taskStats',
    userSettings: 'userSettings',
    achievements: 'achievements'
  },

  // 任务类型配置
  taskCategories: {
    'self-discipline': {
      name: '极简自律',
      emoji: '✨',
      description: '培养自律习惯的简单任务'
    },
    'relaxation': {
      name: '松弛体验',
      emoji: '🧘',
      description: '帮助放松身心的任务'
    },
    'philosophy': {
      name: '怪异哲学',
      emoji: '🎨',
      description: '引发深度思考的任务'
    },
    'weird': {
      name: '离谱执行',
      emoji: '🐸',
      description: '有趣而奇怪的任务'
    },
    'resistance': {
      name: '抗拒行为',
      emoji: '📵',
      description: '挑战舒适区的任务'
    },
    'practical': {
      name: '实用微动作',
      emoji: '🎯',
      description: '实用的日常小动作'
    },
    'absurd': {
      name: '空洞荒谬',
      emoji: '📍',
      description: '看似荒谬但有意义的任务'
    },
    'nature': {
      name: '自然连接',
      emoji: '🌱',
      description: '与自然建立连接的任务'
    },
    'playful': {
      name: '角色扮演',
      emoji: '🎭',
      description: '充满游戏性的任务'
    },
    'creative': {
      name: '文字游戏',
      emoji: '📝',
      description: '激发创造力的任务'
    },
    'sensory': {
      name: '声音探索',
      emoji: '🎵',
      description: '探索感官体验的任务'
    },
    'ritual': {
      name: '重复仪式',
      emoji: '🔄',
      description: '建立仪式感的任务'
    },
    'reflection': {
      name: '深度思考',
      emoji: '🤔',
      description: '促进自我反思的任务'
    },
    'physical': {
      name: '即兴表演',
      emoji: '🎪',
      description: '身体动作相关的任务'
    },
    'emotional': {
      name: '内心对话',
      emoji: '💭',
      description: '关注情感体验的任务'
    }
  },

  // 成就系统配置
  achievements: [
    {
      id: 'first_task',
      condition: (stats) => stats.totalTasks === 1,
      title: '初次尝试',
      description: '完成第一个任务',
      emoji: '🎉'
    },
    {
      id: 'ten_tasks',
      condition: (stats) => stats.totalTasks === 10,
      title: '行动力提升',
      description: '已完成10个任务',
      emoji: '🎯'
    },
    {
      id: 'fifty_tasks',
      condition: (stats) => stats.totalTasks === 50,
      title: '行动大师',
      description: '已完成50个任务',
      emoji: '🚀'
    },
    {
      id: 'three_day_streak',
      condition: (stats) => stats.streakDays === 3,
      title: '习惯形成',
      description: '连续完成3天',
      emoji: '🔥'
    },
    {
      id: 'week_streak',
      condition: (stats) => stats.streakDays === 7,
      title: '一周坚持',
      description: '连续完成一周',
      emoji: '🌟'
    },
    {
      id: 'high_completion',
      condition: (stats) => stats.completionRate >= 80,
      title: '高效执行',
      description: '完成率超过80%',
      emoji: '💎'
    },
    {
      id: 'perfect_day',
      condition: (stats) => {
        const todayTasks = stats.getTodayTasks?.() || []
        return todayTasks.length >= 3 && todayTasks.every(task => task.status === 'completed')
      },
      title: '完美一天',
      description: '一天内完成3个以上任务且全部完成',
      emoji: '👑'
    }
  ],

  // 分享配置
  share: {
    title: '盲打任务生成器',
    summary: '一个帮助你摆脱决策疲劳，通过随机任务促进行动的极简应用',
    href: 'https://your-app-url.com',
    imageUrl: 'https://your-app-url.com/share-image.png'
  },

  // 主题配置
  theme: {
    primary: '#667eea',
    secondary: '#764ba2',
    success: '#4facfe',
    warning: '#ff9a9e',
    error: '#ff6b6b',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    glass: {
      background: 'rgba(255, 255, 255, 0.1)',
      backdrop: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    }
  },

  // 动画配置
  animation: {
    duration: {
      fast: 200,
      normal: 300,
      slow: 500
    },
    easing: {
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out'
    }
  },

  // 时间配置
  time: {
    // 任务超时时间（秒）
    taskTimeout: 300,
    // 自动保存间隔（毫秒）
    autoSaveInterval: 5000,
    // 震动反馈时长（毫秒）
    vibrationDuration: 100
  },

  // 功能开关
  features: {
    // 是否启用震动反馈
    vibration: true,
    // 是否启用声音反馈
    sound: false,
    // 是否启用自动保存
    autoSave: true,
    // 是否启用分享功能
    share: true,
    // 是否启用数据导出
    export: true,
    // 是否启用成就系统
    achievements: true
  }
}

// 默认用户设置
export const DEFAULT_SETTINGS = {
  // 通知设置
  notifications: {
    enabled: true,
    dailyReminder: true,
    reminderTime: '20:00'
  },

  // 任务设置
  task: {
    // 是否显示任务类型
    showCategory: true,
    // 是否自动开始计时
    autoStartTimer: true,
    // 是否显示执行提示
    showExecutionTip: true
  },

  // 统计设置
  stats: {
    // 是否显示详细统计
    showDetailedStats: true,
    // 是否显示任务历史
    showTaskHistory: true,
    // 是否显示类型分布
    showCategoryDistribution: true
  },

  // 界面设置
  ui: {
    // 主题模式：light, dark, auto
    theme: 'auto',
    // 字体大小：small, normal, large
    fontSize: 'normal',
    // 是否启用动画
    animations: true
  }
}

// 错误消息
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '网络连接失败，请检查网络设置',
  STORAGE_ERROR: '数据存储失败，请重试',
  TASK_GENERATION_ERROR: '任务生成失败，请重试',
  SHARE_ERROR: '分享失败，请重试',
  UNKNOWN_ERROR: '发生未知错误，请重试'
}

// 成功消息
export const SUCCESS_MESSAGES = {
  TASK_COMPLETED: '任务完成！',
  TASK_SKIPPED: '任务已跳过',
  DATA_SAVED: '数据已保存',
  DATA_EXPORTED: '数据导出成功',
  SHARE_SUCCESS: '分享成功',
  SETTINGS_UPDATED: '设置已更新'
}

// 提示消息
export const TIP_MESSAGES = {
  FIRST_USE: '欢迎使用盲打任务生成器！点击按钮开始你的第一个任务。',
  NO_TASKS: '还没有任务记录，快去盲打一下开始你的行动之旅吧！',
  LOW_COMPLETION_RATE: '完成率较低，试着从简单的任务开始，慢慢建立信心。',
  HIGH_COMPLETION_RATE: '完成率很高！继续保持这种状态，你正在创造属于自己的节奏。',
  STREAK_BREAK: '连续完成天数中断了，没关系，重新开始就好。',
  NEW_ACHIEVEMENT: '恭喜获得新成就！'
} 