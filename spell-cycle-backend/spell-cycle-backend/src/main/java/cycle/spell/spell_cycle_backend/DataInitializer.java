package cycle.spell.spell_cycle_backend;

import cycle.spell.spell_cycle_backend.permission.Permission;
import cycle.spell.spell_cycle_backend.role.Role;
import cycle.spell.spell_cycle_backend.permission.PermissionRepository;
import cycle.spell.spell_cycle_backend.role.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
    private final PermissionRepository permissionRepository;
    private final RoleRepository roleRepository;

    @Override
    public void run(String... args) throws Exception {
        var empView      = ensurePerm("emp.view");
        var empComment   = ensurePerm("emp.comment");
        var skillsAssign = ensurePerm("skills.assign");
        var coachEval    = ensurePerm("coach.evaluate");
        var shiftsPlan   = ensurePerm("shifts.plan");
        var usersCreate  = ensurePerm("users.create");
        var usersManage  = ensurePerm("users.manage");

        ensureRole("TRAINEE",  Set.of(empView));
        ensureRole("CREW",     Set.of(empView));
        ensureRole("TRAINER",  Set.of(empView, empComment, skillsAssign));
        ensureRole("MANAGER",  Set.of(empView, empComment, skillsAssign, coachEval));
        ensureRole("PLANNER",  Set.of(shiftsPlan));
        ensureRole("SUPERUSER",Set.of(usersCreate, usersManage));
    }

    private Permission ensurePerm(String name) {
        return permissionRepository.findByName(name).orElseGet(() -> {
            var p = new Permission(); p.setName(name); return permissionRepository.save(p);
        });
    }
    private void ensureRole(String name, Set<Permission> perms) {
        roleRepository.findByName(name).orElseGet(() -> {
            var r = new Role();
            r.setName(name);
            r.setPermissions(perms);
            return roleRepository.save(r);
        });
    }
}
