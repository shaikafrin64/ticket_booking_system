package com.stadium.booking.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateBookingRequest {
    @NotNull
    private Long eventId;
    @NotNull
    private Long seatId;
}
