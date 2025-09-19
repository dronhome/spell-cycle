package cycle.spell.spell_cycle_backend.auth;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;

import java.time.Duration;

public class CookieUtil {
    public void setAccessCookie(HttpServletResponse res, String jwt, boolean prod) {
        var c = ResponseCookie.from("access_token", jwt)
                .httpOnly(true)
                .secure(prod)
                .sameSite(prod ? "None" : "Strict")
                .path("/")
                .maxAge(Duration.ofMinutes(10))
                .build();
        res.addHeader(HttpHeaders.SET_COOKIE, c.toString());
    }

    public void setRefreshCookie(HttpServletResponse res, String token, boolean prod) {
        var c = ResponseCookie.from("refresh_token", token)
                .httpOnly(true)
                .secure(prod)
                .sameSite(prod ? "None" : "Strict")
                .path("/api/v1/auth")
                .maxAge(Duration.ofDays(14))
                .build();
        res.addHeader(HttpHeaders.SET_COOKIE, c.toString());
    }

    public void clearCookie(HttpServletResponse res, String name, String path, boolean prod) {
        var c = ResponseCookie.from(name, "")
                .httpOnly(true)
                .secure(prod)
                .sameSite(prod ? "None" : "Strict")
                .path(path)
                .maxAge(0)
                .build();
        res.addHeader(HttpHeaders.SET_COOKIE, c.toString());
    }

}
