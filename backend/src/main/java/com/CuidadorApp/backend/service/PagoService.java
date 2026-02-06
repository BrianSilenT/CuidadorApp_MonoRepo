package com.CuidadorApp.backend.service;

import com.CuidadorApp.backend.Model.Pago;
import com.CuidadorApp.backend.Repository.PagoRepository;
import com.mercadopago.MercadoPagoConfig;
import com.mercadopago.client.preference.*;
import com.mercadopago.resources.preference.Preference;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class PagoService {

    @Autowired
    private PagoRepository pagoRepository;

    // TODO: Reemplaza esto con tu Access Token real de Mercado Pago
    private String accessToken = "TU_ACCESS_TOKEN_DE_PRUEBA";

    public Pago crearIntentoDePago(Pago pago) {
        pago.setFechaPago(LocalDate.now());
        pago.setConfirmado(false);
        pago.setEstado("PENDIENTE");

        // Guardamos en DB primero
        Pago pagoGuardado = pagoRepository.save(pago);

        // Generamos el link de Mercado Pago
        String urlPago = procesarConPasarela(pagoGuardado);
        pagoGuardado.setExternalReference(urlPago); // Guardamos el link generado

        return pagoRepository.save(pagoGuardado);
    }

    public String procesarConPasarela(Pago pago) {
        try {
            MercadoPagoConfig.setAccessToken(accessToken);

            PreferenceItemRequest itemRequest = PreferenceItemRequest.builder()
                    .title("Servicio de Cuidador - App")
                    .quantity(1)
                    .unitPrice(new BigDecimal(pago.getMonto()))
                    .build();

            List<PreferenceItemRequest> items = new ArrayList<>();
            items.add(itemRequest);

            PreferenceRequest preferenceRequest = PreferenceRequest.builder()
                    .items(items)
                    .backUrls(PreferenceBackUrlsRequest.builder()
                            .success("http://localhost:8080/success") // Tu página de éxito
                            .pending("http://localhost:8080/pending")
                            .failure("http://localhost:8080/failure")
                            .build())
                    .build();

            PreferenceClient client = new PreferenceClient();
            Preference preference = client.create(preferenceRequest);

            return preference.getInitPoint(); // Este es el URL real para pagar

        } catch (Exception e) {
            return "Error al generar pago: " + e.getMessage();
        }
    }

    public List<Pago> obtenerTodosLosPagos() {
        return pagoRepository.findAll();
    }
}