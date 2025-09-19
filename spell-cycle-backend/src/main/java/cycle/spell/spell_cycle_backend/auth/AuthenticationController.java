package cycle.spell.spell_cycle_backend.auth;

import cycle.spell.spell_cycle_backend.AppEnv;
import cycle.spell.spell_cycle_backend.auth.reqResObjects.AuthenticationRequest;
import cycle.spell.spell_cycle_backend.auth.reqResObjects.TokenPair;
import cycle.spell.spell_cycle_backend.auth.reqResObjects.RegisterRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthenticationController {
    private final AuthenticationService authenticationService;
    private final CookieUtil cookieUtil;
    private final AppEnv appEnv;

    public record SessionDto(String email) {}

    @PostMapping("/register")
    public ResponseEntity<TokenPair> register(
            @RequestBody RegisterRequest request
    ) {
        return ResponseEntity.ok(authenticationService.register(request));
    }

    @PostMapping("/authenticate")
    public ResponseEntity<Void> authenticate(
            @RequestBody AuthenticationRequest request,
            HttpServletResponse response
    ) {
        var tokens = authenticationService.authenticate(request);
        cookieUtil.setAccessCookie(response, tokens.getJwtToken(), appEnv.isProd());
        cookieUtil.setRefreshCookie(response, tokens.getRefreshToken(), appEnv.isProd());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/refresh")
    public ResponseEntity<Void> refresh(@CookieValue("refresh_token") String rt, HttpServletResponse res) {
        if (rt == null || rt.isBlank()) {
            return ResponseEntity.status(401).build();
        }

        try {
            var tokens = authenticationService.refresh(rt);

            cookieUtil.setRefreshCookie(res, tokens.getRefreshToken(), appEnv.isProd());
            cookieUtil.setAccessCookie(res, tokens.getJwtToken(), appEnv.isProd());

            return ResponseEntity.ok().build();
        } catch (Exception e) {
            cookieUtil.clearCookie(res, "refresh_token", "/api/v1/auth", appEnv.isProd());
            cookieUtil.clearCookie(res, "access_token", "/", appEnv.isProd());

            return ResponseEntity.status(401).build();
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse res, @AuthenticationPrincipal UserDetails user) {
        authenticationService.logout(user);
        cookieUtil.clearCookie(res, "access_token", "/", appEnv.isProd());
        cookieUtil.clearCookie(res, "refresh_token", "/api/v1/auth", appEnv.isProd());
        return ResponseEntity.noContent().build();
    }

    @GetMapping(value = "/session", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<SessionDto> session(@AuthenticationPrincipal UserDetails user) {
        if (user == null) System.out.println("user is null");
        if (user == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(new SessionDto(user.getUsername()));
    }
}
