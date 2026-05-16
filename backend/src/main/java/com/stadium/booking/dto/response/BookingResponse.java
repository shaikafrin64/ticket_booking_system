package com.stadium.booking.dto.response;

import com.stadium.booking.enums.BookingStatus;
import com.stadium.booking.enums.EventType;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @Builder
public class BookingResponse {
    private Long id;
    private String bookingReference;
    private Long eventId;
    private String eventName;
    private EventType eventType;
    private String teamA;
    private String teamB;
    private LocalDateTime eventStartTime;
    private String stadiumName;
    private String seatNumber;
    private String section;
    private String rowLabel;
    private String categoryName;
    private BigDecimal amountPaid;
    private BookingStatus status;
    private LocalDateTime bookedAt;
    private LocalDateTime cancelledAt;
    private boolean cancellable;
}
