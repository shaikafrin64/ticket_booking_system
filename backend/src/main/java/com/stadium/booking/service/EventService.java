package com.stadium.booking.service;

import com.stadium.booking.dto.request.CancelEventRequest;
import com.stadium.booking.dto.request.CreateEventRequest;
import com.stadium.booking.dto.response.EventResponse;
import com.stadium.booking.entity.Event;
import com.stadium.booking.entity.Stadium;
import com.stadium.booking.entity.User;
import com.stadium.booking.enums.BookingStatus;
import com.stadium.booking.enums.EventStatus;
import com.stadium.booking.exception.ApiException;
import com.stadium.booking.repository.BookingRepository;
import com.stadium.booking.repository.EventRepository;
import com.stadium.booking.repository.SeatRepository;
import com.stadium.booking.repository.StadiumRepository;
import com.stadium.booking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;
    private final StadiumRepository stadiumRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final SeatRepository seatRepository;

    @Transactional(readOnly = true)
    public List<EventResponse> getAllEvents() {
        return eventRepository.findAllByOrderByStartTimeAsc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<EventResponse> getActiveEvents() {
        return eventRepository.findActiveEvents().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public EventResponse getEventById(Long id) {
        return toResponse(findEvent(id));
    }

    @Transactional
    public EventResponse createEvent(CreateEventRequest req, String adminEmail) {
        Stadium stadium = stadiumRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new ApiException("Stadium not configured", HttpStatus.NOT_FOUND));
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ApiException("Admin not found", HttpStatus.NOT_FOUND));

        Event event = Event.builder()
                .name(req.getName())
                .description(req.getDescription())
                .eventType(req.getEventType())
                .teamA(req.getTeamA())
                .teamB(req.getTeamB())
                .teamALogo(req.getTeamALogo())
                .teamBLogo(req.getTeamBLogo())
                .startTime(req.getStartTime())
                .endTime(req.getEndTime())
                .status(EventStatus.UPCOMING)
                .stadium(stadium)
                .createdBy(admin)
                .build();

        return toResponse(eventRepository.save(event));
    }

    @Transactional
    public EventResponse cancelEvent(Long eventId, CancelEventRequest req, String adminEmail) {
        Event event = findEvent(eventId);
        if (event.getStatus() == EventStatus.CANCELLED) {
            throw new ApiException("Event is already cancelled", HttpStatus.BAD_REQUEST);
        }
        if (event.getStatus() == EventStatus.COMPLETED) {
            throw new ApiException("Cannot cancel a completed event", HttpStatus.BAD_REQUEST);
        }

        event.setStatus(EventStatus.CANCELLED);
        event.setCancellationReason(req.getReason());
        event.setCancelledAt(LocalDateTime.now());
        eventRepository.save(event);

        // Auto-cancel all confirmed bookings for this event
        bookingRepository.findByEventIdAndStatus(eventId, BookingStatus.CONFIRMED)
                .forEach(booking -> {
                    booking.setStatus(BookingStatus.CANCELLED);
                    booking.setCancelledAt(LocalDateTime.now());
                    booking.setCancellationReason("Event cancelled: " + req.getReason());
                    bookingRepository.save(booking);
                });

        return toResponse(event);
    }

    @Transactional
    public EventResponse updateEventStatus(Long eventId, EventStatus newStatus) {
        Event event = findEvent(eventId);
        event.setStatus(newStatus);
        return toResponse(eventRepository.save(event));
    }

    private Event findEvent(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new ApiException("Event not found", HttpStatus.NOT_FOUND));
    }

    private EventResponse toResponse(Event event) {
        long booked = bookingRepository.countConfirmedBookings(event.getId());
        long total = seatRepository.countByStadiumId(event.getStadium().getId());

        return EventResponse.builder()
                .id(event.getId())
                .name(event.getName())
                .description(event.getDescription())
                .eventType(event.getEventType())
                .teamA(event.getTeamA())
                .teamB(event.getTeamB())
                .teamALogo(event.getTeamALogo())
                .teamBLogo(event.getTeamBLogo())
                .startTime(event.getStartTime())
                .endTime(event.getEndTime())
                .status(event.getStatus())
                .cancellationReason(event.getCancellationReason())
                .stadiumId(event.getStadium().getId())
                .stadiumName(event.getStadium().getName())
                .stadiumLocation(event.getStadium().getLocation())
                .bookedSeats(booked)
                .totalSeats(total)
                .createdAt(event.getCreatedAt())
                .build();
    }
}
