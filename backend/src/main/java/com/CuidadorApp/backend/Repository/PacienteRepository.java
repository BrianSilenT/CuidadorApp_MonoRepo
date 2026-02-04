package com.CuidadorApp.backend.Repository;

import com.CuidadorApp.backend.Model.Paciente;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PacienteRepository extends JpaRepository<Paciente, Long> {
}
