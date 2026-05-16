package com.stadium.booking.repository;

import com.stadium.booking.entity.Event;
import com.stadium.booking.enums.EventStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByStatusOrderByStartTimeAsc(EventStatus status);

    @Query("SELECT e FROM Event e WHERE e.status IN ('UPCOMING', 'LIVE') ORDER BY e.startTime ASC")
    List<Event> findActiveEvents();

    List<Event> findAllByOrderByStartTimeAsc();
}
