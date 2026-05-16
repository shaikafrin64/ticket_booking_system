package com.stadium.booking.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CancelEventRequest {
    @NotBlank
    private String reason;
}
