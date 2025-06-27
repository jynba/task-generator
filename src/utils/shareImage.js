// 分享图片生成工具
export class ShareImageGenerator {
  constructor() {
    this.canvas = null
    this.ctx = null
    this.width = 375
    this.height = 800
  }

  // 初始化画布
  initCanvas() {
    return new Promise((resolve) => {
      // 创建离屏画布
      this.canvas = uni.createOffscreenCanvas({
        type: '2d',
        width: this.width,
        height: this.height
      })
      this.ctx = this.canvas.getContext('2d')
      resolve()
    })
  }

  // 绘制渐变背景
  drawBackground() {
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height)
    gradient.addColorStop(0, '#667eea')
    gradient.addColorStop(1, '#764ba2')

    this.ctx.fillStyle = gradient
    this.ctx.fillRect(0, 0, this.width, this.height)
  }

  // 绘制毛玻璃效果
  drawGlassEffect(x, y, width, height) {
    this.ctx.save()
    this.ctx.globalAlpha = 0.1
    this.ctx.fillStyle = '#ffffff'
    this.ctx.shadowColor = 'rgba(255, 255, 255, 0.3)'
    this.ctx.shadowBlur = 20
    this.ctx.fillRect(x, y, width, height)
    this.ctx.restore()
  }

  // 绘制文本
  drawText(text, x, y, options = {}) {
    const {
      fontSize = 32,
      color = '#ffffff',
      fontWeight = 'normal',
      textAlign = 'center',
      maxWidth = this.width - 100
    } = options

    this.ctx.save()
    this.ctx.font = `${fontWeight} ${fontSize}px sans-serif`
    this.ctx.fillStyle = color
    this.ctx.textAlign = textAlign
    this.ctx.textBaseline = 'middle'

    // 文本换行处理
    const words = text.split('')
    let line = ''
    let lineHeight = fontSize * 1.2
    let currentY = y

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i]
      const metrics = this.ctx.measureText(testLine)

      if (metrics.width > maxWidth && line !== '') {
        this.ctx.fillText(line, x, currentY)
        line = words[i]
        currentY += lineHeight
      } else {
        line = testLine
      }
    }

    this.ctx.fillText(line, x, currentY)
    this.ctx.restore()

    return currentY + lineHeight
  }

  // 绘制任务卡片
  drawTaskCard(task, y) {
    const cardWidth = this.width - 80
    const cardHeight = 200
    const cardX = 40
    const cardY = y

    // 绘制卡片背景
    this.drawGlassEffect(cardX, cardY, cardWidth, cardHeight)

    // 绘制任务类型
    const typeY = cardY + 30
    this.drawText(task.type, this.width / 2, typeY, {
      fontSize: 28,
      fontWeight: 'bold'
    })

    // 绘制任务内容
    const contentY = typeY + 60
    this.drawText(task.content, this.width / 2, contentY, {
      fontSize: 24,
      maxWidth: cardWidth - 40
    })

    return cardY + cardHeight + 30
  }

  // 绘制统计信息
  drawStats(stats, y) {
    const statsWidth = this.width - 80
    const statsHeight = 120
    const statsX = 40
    const statsY = y

    // 绘制统计背景
    this.drawGlassEffect(statsX, statsY, statsWidth, statsHeight)

    // 绘制统计标题
    this.drawText('我的行动力报告', this.width / 2, statsY + 25, {
      fontSize: 24,
      fontWeight: 'bold'
    })

    // 绘制统计数据
    const statItems = [
      { label: '总任务', value: stats.totalTasks },
      { label: '已完成', value: stats.completedTasks },
      { label: '完成率', value: `${stats.completionRate}%` }
    ]

    const itemWidth = statsWidth / 3
    statItems.forEach((item, index) => {
      const itemX = statsX + itemWidth * index + itemWidth / 2
      const itemY = statsY + 60

      // 绘制数值
      this.drawText(item.value.toString(), itemX, itemY, {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#4facfe'
      })

      // 绘制标签
      this.drawText(item.label, itemX, itemY + 30, {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)'
      })
    })

    return statsY + statsHeight + 30
  }

  // 绘制底部信息
  drawFooter(y) {
    // 绘制应用名称
    this.drawText('盲打任务生成器', this.width / 2, y, {
      fontSize: 20,
      color: 'rgba(255, 255, 255, 0.8)'
    })

    // 绘制时间
    const now = new Date()
    const timeStr = `${now.getFullYear()}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getDate().toString().padStart(2, '0')}`
    this.drawText(timeStr, this.width / 2, y + 30, {
      fontSize: 16,
      color: 'rgba(255, 255, 255, 0.6)'
    })

    // 绘制二维码提示
    this.drawText('扫码体验', this.width / 2, y + 60, {
      fontSize: 16,
      color: 'rgba(255, 255, 255, 0.6)'
    })
  }

  // 生成分享图片
  async generateShareImage(taskRecord, stats, width, height) {
    if (width) this.width = width
    if (height) this.height = height
    try {
      await this.initCanvas()

      // 绘制背景
      this.drawBackground()

      let currentY = 80

      // 绘制标题
      this.drawText('🎉 任务完成！', this.width / 2, currentY, {
        fontSize: 36,
        fontWeight: 'bold'
      })

      currentY += 80

      // 绘制任务卡片
      currentY = this.drawTaskCard(taskRecord.task, currentY)

      // 绘制反馈
      this.drawText(taskRecord.feedback, this.width / 2, currentY, {
        fontSize: 20,
        color: 'rgba(255, 255, 255, 0.9)',
        maxWidth: this.width - 100
      })

      currentY += 80

      // 绘制统计信息
      currentY = this.drawStats(stats, currentY)

      // 绘制底部信息
      this.drawFooter(currentY)

      // 导出图片
      return await this.exportImage()
    } catch (error) {
      console.error('生成分享图片失败:', error)
      throw error
    }
  }

  // 导出图片
  exportImage() {
    return new Promise((resolve, reject) => {
      uni.canvasToTempFilePath({
        canvas: this.canvas,
        success: (res) => {
          resolve(res.tempFilePath)
        },
        fail: (error) => {
          reject(error)
        }
      })
    })
  }
}

