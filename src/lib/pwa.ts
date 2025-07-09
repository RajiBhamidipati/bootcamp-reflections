'use client'

export interface PWAInstallPrompt {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export class PWAManager {
  private deferredPrompt: PWAInstallPrompt | null = null
  private isInstallable = false
  private isInstalled = false

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeEventListeners()
      this.checkInstallationStatus()
    }
  }

  private initializeEventListeners() {
    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault()
      this.deferredPrompt = event as any
      this.isInstallable = true
      this.dispatchInstallableEvent()
    })

    // Listen for the appinstalled event
    window.addEventListener('appinstalled', () => {
      this.isInstalled = true
      this.deferredPrompt = null
      this.isInstallable = false
      this.dispatchInstalledEvent()
    })

    // Listen for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        this.dispatchUpdateEvent()
      })
    }
  }

  private checkInstallationStatus() {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.isInstalled = true
    }

    // Check if running in PWA mode
    if ((window.navigator as any).standalone === true) {
      this.isInstalled = true
    }
  }

  private dispatchInstallableEvent() {
    window.dispatchEvent(new CustomEvent('pwa-installable'))
  }

  private dispatchInstalledEvent() {
    window.dispatchEvent(new CustomEvent('pwa-installed'))
  }

  private dispatchUpdateEvent() {
    window.dispatchEvent(new CustomEvent('pwa-update'))
  }

  async promptInstall(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false
    }

    try {
      await this.deferredPrompt.prompt()
      const choiceResult = await this.deferredPrompt.userChoice
      
      if (choiceResult.outcome === 'accepted') {
        this.deferredPrompt = null
        return true
      }
      
      return false
    } catch (error) {
      console.error('Error prompting install:', error)
      return false
    }
  }

  getInstallationStatus() {
    return {
      isInstallable: this.isInstallable,
      isInstalled: this.isInstalled,
      canPrompt: !!this.deferredPrompt
    }
  }

  async registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      return false
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.dispatchUpdateEvent()
            }
          })
        }
      })

      return true
    } catch (error) {
      console.error('Service Worker registration failed:', error)
      return false
    }
  }

  async checkForUpdates() {
    if (!('serviceWorker' in navigator)) {
      return false
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration) {
        await registration.update()
        return true
      }
      return false
    } catch (error) {
      console.error('Error checking for updates:', error)
      return false
    }
  }

  async skipWaiting() {
    if (!('serviceWorker' in navigator)) {
      return false
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration && registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' })
        return true
      }
      return false
    } catch (error) {
      console.error('Error skipping waiting:', error)
      return false
    }
  }
}

export const pwaManager = new PWAManager()

// Hook for React components
export function usePWA() {
  const [installationStatus, setInstallationStatus] = useState(() => 
    pwaManager.getInstallationStatus()
  )
  const [updateAvailable, setUpdateAvailable] = useState(false)

  useEffect(() => {
    const handleInstallable = () => {
      setInstallationStatus(pwaManager.getInstallationStatus())
    }

    const handleInstalled = () => {
      setInstallationStatus(pwaManager.getInstallationStatus())
    }

    const handleUpdate = () => {
      setUpdateAvailable(true)
    }

    window.addEventListener('pwa-installable', handleInstallable)
    window.addEventListener('pwa-installed', handleInstalled)
    window.addEventListener('pwa-update', handleUpdate)

    // Register service worker
    pwaManager.registerServiceWorker()

    return () => {
      window.removeEventListener('pwa-installable', handleInstallable)
      window.removeEventListener('pwa-installed', handleInstalled)
      window.removeEventListener('pwa-update', handleUpdate)
    }
  }, [])

  const promptInstall = async () => {
    const success = await pwaManager.promptInstall()
    if (success) {
      setInstallationStatus(pwaManager.getInstallationStatus())
    }
    return success
  }

  const updateApp = async () => {
    await pwaManager.skipWaiting()
    setUpdateAvailable(false)
    window.location.reload()
  }

  return {
    ...installationStatus,
    updateAvailable,
    promptInstall,
    updateApp,
    checkForUpdates: pwaManager.checkForUpdates
  }
}

// Notification utilities
export class NotificationManager {
  static async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied'
    }

    if (Notification.permission === 'granted') {
      return 'granted'
    }

    if (Notification.permission === 'denied') {
      return 'denied'
    }

    return await Notification.requestPermission()
  }

  static async scheduleNotification(
    title: string,
    options: NotificationOptions & { delay?: number } = {}
  ): Promise<boolean> {
    const permission = await this.requestPermission()
    
    if (permission !== 'granted') {
      return false
    }

    const { delay = 0, ...notificationOptions } = options

    if (delay > 0) {
      setTimeout(() => {
        new Notification(title, notificationOptions)
      }, delay)
    } else {
      new Notification(title, notificationOptions)
    }

    return true
  }

  static async scheduleReflectionReminder(time: string): Promise<boolean> {
    // Calculate delay until reminder time
    const now = new Date()
    const [hours, minutes] = time.split(':').map(Number)
    const reminderTime = new Date(now)
    reminderTime.setHours(hours, minutes, 0, 0)

    if (reminderTime <= now) {
      reminderTime.setDate(reminderTime.getDate() + 1)
    }

    const delay = reminderTime.getTime() - now.getTime()

    return await this.scheduleNotification(
      'Time for your daily reflection!',
      {
        body: 'Take a moment to reflect on your day and track your progress.',
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        tag: 'reflection-reminder',
        delay
      }
    )
  }
}

// Offline storage utilities
export class OfflineStorage {
  private static readonly STORAGE_KEY = 'bootcamp-reflections-offline'
  private static readonly VERSION = '1.0.0'

  static saveData(key: string, data: any) {
    try {
      const storageData = this.getStorageData()
      storageData[key] = {
        data,
        timestamp: Date.now(),
        version: this.VERSION
      }
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(storageData))
      return true
    } catch (error) {
      console.error('Error saving offline data:', error)
      return false
    }
  }

  static loadData(key: string) {
    try {
      const storageData = this.getStorageData()
      return storageData[key]?.data || null
    } catch (error) {
      console.error('Error loading offline data:', error)
      return null
    }
  }

  static clearData(key?: string) {
    try {
      if (key) {
        const storageData = this.getStorageData()
        delete storageData[key]
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(storageData))
      } else {
        localStorage.removeItem(this.STORAGE_KEY)
      }
      return true
    } catch (error) {
      console.error('Error clearing offline data:', error)
      return false
    }
  }

  private static getStorageData() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY)
      return data ? JSON.parse(data) : {}
    } catch {
      return {}
    }
  }

  static getStorageInfo() {
    const storageData = this.getStorageData()
    return {
      keys: Object.keys(storageData),
      size: JSON.stringify(storageData).length,
      version: this.VERSION
    }
  }
}

// Add necessary imports for React hooks
import { useEffect, useState } from 'react'