package com.CuidadorApp.backend.Model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Entity
public class Pago {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private double monto;
    private LocalDate fechaPago;
    private String metodo; // MercadoPago, Transferencia
    private boolean confirmado;

    @ManyToOne
    private Cuidador cuidador;
}
