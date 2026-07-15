import { Alert } from '../models/Alert';

export class AlertService {
  /**
   * Generates a mock system alert (for demo purposes)
   */
  static async triggerMockAlert() {
    const alert = new Alert({
      title: 'Database Latency Spike',
      description: 'Query execution times have exceeded 500ms on the Primary cluster.',
      severity: 'High',
      source: 'System'
    });
    await alert.save();
    return alert;
  }

  static async getAlerts() {
    return await Alert.find().sort({ createdAt: -1 });
  }

  static async resolveAlert(alertId: string, userId: string) {
    const alert = await Alert.findById(alertId);
    if (!alert) throw new Error('Alert not found');

    alert.status = 'Resolved';
    alert.resolvedBy = userId as any;
    alert.resolvedAt = new Date();
    await alert.save();
    return alert;
  }
}
