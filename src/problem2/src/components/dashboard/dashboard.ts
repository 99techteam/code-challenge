import { UserData, WalletData } from '../../types/index.js'
import { fetchUserData, fetchWalletData } from '../../apis/index.js'

export class Dashboard {
  private walletData: WalletData | null = null
  private userData: UserData | null = null

  constructor() {
    this.showLoadingStates()
    this.initializeDashboard()
  }

  private async initializeDashboard(): Promise<void> {
    try {
      // Add minimum loading delay for better UX (prevent flash)
      const minLoadingTime = new Promise(resolve => setTimeout(resolve, 800))

      // Load user and wallet data in parallel
      const [userData, walletData] = await Promise.all([
        fetchUserData(),
        fetchWalletData(),
        minLoadingTime,
      ])

      this.userData = userData
      this.walletData = walletData

      this.hideLoadingStates()
      this.updateUI()
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      this.hideLoadingStates()
      this.showError()
    }
  }

  private updateUI(): void {
    if (!this.userData || !this.walletData) {
      return
    }

    // Update user information
    this.updateUserInfo()

    // Update portfolio value
    this.updatePortfolioValue()

    // Update performance metrics
    this.updatePerformanceMetrics()
  }

  private updateUserInfo(): void {
    if (!this.userData) return

    const avatarImg = document.getElementById('user-avatar') as HTMLImageElement
    const nameEl = document.getElementById('user-name') as HTMLElement
    const emailEl = document.getElementById('user-email') as HTMLElement

    avatarImg.src = this.userData.avatar
    avatarImg.alt = `${this.userData.firstName} ${this.userData.lastName}`
    nameEl.textContent = `${this.userData.firstName} ${this.userData.lastName}`
    emailEl.textContent = this.userData.email
  }

  private updatePortfolioValue(): void {
    if (!this.walletData) return

    const totalValueEl = document.getElementById('total-value') as HTMLElement
    const formattedValue = this.formatCurrency(this.walletData.totalBalance.usd)

    totalValueEl.textContent = formattedValue
  }

  private updatePerformanceMetrics(): void {
    if (!this.walletData) return

    // Update 24h change
    const dayChangeEl = document.getElementById('day-change') as HTMLElement
    const dayChangeValue = this.walletData.performance.dayChange.usd
    const dayChangePercent = this.walletData.performance.dayChange.percent

    dayChangeEl.textContent = `${this.formatCurrency(dayChangeValue)} (${dayChangePercent.toFixed(2)}%)`
    dayChangeEl.className = `performance-value ${dayChangeValue >= 0 ? 'positive' : 'negative'}`

    // Update total P&L
    const totalPnlEl = document.getElementById('total-pnl') as HTMLElement
    const totalPnl = this.walletData.performance.totalProfitLoss
    const totalPnlPercent = this.walletData.performance.totalProfitLossPercent

    totalPnlEl.textContent = `${this.formatCurrency(totalPnl)} (${(totalPnlPercent * 100).toFixed(2)}%)`
    totalPnlEl.className = `performance-value ${totalPnl >= 0 ? 'positive' : 'negative'}`
  }

  private formatCurrency(value: number): string {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    return formatter.format(value)
  }

  private showLoadingStates(): void {
    const nameEl = document.getElementById('user-name') as HTMLElement
    const totalValueEl = document.getElementById('total-value') as HTMLElement
    const dayChangeEl = document.getElementById('day-change') as HTMLElement
    const totalPnlEl = document.getElementById('total-pnl') as HTMLElement

    // Add loading classes
    nameEl.classList.add('loading')
    totalValueEl.classList.add('loading')
    dayChangeEl.classList.add('loading')
    totalPnlEl.classList.add('loading')

    // Set loading text
    nameEl.textContent = 'Loading...'
    totalValueEl.textContent = '$0.00'
    dayChangeEl.textContent = '$0.00 (0.00%)'
    totalPnlEl.textContent = '$0.00 (0.00%)'
  }

  private hideLoadingStates(): void {
    const nameEl = document.getElementById('user-name') as HTMLElement
    const totalValueEl = document.getElementById('total-value') as HTMLElement
    const dayChangeEl = document.getElementById('day-change') as HTMLElement
    const totalPnlEl = document.getElementById('total-pnl') as HTMLElement

    // Remove loading classes
    nameEl.classList.remove('loading')
    totalValueEl.classList.remove('loading')
    dayChangeEl.classList.remove('loading')
    totalPnlEl.classList.remove('loading')
  }

  private showError(): void {
    const nameEl = document.getElementById('user-name') as HTMLElement
    const totalValueEl = document.getElementById('total-value') as HTMLElement
    const dayChangeEl = document.getElementById('day-change') as HTMLElement
    const totalPnlEl = document.getElementById('total-pnl') as HTMLElement

    nameEl.textContent = 'Error loading data'
    totalValueEl.textContent = 'Error'
    dayChangeEl.textContent = 'Error'
    totalPnlEl.textContent = 'Error'
  }

  // Public methods for accessing data
  public getUserData(): UserData | null {
    return this.userData
  }

  public getWalletData(): WalletData | null {
    return this.walletData
  }
}
