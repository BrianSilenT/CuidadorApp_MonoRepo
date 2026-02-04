package com.CuidadorApp.backend.Controller;



import com.CuidadorApp.backend.Model.Guardia;
import com.CuidadorApp.backend.Repository.GuardiaRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/guardias")
public class GuardiaController {

    private final GuardiaRepository guardiaRepository;

    public GuardiaController(GuardiaRepository guardiaRepository){
        this.guardiaRepository = guardiaRepository;
    }

    @GetMapping
    public List<Guardia> getAll(){
        return guardiaRepository.findAll();
    }

    @PostMapping
    public Guardia create(@RequestBody Guardia guardia){
        return guardiaRepository.save(guardia);
    }
}
