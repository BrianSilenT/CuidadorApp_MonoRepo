package com.CuidadorApp.backend.Model;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Entity
public class Guardia {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private LocalDate fecha;
    private int horasTrabajadas;

    @ManyToOne
    private Cuidador cuidador;

    @ManyToOne
    private Paciente paciente;

    private String informe;
}
