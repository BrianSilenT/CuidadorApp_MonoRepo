package com.CuidadorApp.backend.Repository;


import com.CuidadorApp.backend.Model.Cuidador;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CuidadorRepository extends JpaRepository<Cuidador, Long> {}
