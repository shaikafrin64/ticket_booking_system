package com.stadium.booking.config;

import com.stadium.booking.entity.*;
import com.stadium.booking.enums.EventStatus;
import com.stadium.booking.enums.EventType;
import com.stadium.booking.enums.Role;
import com.stadium.booking.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final StadiumRepository stadiumRepository;
    private final SeatCategoryRepository seatCategoryRepository;
    private final SeatRepository seatRepository;
    private final EventRepository eventRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) return;

        // Admin user
        User admin = userRepository.save(User.builder()
                .name("Admin")
                .email("admin@stadium.com")
                .password(passwordEncoder.encode("admin123"))
                .phone("9999999999")
                .role(Role.ADMIN)
                .build());

        // Sample user
        userRepository.save(User.builder()
                .name("Rahul Kumar")
                .email("user@stadium.com")
                .password(passwordEncoder.encode("user123"))
                .phone("8888888888")
                .role(Role.USER)
                .build());

        // Stadium
        Stadium stadium = stadiumRepository.save(Stadium.builder()
                .name("National Cricket Stadium")
                .location("MG Road, New Delhi")
                .city("New Delhi")
                .description("India's premier cricket stadium with world-class facilities")
                .totalCapacity(500)
                .build());

        // Seat categories
        SeatCategory platinum = seatCategoryRepository.save(SeatCategory.builder()
                .name("Platinum").price(new BigDecimal("2500")).colorCode("#E5C100")
                .description("Best view, VIP lounge access").build());
        SeatCategory gold = seatCategoryRepository.save(SeatCategory.builder()
                .name("Gold").price(new BigDecimal("1500")).colorCode("#FFD700")
                .description("Excellent view, covered stand").build());
        SeatCategory silver = seatCategoryRepository.save(SeatCategory.builder()
                .name("Silver").price(new BigDecimal("800")).colorCode("#C0C0C0")
                .description("Good view, covered stand").build());
        SeatCategory general = seatCategoryRepository.save(SeatCategory.builder()
                .name("General").price(new BigDecimal("300")).colorCode("#4CAF50")
                .description("Open stand").build());

        // Generate seats: sections with rows and columns
        List<Seat> seats = new ArrayList<>();
        // Platinum: 2 rows x 10 cols = 20 seats
        seats.addAll(generateSeats(stadium, platinum, "Platinum Stand", "P", 1, 2, 10));
        // Gold: 3 rows x 20 cols = 60 seats
        seats.addAll(generateSeats(stadium, gold, "Gold Stand", "G", 1, 3, 20));
        // Silver: 5 rows x 30 cols = 150 seats
        seats.addAll(generateSeats(stadium, silver, "Silver Stand", "S", 1, 5, 30));
        // General: 9 rows x 30 cols = 270 seats
        seats.addAll(generateSeats(stadium, general, "General Stand", "N", 1, 9, 30));

        seatRepository.saveAll(seats);

        // Sample events
        eventRepository.save(Event.builder()
                .name("India vs Australia - 1st T20I")
                .description("Opening T20I match of the series. India vs Australia at National Cricket Stadium.")
                .eventType(EventType.T20_MATCH)
                .teamA("India").teamALogo("IND")
                .teamB("Australia").teamBLogo("AUS")
                .startTime(LocalDateTime.now().plusDays(3).withHour(19).withMinute(30))
                .endTime(LocalDateTime.now().plusDays(3).withHour(23).withMinute(30))
                .status(EventStatus.UPCOMING)
                .stadium(stadium).createdBy(admin).build());

        eventRepository.save(Event.builder()
                .name("India vs England - ODI Series")
                .description("1st ODI of the series. A thrilling 50-over contest.")
                .eventType(EventType.ODI_MATCH)
                .teamA("India").teamALogo("IND")
                .teamB("England").teamBLogo("ENG")
                .startTime(LocalDateTime.now().plusDays(10).withHour(14).withMinute(0))
                .endTime(LocalDateTime.now().plusDays(10).withHour(22).withMinute(0))
                .status(EventStatus.UPCOMING)
                .stadium(stadium).createdBy(admin).build());

        eventRepository.save(Event.builder()
                .name("IPL 2025 - Delhi vs Mumbai")
                .description("High-voltage IPL clash between Delhi and Mumbai at home ground.")
                .eventType(EventType.IPL_MATCH)
                .teamA("Delhi Capitals").teamALogo("DC")
                .teamB("Mumbai Indians").teamBLogo("MI")
                .startTime(LocalDateTime.now().plusDays(7).withHour(20).withMinute(0))
                .endTime(LocalDateTime.now().plusDays(7).withHour(23).withMinute(30))
                .status(EventStatus.UPCOMING)
                .stadium(stadium).createdBy(admin).build());

        eventRepository.save(Event.builder()
                .name("India vs South Africa - Test Match Day 1")
                .description("First Test match of the series. India's home fortress.")
                .eventType(EventType.TEST_MATCH)
                .teamA("India").teamALogo("IND")
                .teamB("South Africa").teamBLogo("SA")
                .startTime(LocalDateTime.now().plusDays(15).withHour(9).withMinute(30))
                .endTime(LocalDateTime.now().plusDays(15).withHour(18).withMinute(0))
                .status(EventStatus.UPCOMING)
                .stadium(stadium).createdBy(admin).build());

        log.info("Data initialized. Admin: admin@stadium.com / admin123 | User: user@stadium.com / user123");
    }

    private List<Seat> generateSeats(Stadium stadium, SeatCategory category,
                                      String section, String prefix, int startRow, int rows, int cols) {
        List<Seat> seats = new ArrayList<>();
        for (int r = startRow; r < startRow + rows; r++) {
            String rowLabel = String.valueOf((char) ('A' + r - 1));
            for (int c = 1; c <= cols; c++) {
                seats.add(Seat.builder()
                        .seatNumber(prefix + r + "-" + c)
                        .rowLabel(rowLabel)
                        .section(section)
                        .rowIndex(r - startRow)
                        .colIndex(c - 1)
                        .category(category)
                        .stadium(stadium)
                        .build());
            }
        }
        return seats;
    }
}
