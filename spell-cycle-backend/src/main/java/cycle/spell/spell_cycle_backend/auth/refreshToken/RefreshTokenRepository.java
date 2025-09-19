package cycle.spell.spell_cycle_backend.auth.refreshToken;

import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByTokenHash(String tokenHash);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
     update RefreshToken rt
        set rt.revoked = true
      where rt.userEmail = :email
        and rt.revoked = false
     """)
    void revokeAllForUser(@Param("email") String email);
}
