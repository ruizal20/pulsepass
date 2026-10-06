package com.pulsepass.pulsepass.service;

import com.pulsepass.pulsepass.dto.response.TicketResponseDto;
import com.pulsepass.pulsepass.dto.request.PurchaseTicketRequest;
import java.util.List;

public interface TicketService {
    TicketResponseDto purchase(PurchaseTicketRequest request);
    TicketResponseDto findByCode(String ticketCode);
    List<TicketResponseDto> findByUserEmail(String email);
    List<TicketResponseDto> findPaidTicketsByEvent(String eventCode);
    TicketResponseDto cancel(String ticketCode);
    TicketResponseDto markAsUsed(String ticketCode);
}
