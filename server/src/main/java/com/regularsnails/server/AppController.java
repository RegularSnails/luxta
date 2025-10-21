package com.regularsnails.server;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class AppController {
    @GetMapping({"/", "/luca"})
    public String index() {
        return "index.html";
    }
}

