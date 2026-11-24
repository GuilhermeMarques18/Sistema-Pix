package com.gc.sistem_pix.pix.event;

import com.gc.sistem_pix.pix.entity.PixTransaction;
import com.gc.sistem_pix.user.entity.UserModel;

public record PixTransferCompletedEvent(UserModel sender, UserModel recipient, PixTransaction transaction) {
    public PixTransferCompletedEvent {
        sender = snapshot(sender);
        recipient = snapshot(recipient);
    }

    private static UserModel snapshot(UserModel user) {
        return UserModel.builder().name(user.getName()).email(user.getEmail()).notificationType(user.getNotificationType()).build();
    }
}
