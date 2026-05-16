package com.stadium.booking.service;

import com.stadium.booking.dto.request.LoginRequest;
import com.stadium.booking.dto.request.RegisterRequest;
import com.stadium.booking.dto.response.AuthResponse;
import com.stadium.booking.entity.User;
import com.stadium.booking.enums.Role;
import com.stadium.booking.exception.ApiException;
import com.stadium.booking.repository.UserRepository;
import com.stadium.booking.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authManager;

    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new ApiException("Email already registered", HttpStatus.CONFLICT);
        }
        User user = User.builder()
                .name(req.getName())
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .phone(req.getPhone())
                .role(Role.USER)
                .build();
        userRepository.save(user);
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        return buildResponse(user, token);
    }

    public AuthResponse login(LoginRequest req) {
        try {
            authManager.authenticate(new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));
        } catch (BadCredentialsException e) {
            throw new ApiException("Invalid email or password", HttpStatus.UNAUTHORIZED);
        }
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        return buildResponse(user, token);
    }

    private AuthResponse buildResponse(User user, String token) {
        return AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }
}
