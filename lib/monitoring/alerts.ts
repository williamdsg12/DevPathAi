/**
 * Internal System Alerts & Incident Dispatcher — DevPath AI
 */

import { logger } from '@/lib/logger'
import type { SystemAlert } from './types'

export class AlertManager {
  private alerts: SystemAlert[] = []

  public createAlert(
    level: SystemAlert['level'],
    component: SystemAlert['component'],
    message: string,
    details?: Record<string, any>
  ): SystemAlert {
    const alert: SystemAlert = {
      id: `alt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      level,
      component,
      message,
      details,
      resolved: false,
      createdAt: new Date().toISOString(),
    }

    this.alerts.unshift(alert)

    if (level === 'critical') {
      logger.error(`[CRITICAL ALERT] ${component.toUpperCase()}: ${message}`, details)
    } else if (level === 'warning') {
      logger.warn(`[WARNING ALERT] ${component.toUpperCase()}: ${message}`, details)
    } else {
      logger.info(`[INFO ALERT] ${component.toUpperCase()}: ${message}`, details)
    }

    return alert
  }

  public resolveAlert(alertId: string): boolean {
    const target = this.alerts.find((a) => a.id === alertId)
    if (!target) return false

    target.resolved = true
    target.resolvedAt = new Date().toISOString()
    logger.info(`Alert ${alertId} marked as resolved.`)
    return true
  }

  public getActiveAlerts(): SystemAlert[] {
    return this.alerts.filter((a) => !a.resolved)
  }

  public getAllAlerts(): SystemAlert[] {
    return [...this.alerts]
  }
}

export const alertManager = new AlertManager()
