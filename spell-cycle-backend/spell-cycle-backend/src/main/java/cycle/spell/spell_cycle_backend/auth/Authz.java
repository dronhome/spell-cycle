package cycle.spell.spell_cycle_backend.auth;

import cycle.spell.spell_cycle_backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Component("authz")
@RequiredArgsConstructor
public class Authz {
    private final UserRepository users;

    public boolean isSelfById(Long targetId, Authentication auth) {
        String currentEmail = auth.getName();
        return users.findEmailById(targetId)
                .map(email -> email.equalsIgnoreCase(currentEmail))
                .orElse(false);
    }
}

