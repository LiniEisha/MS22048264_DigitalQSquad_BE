// File: ticketing.js

class TicketBookingSystem {
    constructor() {
        this.flights = {};
        this.bookings = {};
    }

    addFlight(flightId, totalSeats) {
        this.flights[flightId] = {
            totalSeats,
            availableSeats: totalSeats,
            bookings: [],
        };
    }

    bookTicket(flightId, userId, ticketClass) {
        const flight = this.flights[flightId];

        if (!flight) {
            throw new Error('Flight does not exist');
        }

        if (flight.availableSeats <= 0) {
            throw new Error('No available seats');
        }

        const booking = {
            flightId,
            userId,
            ticketClass,
            status: 'booked',
        };

        flight.bookings.push(booking);
        flight.availableSeats--;

        if (!this.bookings[userId]) {
            this.bookings[userId] = [];
        }

        this.bookings[userId].push(booking);

        return booking;
    }

    cancelBooking(flightId, userId) {
        const flight = this.flights[flightId];
        const userBookings = this.bookings[userId];

        if (!flight || !userBookings) {
            throw new Error('Booking does not exist');
        }

        const bookingIndex = userBookings.findIndex(
            (b) => b.flightId === flightId && b.status === 'booked'
        );

        if (bookingIndex === -1) {
            throw new Error('Booking not found');
        }

        userBookings[bookingIndex].status = 'cancelled';
        flight.availableSeats++;

        return userBookings[bookingIndex];
    }

    checkAvailableSeats(flightId) {
        const flight = this.flights[flightId];

        if (!flight) {
            throw new Error('Flight does not exist');
        }

        return flight.availableSeats;
    }

    getBookingDetails(userId) {
        return this.bookings[userId] || [];
    }

    upgradeTicket(flightId, userId, newClass) {
        const flight = this.flights[flightId];
        const userBookings = this.bookings[userId];

        if (!flight || !userBookings) {
            throw new Error('Booking does not exist');
        }

        const booking = userBookings.find(
            (b) => b.flightId === flightId && b.status === 'booked'
        );

        if (!booking) {
            throw new Error('Booking not found');
        }

        booking.ticketClass = newClass;

        return booking;
    }
}

export { TicketBookingSystem };
