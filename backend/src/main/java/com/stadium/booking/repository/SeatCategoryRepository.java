package com.stadium.booking.repository;

import com.stadium.booking.entity.SeatCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SeatCategoryRepository extends JpaRepository<SeatCategory, Long> {
    Optional<SeatCategory> findByName(String name);
}
