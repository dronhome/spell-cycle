package cycle.spell.spell_cycle_backend.auth.filters;

import cycle.spell.spell_cycle_backend.auth.AccessToken.AccessTokenService;
import cycle.spell.spell_cycle_backend.user.AppUserDetailsService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@AllArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final AccessTokenService accessTokenService;
    private final AppUserDetailsService appUserDetailsService;

    @Override
    protected void doFilterInternal(
            @NotNull HttpServletRequest request,
            @NotNull HttpServletResponse response,
            @NotNull FilterChain filterChain
    ) throws ServletException, IOException {

        String jwt = resolveJwt(request);

        if (jwt != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                String username = accessTokenService.extractUsername(jwt);
                if (username != null) {
                    UserDetails user = appUserDetailsService.loadUserByUsername(username);

                    if (accessTokenService.isTokenValid(jwt, user)) {
                        var auth = new UsernamePasswordAuthenticationToken(
                                user,
                                null,
                                user.getAuthorities()
                        );
                        auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(auth);

                        // Debug log
                        System.out.println("Authenticated as " + username + " with " + user.getAuthorities());
                    }
                }
            } catch (Exception e) {
                System.out.println("JWT validation failed: " + e.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }

    private String resolveJwt(HttpServletRequest request) {
        // Header first
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        // Then cookie
        if (request.getCookies() != null) {
            for (Cookie c : request.getCookies()) {
                if ("ACCESS_TOKEN".equalsIgnoreCase(c.getName())) {
                    return c.getValue();
                }
            }
        }
        return null;
    }
}
