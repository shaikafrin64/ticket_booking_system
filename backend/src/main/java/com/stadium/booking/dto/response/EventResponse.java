package com.stadium.booking.dto.response;

import com.stadium.booking.enums.EventStatus;
import com.stadium.booking.enums.EventType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data @Builder
public class EventResponse {
    private Long id;
    private String name;
    private String description;
    private EventType eventType;
    private String teamA;
    private String teamB;
    private String teamALogo;
    private String teamBLogo;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private EventStatus status;
    private String cancellationReason;
    private Long stadiumId;
    private String stadiumName;
    private String stadiumLocation;
    private long bookedSeats;
    private long totalSeats;
    private LocalDateTime createdAt;
}
