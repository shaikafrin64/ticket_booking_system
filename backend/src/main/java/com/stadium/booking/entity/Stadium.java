package com.stadium.booking.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "stadiums")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Stadium {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String location;

    private String city;

    private String description;

    private Integer totalCapacity;

    private String imageUrl;

    @OneToMany(mappedBy = "stadium", cascade = CascadeType.ALL)
    private List<Seat> seats;

    @OneToMany(mappedBy = "stadium", cascade = CascadeType.ALL)
    private List<Event> events;
}
