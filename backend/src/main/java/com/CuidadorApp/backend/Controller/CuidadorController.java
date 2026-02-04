package com.CuidadorApp.backend.Controller;



import com.CuidadorApp.backend.Model.Cuidador;
import com.CuidadorApp.backend.Repository.CuidadorRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/cuidadores")
public class CuidadorController {

    private final CuidadorRepository cuidadorRepository;

    public CuidadorController(CuidadorRepository cuidadorRepository) {
        this.cuidadorRepository = cuidadorRepository;
    }

    @GetMapping
    public List<Cuidador> getAll() {
        return cuidadorRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Cuidador> getById(@PathVariable Long id) {
        return cuidadorRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Cuidador create(@RequestBody Cuidador cuidador) {
        return cuidadorRepository.save(cuidador);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Cuidador> update(@PathVariable Long id, @RequestBody Cuidador cuidador) {
        return cuidadorRepository.findById(id)
                .map(existing -> {
                    existing.setNombre(cuidador.getNombre());
                    existing.setDocumento(cuidador.getDocumento());
                    existing.setTelefono(cuidador.getTelefono());
                    existing.setActivo(cuidador.isActivo());
                    return ResponseEntity.ok(cuidadorRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> delete(@PathVariable Long id) {
        return cuidadorRepository.findById(id)
                .map(existing -> {
                    cuidadorRepository.delete(existing);
                    return ResponseEntity.noContent().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
