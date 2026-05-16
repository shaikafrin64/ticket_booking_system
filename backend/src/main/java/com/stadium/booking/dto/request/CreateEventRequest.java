package com.stadium.booking.dto.request;

import com.stadium.booking.enums.EventType;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CreateEventRequest {
    @NotBlank
    private String name;
    private String description;
    @NotNull
    private EventType eventType;
    @NotBlank
    private String teamA;
    private String teamB;
    private String teamALogo;
    private String teamBLogo;
    @NotNull @Future
    private LocalDateTime startTime;
    private LocalDateTime endTime;
}
