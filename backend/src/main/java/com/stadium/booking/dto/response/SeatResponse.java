package com.stadium.booking.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data @Builder
public class SeatResponse {
    private Long id;
    private String seatNumber;
    private String rowLabel;
    private String section;
    private Integer rowIndex;
    private Integer colIndex;
    private String categoryName;
    private BigDecimal price;
    private String colorCode;
    private boolean available;
}
