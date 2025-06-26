// 格式化时间
export const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date

  if (diff < 24 * 60 * 60 * 1000) {
    // 今天
    return `今天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  } else if (diff < 2 * 24 * 60 * 60 * 1000) {
    // 昨天
    return `昨天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  } else {
    // 更早
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }
}

// 解析任务时间
export const parseTaskTime = (content) => {
  const timeRegex = /(\d+)\s*(分钟|秒|小时)/
  const match = content.match(timeRegex)

  if (match) {
    const value = parseInt(match[1])
    const unit = match[2]

    switch (unit) {
      case '秒':
        return value
      case '分钟':
        return value * 60
      case '小时':
        return value * 60 * 60
      default:
        return 0
    }
  }

  return 0
}

// 生成随机反馈
export const getRandomFeedback = (status) => {
  const feedbacks = {
    completed: [
      '你正逐渐脱离现代社会的高速列车',
      '这个小小的行动让你离真实的自己更近了一步',
      '有时候最简单的动作反而最有力量',
      '你正在创造属于自己的仪式感',
      '每一个微小的行动都在重塑你的生活',
      '你正在打破常规，创造新的可能性',
      '这种微小的坚持正在改变你的人生轨迹'
    ],
    skipped: [
      '可能你还在压抑真实自我',
      '没关系，下次再试试看',
      '跳过也是一种选择，尊重自己的感受',
      '也许这个任务现在不适合你',
      '保持开放的心态，随时可以重新开始',
      '每个人都有自己的节奏，不要着急',
      '有时候休息也是一种前进'
    ]
  }

  const feedbackList = feedbacks[status] || feedbacks.skipped
  const randomIndex = Math.floor(Math.random() * feedbackList.length)

  return feedbackList[randomIndex]
}

// 获取执行提示
export const getExecutionTip = (category) => {
  const tips = {
    'self-discipline': '记住，简单的事情重复做就是不简单。',
    'relaxation': '放松身心，感受当下的宁静。',
    'philosophy': '思考是行动的一部分，但不要过度思考。',
    'weird': '有时候，做点奇怪的事情反而很有趣。',
    'resistance': '面对抗拒，正是成长的机会。',
    'practical': '实用的行动往往最有价值。',
    'absurd': '荒谬中可能藏着真理。'
  }

  return tips[category] || '专注当下，享受过程。'
}

// 获取行动建议
export const getActionSuggestion = (completionRate) => {
  if (completionRate >= 80) {
    return '你的行动力非常棒！继续保持这种状态，你正在创造属于自己的节奏。'
  } else if (completionRate >= 60) {
    return '你的行动力不错！试着挑战一些更有趣的任务，让生活更有色彩。'
  } else if (completionRate >= 40) {
    return '你的行动力还可以，但还有提升空间。试着从简单的任务开始，慢慢建立信心。'
  } else if (completionRate >= 20) {
    return '你的行动力需要一些鼓励。记住，每一个小行动都是进步，不要给自己太大压力。'
  } else {
    return '你的行动力正在起步阶段。没关系，每个人都有自己的节奏，慢慢来就好。'
  }
}

// 本地存储工具
export const storage = {
  set(key, value) {
    try {
      uni.setStorageSync(key, value)
    } catch (e) {
      console.error('存储数据失败:', e)
    }
  },

  get(key, defaultValue = null) {
    try {
      const value = uni.getStorageSync(key)
      return value || defaultValue
    } catch (e) {
      console.error('读取数据失败:', e)
      return defaultValue
    }
  },

  remove(key) {
    try {
      uni.removeStorageSync(key)
    } catch (e) {
      console.error('删除数据失败:', e)
    }
  },

  clear() {
    try {
      uni.clearStorageSync()
    } catch (e) {
      console.error('清空数据失败:', e)
    }
  }
} 