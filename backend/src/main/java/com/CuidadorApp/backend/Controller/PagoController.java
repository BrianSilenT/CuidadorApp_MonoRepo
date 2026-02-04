package com.CuidadorApp.backend.Controller;



import com.CuidadorApp.backend.Model.Pago;
import com.CuidadorApp.backend.Repository.PagoRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/pagos")
public class PagoController {

    private final PagoRepository pagoRepository;

    public PagoController(PagoRepository pagoRepository) {
        this.pagoRepository = pagoRepository;
    }

    @GetMapping
    public List<Pago> getAll() {
        return pagoRepository.findAll();
    }

    @PostMapping
    public Pago create(@RequestBody Pago pago) {
        return pagoRepository.save(pago);
    }


}

