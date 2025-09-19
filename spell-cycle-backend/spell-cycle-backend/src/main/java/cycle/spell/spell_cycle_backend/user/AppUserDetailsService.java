package cycle.spell.spell_cycle_backend.user;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class AppUserDetailsService implements UserDetailsService {
    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        var u = userRepository.findByEmail(email).orElseThrow(() -> new UsernameNotFoundException(email));

        Set<GrantedAuthority> auths = u.getRoles().stream()
                .flatMap(r -> r.getPermissions().stream())
                .map(p -> new SimpleGrantedAuthority(p.getName()))
                .collect(Collectors.toSet());

        u.getRoles().forEach(r -> auths.add(new SimpleGrantedAuthority("ROLE_" + r.getName())));

        return org.springframework.security.core.userdetails.User
                .withUsername(u.getEmail())
                .password(u.getPassword())
                .authorities(auths)
                .accountLocked(!u.isActive())
                .build();
    }
}