// 分享工具类
export class ShareManager {
  constructor() {
    this.imageGenerator = new ShareImageGenerator()
  }

  // 生成并分享任务完成图片
  async shareTaskCompletion(taskRecord, stats) {
    try {
      // 显示加载提示
      uni.showLoading({
        title: '生成分享图片...'
      })

      // 生成分享图片
      const imagePath = await this.imageGenerator.generateShareImage(taskRecord, stats)

      // 隐藏加载提示
      uni.hideLoading()

      // 显示分享选项
      this.showShareOptions(imagePath, taskRecord)

    } catch (error) {
      uni.hideLoading()
      uni.showToast({
        title: '生成分享图片失败',
        icon: 'none',
        duration: 2000
      })
      console.error('分享失败:', error)
    }
  }

  // 显示分享选项
  showShareOptions(imagePath, taskRecord) {
    uni.showActionSheet({
      itemList: ['分享到微信', '保存到相册', '复制链接'],
      success: (res) => {
        switch (res.tapIndex) {
          case 0:
            this.shareToWeChat(imagePath, taskRecord)
            break
          case 1:
            this.saveToAlbum(imagePath)
            break
          case 2:
            this.copyShareLink(taskRecord)
            break
        }
      }
    })
  }

  // 分享到微信
  shareToWeChat(imagePath, taskRecord) {
    const shareText = `我在盲打任务生成器中完成了：${taskRecord.task.content}`

    uni.share({
      provider: 'weixin',
      scene: 'WXSceneSession',
      type: 0,
      href: 'https://your-app-url.com',
      title: '盲打任务生成器',
      summary: shareText,
      imageUrl: imagePath,
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

  // 保存到相册
  saveToAlbum(imagePath) {
    uni.saveImageToPhotosAlbum({
      filePath: imagePath,
      success: () => {
        uni.showToast({
          title: '已保存到相册',
          icon: 'success',
          duration: 2000
        })
      },
      fail: () => {
        uni.showToast({
          title: '保存失败',
          icon: 'none',
          duration: 2000
        })
      }
    })
  }

  // 复制分享链接
  copyShareLink(taskRecord) {
    const shareText = `我在盲打任务生成器中完成了：${taskRecord.task.content}`

    uni.setClipboardData({
      data: shareText,
      success: () => {
        uni.showToast({
          title: '已复制到剪贴板',
          icon: 'success',
          duration: 2000
        })
      }
    })
  }

  // 生成分享链接
  generateShareLink(taskRecord) {
    const baseUrl = 'https://your-app-url.com'
    const params = new URLSearchParams({
      taskId: taskRecord.taskId,
      status: taskRecord.status,
      timestamp: taskRecord.timestamp
    })

    return `${baseUrl}/share?${params.toString()}`
  }
}

// 导出实例
export const shareManager = new ShareManager() 