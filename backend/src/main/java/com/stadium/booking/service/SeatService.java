package com.stadium.booking.service;

import com.stadium.booking.dto.response.SeatResponse;
import com.stadium.booking.entity.Seat;
import com.stadium.booking.exception.ApiException;
import com.stadium.booking.repository.EventRepository;
import com.stadium.booking.repository.SeatRepository;
import com.stadium.booking.repository.StadiumRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SeatService {

    private final SeatRepository seatRepository;
    private final StadiumRepository stadiumRepository;
    private final EventRepository eventRepository;

    @Transactional(readOnly = true)
    public List<SeatResponse> getSeatsForEvent(Long eventId) {
        var event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ApiException("Event not found", HttpStatus.NOT_FOUND));
        Long stadiumId = event.getStadium().getId();

        List<Long> bookedIds = seatRepository.findBookedSeats(stadiumId, eventId)
                .stream().map(Seat::getId).toList();

        return seatRepository.findByStadiumId(stadiumId).stream()
                .map(seat -> toResponse(seat, !bookedIds.contains(seat.getId())))
                .toList();
    }

    private SeatResponse toResponse(Seat seat, boolean available) {
        return SeatResponse.builder()
                .id(seat.getId())
                .seatNumber(seat.getSeatNumber())
                .rowLabel(seat.getRowLabel())
                .section(seat.getSection())
                .rowIndex(seat.getRowIndex())
                .colIndex(seat.getColIndex())
                .categoryName(seat.getCategory().getName())
                .price(seat.getCategory().getPrice())
                .colorCode(seat.getCategory().getColorCode())
                .available(available)
                .build();
    }
}
