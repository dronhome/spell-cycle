package cycle.spell.spell_cycle_backend;

import lombok.Data;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;

@Component
@RequiredArgsConstructor
public class AppEnv {

    @Value("${app.env:dev}")
    private String appEnv;

    @Getter
    @Value("${rt.ttl.days}")
    private int rtTtlDays;

    public boolean isProd() {
        return "prod".equalsIgnoreCase(appEnv);
    }

}