package cycle.spell.spell_cycle_backend.auth.refreshToken;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {
    private final RefreshTokenRepository repo;
    private final SecureRandom random = new SecureRandom();

    public String issue(String email, Duration ttl) {
        String token = randomToken();
        String hash = hash(token);
        var rt = new RefreshToken();
        rt.setUserEmail(email);
        rt.setTokenHash(hash);
        rt.setExpiresAt(Instant.now().plus(ttl));
        repo.save(rt);
        return token;
    }

    public RefreshToken validateUsable(String plaintext) {
        var h = hash(plaintext);
        var rt = repo.findByTokenHash(h).orElseThrow();
        if (rt.isRevoked() || rt.getExpiresAt().isBefore(Instant.now())) {
            throw new RuntimeException("Invalid refresh");
        }
        return rt;
    }

    @Transactional
    public String rotate(RefreshToken oldRt, String email, Duration ttl) {
        oldRt.setRevoked(true);
        oldRt.setReplacedAt(Instant.now());
        String newToken = issue(email, ttl);
        oldRt.setReplacedByHash(hash(newToken));
        repo.save(oldRt);
        return newToken;
    }

    @Transactional
    public void revokeAllForUser(String email) {
        repo.revokeAllForUser(email);
    }

    private String randomToken() {
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
    private static String hash(String token) {
        try {
            var md = MessageDigest.getInstance("SHA-256");
            return Base64.getEncoder().encodeToString(md.digest(token.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) { throw new RuntimeException(e); }
    }
}
