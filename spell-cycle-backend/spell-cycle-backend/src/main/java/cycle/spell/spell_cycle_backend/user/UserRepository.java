package cycle.spell.spell_cycle_backend.user;

import jakarta.validation.constraints.Email;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    @EntityGraph(attributePaths = "roles")
    Optional<User> findByEmail(String email);
    @Query("select u.email from User u where u.id = :id")
    Optional<String> findEmailById(@Param("id") Long id);

    @Query("select r.name from User u join u.roles r where u.email = :email")
    List<String> findRoleNamesByEmail(@Param("email") String email);
}
