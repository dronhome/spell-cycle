package cycle.spell.spell_cycle_backend.auth.reqResObjects;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TokenPair {
    private String jwtToken;
    private String refreshToken;
}
