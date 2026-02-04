package com.CuidadorApp.backend.Controller;


import com.CuidadorApp.backend.Model.Paciente;
import com.CuidadorApp.backend.Repository.PacienteRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/pacientes")
public class PacienteController {

    private final PacienteRepository pacienteRepository;

    public PacienteController(PacienteRepository pacienteRepository) {
        this.pacienteRepository = pacienteRepository;
    }

    @GetMapping
    public List<Paciente> getAll() {
        return pacienteRepository.findAll();
    }

    @PostMapping
    public Paciente create(@RequestBody Paciente paciente) {
        return pacienteRepository.save(paciente);
    }
}
