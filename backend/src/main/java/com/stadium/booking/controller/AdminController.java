package com.stadium.booking.controller;

import com.stadium.booking.dto.request.CancelEventRequest;
import com.stadium.booking.dto.request.CreateEventRequest;
import com.stadium.booking.dto.response.BookingResponse;
import com.stadium.booking.dto.response.EventResponse;
import com.stadium.booking.enums.EventStatus;
import com.stadium.booking.service.BookingService;
import com.stadium.booking.service.EventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final EventService eventService;
    private final BookingService bookingService;

    @PostMapping("/events")
    public ResponseEntity<EventResponse> createEvent(
            @Valid @RequestBody CreateEventRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(eventService.createEvent(req, userDetails.getUsername()));
    }

    @GetMapping("/events")
    public ResponseEntity<List<EventResponse>> getAllEventsAdmin() {
        return ResponseEntity.ok(eventService.getAllEvents());
    }

    @PutMapping("/events/{id}/cancel")
    public ResponseEntity<EventResponse> cancelEvent(
            @PathVariable Long id,
            @Valid @RequestBody CancelEventRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(eventService.cancelEvent(id, req, userDetails.getUsername()));
    }

    @PutMapping("/events/{id}/status")
    public ResponseEntity<EventResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam EventStatus status) {
        return ResponseEntity.ok(eventService.updateEventStatus(id, status));
    }
}
