package com.gc.sistem_pix.pix.exception;

import com.gc.sistem_pix.account.exception.AccountBlockedException;

/** Lançada somente após persistir o bloqueio e antes de qualquer débito/crédito. */
public class PixLimitExceededException extends AccountBlockedException {
    public PixLimitExceededException(String message) { super(message); }
}
