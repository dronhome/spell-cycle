package cycle.spell.spell_cycle_backend.auth;

import cycle.spell.spell_cycle_backend.AppEnv;
import cycle.spell.spell_cycle_backend.auth.AccessToken.AccessTokenService;
import cycle.spell.spell_cycle_backend.auth.refreshToken.RefreshTokenService;
import cycle.spell.spell_cycle_backend.auth.reqResObjects.AuthenticationRequest;
import cycle.spell.spell_cycle_backend.auth.reqResObjects.TokenPair;
import cycle.spell.spell_cycle_backend.auth.reqResObjects.RegisterRequest;
import cycle.spell.spell_cycle_backend.role.Role;
import cycle.spell.spell_cycle_backend.role.RoleRepository;
import cycle.spell.spell_cycle_backend.user.User;
import cycle.spell.spell_cycle_backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthenticationService {
    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final AccessTokenService accessTokenService;
    private final AuthenticationManager authenticationManager;
    private final RefreshTokenService refreshTokenService;
    private final AppEnv appEnv;
    private final RoleRepository roleRepository;

    public TokenPair register(RegisterRequest request) {
        Set<Role> roleEntities = request.getRoles().stream()
                .map(roleName -> roleRepository.findByName(roleName)
                        .orElseThrow(() -> new IllegalArgumentException("Unknown role: " + roleName)))
                .collect(Collectors.toSet());

        var user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .roles(roleEntities)
                .active(true)
                .build();
        repository.save(user);

        Map<String, Object> claims = new HashMap<>();
        claims.put("uid", user.getId());
        claims.put("roles", roleEntities.stream().map(Role::getName).toList());

        String jwtToken = accessTokenService.generateToken(claims, user.getEmail());

        return TokenPair.builder()
                .jwtToken(jwtToken)
                .build();
    }

    @Transactional
    public TokenPair authenticate(AuthenticationRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );
        var user = repository.findByEmail(request.getEmail())
                .orElseThrow();

        System.out.println(user);

        List<String> roleNames = repository.findRoleNamesByEmail(user.getEmail());

        var claims = buildClaims(user, roleNames);

        String jwtToken = accessTokenService.generateToken(claims, user.getEmail());
        var refreshToken = refreshTokenService.issue(user.getEmail(), Duration.ofDays(appEnv.getRtTtlDays()));

        return TokenPair.builder()
                .jwtToken(jwtToken)
                .refreshToken(refreshToken)
                .build();
    }

    @Transactional
    public TokenPair refresh(String rt) {
        var valid = refreshTokenService.validateUsable(rt);
        var user  = repository.findByEmail(valid.getUserEmail()).orElseThrow();

        List<String> roleNames = repository.findRoleNamesByEmail(user.getEmail());

        var claims = buildClaims(user, roleNames);

        var newRt = refreshTokenService.rotate(valid, user.getEmail(), Duration.ofDays(appEnv.getRtTtlDays()));
        var newAccess = accessTokenService.generateToken(claims, user.getEmail());

        return TokenPair.builder()
                .jwtToken(newAccess)
                .refreshToken(newRt)
                .build();
    }

    public void logout(UserDetails user) {
        if (user != null) refreshTokenService.revokeAllForUser(user.getUsername());
    }

    private Map<String, Object> buildClaims(User user, List<String> roleNames) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("uid", user.getId());
        claims.put("roles", roleNames);
        return claims;
    }
}
