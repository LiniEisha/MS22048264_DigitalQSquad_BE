// File: notification.js
class NotificationSystem {
    sendNotification(type, recipient, message) {
        switch (type) {
            case 'email':
                return this.sendEmail(recipient, message);
            case 'sms':
                return this.sendSms(recipient, message);
            case 'push':
                return this.sendPushNotification(recipient, message);
            case 'inApp':
                return this.sendInAppNotification(recipient, message);
            case 'web':
                return this.sendWebNotification(recipient, message);
            case 'slack':
                return this.sendSlackNotification(recipient, message);
            case 'teams':
                return this.sendTeamsNotification(recipient, message);
            default:
                throw new Error('Invalid notification type');
        }
    }

    sendEmail(recipient, message) {
        return `Email sent to ${recipient}: ${message}`;
    }

    sendSms(recipient, message) {
        return `SMS sent to ${recipient}: ${message}`;
    }

    sendPushNotification(recipient, message) {
        return `Push notification sent to ${recipient}: ${message}`;
    }

    sendInAppNotification(recipient, message) {
        return `In-app notification sent to ${recipient}: ${message}`;
    }

    sendWebNotification(recipient, message) {
        return `Web notification sent to ${recipient}: ${message}`;
    }

    sendSlackNotification(recipient, message) {
        return `Slack message sent to ${recipient}: ${message}`;
    }

    sendTeamsNotification(recipient, message) {
        return `Teams message sent to ${recipient}: ${message}`;
    }
}

export { NotificationSystem };
