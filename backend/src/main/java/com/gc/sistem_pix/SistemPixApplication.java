package com.gc.sistem_pix;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SistemPixApplication {

    public static void main(String[] args) {
        SpringApplication.run(SistemPixApplication.class, args);
    }

}
