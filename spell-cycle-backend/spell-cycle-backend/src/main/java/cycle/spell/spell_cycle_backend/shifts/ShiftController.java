package cycle.spell.spell_cycle_backend.shifts;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/shifts")
public class ShiftController {

    @PostMapping
    @PreAuthorize("hasAuthority('users.manage')")
    public Map<String, Boolean> test() {
        return Map.of("works", true);
    }
}
