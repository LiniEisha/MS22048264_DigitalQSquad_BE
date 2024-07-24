// File: ticketing.test.js
import { expect } from 'chai';
import { TicketBookingSystem } from './ticketing.js';

describe('Ticket Booking System', () => {
    let system;

    beforeEach(() => {
        system = new TicketBookingSystem();
        system.addFlight('FL123', 100);
    });

    it('should book a ticket', () => {
        const booking = system.bookTicket('FL123', 'USER1', 'Economy');
        expect(booking.status).to.equal('booked');
    });

    it('should throw error when booking a non-existent flight', () => {
        expect(() => system.bookTicket('FL999', 'USER1', 'Economy')).to.throw(
            'Flight does not exist'
        );
    });

    it('should cancel a booking', () => {
        system.bookTicket('FL123', 'USER1', 'Economy');
        const cancelledBooking = system.cancelBooking('FL123', 'USER1');
        expect(cancelledBooking.status).to.equal('cancelled');
    });

    it('should throw error when cancelling a non-existent booking', () => {
        expect(() => system.cancelBooking('FL123', 'USER999')).to.throw(
            'Booking does not exist'
        );
    });

    it('should check available seats', () => {
        system.bookTicket('FL123', 'USER1', 'Economy');
        const availableSeats = system.checkAvailableSeats('FL123');
        expect(availableSeats).to.equal(99);
    });

    it('should get booking details', () => {
        const booking = system.bookTicket('FL123', 'USER1', 'Economy');
        const details = system.getBookingDetails('USER1');
        expect(details).to.deep.include(booking);
    });

    it('should upgrade a ticket', () => {
        system.bookTicket('FL123', 'USER1', 'Economy');
        const upgradedBooking = system.upgradeTicket('FL123', 'USER1', 'Business');
        expect(upgradedBooking.ticketClass).to.equal('Business');
    });
});
