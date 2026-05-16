package com.stadium.booking.repository;

import com.stadium.booking.entity.Stadium;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StadiumRepository extends JpaRepository<Stadium, Long> {
}
