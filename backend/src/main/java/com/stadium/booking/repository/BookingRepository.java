package com.stadium.booking.repository;

import com.stadium.booking.entity.Booking;
import com.stadium.booking.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserIdOrderByBookedAtDesc(Long userId);

    @Query("SELECT b FROM Booking b WHERE b.event.id = :eventId AND b.seat.id = :seatId AND b.status = 'CONFIRMED'")
    Optional<Booking> findActiveBooking(@Param("eventId") Long eventId, @Param("seatId") Long seatId);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.event.id = :eventId AND b.status = 'CONFIRMED'")
    long countConfirmedBookings(@Param("eventId") Long eventId);

    List<Booking> findByEventIdAndStatus(Long eventId, BookingStatus status);

    Optional<Booking> findByBookingReference(String bookingReference);
}
