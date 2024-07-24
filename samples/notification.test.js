// File: notification.test.js
import { expect } from 'chai';
import { NotificationSystem } from './notification.js';

describe('Notification System', () => {
    let system;

    beforeEach(() => {
        system = new NotificationSystem();
    });

    it('should send an email notification', () => {
        const result = system.sendNotification('email', 'user@example.com', 'Hello, Email!');
        expect(result).to.equal('Email sent to user@example.com: Hello, Email!');
    });

    it('should send an SMS notification', () => {
        const result = system.sendNotification('sms', '1234567890', 'Hello, SMS!');
        expect(result).to.equal('SMS sent to 1234567890: Hello, SMS!');
    });

    it('should send a push notification', () => {
        const result = system.sendNotification('push', 'userDevice', 'Hello, Push!');
        expect(result).to.equal('Push notification sent to userDevice: Hello, Push!');
    });

    it('should send an in-app notification', () => {
        const result = system.sendNotification('inApp', 'userApp', 'Hello, In-App!');
        expect(result).to.equal('In-app notification sent to userApp: Hello, In-App!');
    });

    it('should send a web notification', () => {
        const result = system.sendNotification('web', 'userWeb', 'Hello, Web!');
        expect(result).to.equal('Web notification sent to userWeb: Hello, Web!');
    });

    it('should send a Slack notification', () => {
        const result = system.sendNotification('slack', 'userSlack', 'Hello, Slack!');
        expect(result).to.equal('Slack message sent to userSlack: Hello, Slack!');
    });

    it('should send a Teams notification', () => {
        const result = system.sendNotification('teams', 'userTeams', 'Hello, Teams!');
        expect(result).to.equal('Teams message sent to userTeams: Hello, Teams!');
    });

    it('should throw an error for an invalid notification type', () => {
        expect(() => system.sendNotification('invalid', 'user', 'Hello')).to.throw('Invalid notification type');
    });
});
