package com.stadium.booking.repository;

import com.stadium.booking.entity.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SeatRepository extends JpaRepository<Seat, Long> {

    List<Seat> findByStadiumId(Long stadiumId);

    long countByStadiumId(Long stadiumId);

    @Query("""
        SELECT s FROM Seat s WHERE s.stadium.id = :stadiumId
        AND s.id NOT IN (
            SELECT b.seat.id FROM Booking b
            WHERE b.event.id = :eventId AND b.status = 'CONFIRMED'
        )
    """)
    List<Seat> findAvailableSeats(@Param("stadiumId") Long stadiumId, @Param("eventId") Long eventId);

    @Query("""
        SELECT s FROM Seat s WHERE s.stadium.id = :stadiumId
        AND s.id IN (
            SELECT b.seat.id FROM Booking b
            WHERE b.event.id = :eventId AND b.status = 'CONFIRMED'
        )
    """)
    List<Seat> findBookedSeats(@Param("stadiumId") Long stadiumId, @Param("eventId") Long eventId);
}
