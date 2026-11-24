package com.gc.sistem_pix.pix.dto;

import java.util.UUID;
import com.gc.sistem_pix.pix.enums.PixKeyType;

public record PixRecipientResponse(PixKeyType tipo, String chave, UUID contaDestinoId, String nome, String documentoMascarado) {}
