package com.gc.sistem_pix.activity.controller;

import com.gc.sistem_pix.activity.dto.ActivityEventResponse;
import com.gc.sistem_pix.activity.enums.ActivityCategory;
import com.gc.sistem_pix.activity.service.UserActivityEventService;
import com.gc.sistem_pix.user.entity.UserModel;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/audit")
@RequiredArgsConstructor
public class UserActivityController {

    private final UserActivityEventService service;

    @GetMapping("/logins")
    public Page<ActivityEventResponse> logins(
            @RequestParam(required = false) String eventType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate until,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal UserModel user) {
        return service.findHistory(user.getId(), ActivityCategory.LOGIN, eventType, from, until, page, size);
    }

    @GetMapping("/activities")
    public Page<ActivityEventResponse> activities(
            @RequestParam(required = false) String eventType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate until,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal UserModel user) {
        return service.findHistory(user.getId(), ActivityCategory.ACTIVITY, eventType, from, until, page, size);
    }
}
