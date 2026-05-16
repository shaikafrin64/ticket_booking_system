package com.stadium.booking.service;

import com.stadium.booking.dto.request.CreateBookingRequest;
import com.stadium.booking.dto.response.BookingResponse;
import com.stadium.booking.entity.Booking;
import com.stadium.booking.entity.Event;
import com.stadium.booking.entity.Seat;
import com.stadium.booking.entity.User;
import com.stadium.booking.enums.BookingStatus;
import com.stadium.booking.enums.EventStatus;
import com.stadium.booking.exception.ApiException;
import com.stadium.booking.repository.BookingRepository;
import com.stadium.booking.repository.EventRepository;
import com.stadium.booking.repository.SeatRepository;
import com.stadium.booking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private static final int CANCELLATION_CUTOFF_HOURS = 8;

    private final BookingRepository bookingRepository;
    private final EventRepository eventRepository;
    private final SeatRepository seatRepository;
    private final UserRepository userRepository;

    @Transactional
    public BookingResponse createBooking(CreateBookingRequest req, String userEmail) {
        User user = getUser(userEmail);
        Event event = getEvent(req.getEventId());
        Seat seat = getSeat(req.getSeatId());

        if (event.getStatus() != EventStatus.UPCOMING && event.getStatus() != EventStatus.LIVE) {
            throw new ApiException("Bookings are not available for this event", HttpStatus.BAD_REQUEST);
        }

        bookingRepository.findActiveBooking(event.getId(), seat.getId()).ifPresent(b -> {
            throw new ApiException("Seat is already booked", HttpStatus.CONFLICT);
        });

        Booking booking = Booking.builder()
                .user(user)
                .event(event)
                .seat(seat)
                .amountPaid(seat.getCategory().getPrice())
                .status(BookingStatus.CONFIRMED)
                .build();

        return toResponse(bookingRepository.save(booking));
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getMyBookings(String userEmail) {
        User user = getUser(userEmail);
        return bookingRepository.findByUserIdOrderByBookedAtDesc(user.getId()).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public BookingResponse getBookingById(Long bookingId, String userEmail) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ApiException("Booking not found", HttpStatus.NOT_FOUND));
        if (!booking.getUser().getEmail().equals(userEmail)) {
            throw new ApiException("Access denied", HttpStatus.FORBIDDEN);
        }
        return toResponse(booking);
    }

    @Transactional
    public BookingResponse cancelBooking(Long bookingId, String userEmail) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ApiException("Booking not found", HttpStatus.NOT_FOUND));

        if (!booking.getUser().getEmail().equals(userEmail)) {
            throw new ApiException("Access denied", HttpStatus.FORBIDDEN);
        }
        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new ApiException("Booking is not in a cancellable state", HttpStatus.BAD_REQUEST);
        }

        LocalDateTime cutoff = booking.getEvent().getStartTime().minusHours(CANCELLATION_CUTOFF_HOURS);
        if (LocalDateTime.now().isAfter(cutoff)) {
            throw new ApiException(
                "Cancellation not allowed within " + CANCELLATION_CUTOFF_HOURS + " hours of the event",
                HttpStatus.BAD_REQUEST
            );
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancelledAt(LocalDateTime.now());
        return toResponse(bookingRepository.save(booking));
    }

    private boolean isCancellable(Booking booking) {
        if (booking.getStatus() != BookingStatus.CONFIRMED) return false;
        LocalDateTime cutoff = booking.getEvent().getStartTime().minusHours(CANCELLATION_CUTOFF_HOURS);
        return LocalDateTime.now().isBefore(cutoff);
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));
    }

    private Event getEvent(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new ApiException("Event not found", HttpStatus.NOT_FOUND));
    }

    private Seat getSeat(Long id) {
        return seatRepository.findById(id)
                .orElseThrow(() -> new ApiException("Seat not found", HttpStatus.NOT_FOUND));
    }

    private BookingResponse toResponse(Booking b) {
        return BookingResponse.builder()
                .id(b.getId())
                .bookingReference(b.getBookingReference())
                .eventId(b.getEvent().getId())
                .eventName(b.getEvent().getName())
                .eventType(b.getEvent().getEventType())
                .teamA(b.getEvent().getTeamA())
                .teamB(b.getEvent().getTeamB())
                .eventStartTime(b.getEvent().getStartTime())
                .stadiumName(b.getEvent().getStadium().getName())
                .seatNumber(b.getSeat().getSeatNumber())
                .section(b.getSeat().getSection())
                .rowLabel(b.getSeat().getRowLabel())
                .categoryName(b.getSeat().getCategory().getName())
                .amountPaid(b.getAmountPaid())
                .status(b.getStatus())
                .bookedAt(b.getBookedAt())
                .cancelledAt(b.getCancelledAt())
                .cancellable(isCancellable(b))
                .build();
    }
}
