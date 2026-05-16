package com.stadium.booking.controller;

import com.stadium.booking.dto.response.SeatResponse;
import com.stadium.booking.service.SeatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/seats")
@RequiredArgsConstructor
public class SeatController {

    private final SeatService seatService;

    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<SeatResponse>> getSeatsForEvent(@PathVariable Long eventId) {
        return ResponseEntity.ok(seatService.getSeatsForEvent(eventId));
    }
}
